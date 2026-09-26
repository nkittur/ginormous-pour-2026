// Ranking and matchmaking. Ratings are replayed from the match log every
// time, so the result is the same on every phone and never depends on a
// racy read-modify-write against the database.

export const START_RATING = 1000;
const K_BY_MARGIN = { 1: 16, 2: 28, 3: 44 };

export const MARGINS = [
  { value: 1, label: 'CLOSE CALL', blurb: 'Barely edged it.' },
  { value: 2, label: 'BEATDOWN', blurb: 'Clear winner.' },
  { value: 3, label: 'TOTAL DEMOLITION', blurb: 'Not even close.' },
];

/** Compute standings for every beer. Returns a Map beerId -> stats. */
export function computeStandings(beers, matches) {
  const stats = new Map();
  for (const b of beers) {
    stats.set(b.id, { beer: b, rating: START_RATING, wins: 0, losses: 0, played: 0, streak: 0, kos: 0 });
  }
  const ordered = [...matches].sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0));
  for (const m of ordered) {
    const a = stats.get(m.beer_a);
    const b = stats.get(m.beer_b);
    if (!a || !b) continue;
    const winner = m.winner_id === m.beer_a ? a : m.winner_id === m.beer_b ? b : null;
    if (!winner) continue;
    const loser = winner === a ? b : a;
    const k = K_BY_MARGIN[m.margin] || K_BY_MARGIN[2];
    const expectedWin = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
    const delta = k * (1 - expectedWin);
    winner.rating += delta;
    loser.rating -= delta;
    winner.wins++; winner.played++; winner.streak = Math.max(1, winner.streak + 1);
    if (m.margin === 3) winner.kos++;
    loser.losses++; loser.played++; loser.streak = Math.min(-1, loser.streak - 1);
  }
  return stats;
}

/** Ranked array of stats, best first. */
export function rankBeers(beers, matches) {
  const stats = computeStandings(beers, matches);
  return [...stats.values()].sort((x, y) =>
    y.rating - x.rating || y.wins - x.wins || x.losses - y.losses || (x.beer.created_at < y.beer.created_at ? -1 : 1));
}

function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

/**
 * Pick the next two beers for a rater. Favors beers with the fewest
 * matches, pairs that have not met, pairs this rater has not judged, and
 * (once ratings exist) beers that are close in rating so the round is
 * informative. Returns [beerA, beerB] or null if fewer than two beers.
 */
export function drawPair(beers, matches, raterId, lastPairIds = null) {
  if (beers.length < 2) return null;
  const stats = computeStandings(beers, matches);
  const pairCount = new Map();
  const raterPairs = new Set();
  for (const m of matches) {
    const k = pairKey(m.beer_a, m.beer_b);
    pairCount.set(k, (pairCount.get(k) || 0) + 1);
    if (m.rater_id === raterId) raterPairs.add(k);
  }
  const lastKey = lastPairIds ? pairKey(lastPairIds[0], lastPairIds[1]) : null;
  const scored = [];
  for (let i = 0; i < beers.length; i++) {
    for (let j = i + 1; j < beers.length; j++) {
      const a = beers[i]; const b = beers[j];
      const k = pairKey(a.id, b.id);
      const sa = stats.get(a.id); const sb = stats.get(b.id);
      let score = sa.played + sb.played;
      score += 3 * (pairCount.get(k) || 0);
      if (raterPairs.has(k)) score += 8;
      if (k === lastKey) score += 100;
      score += Math.abs(sa.rating - sb.rating) / 150;
      score += Math.random() * 0.75; // tie-break jitter
      scored.push({ a, b, score });
    }
  }
  scored.sort((x, y) => x.score - y.score);
  const best = scored[0];
  const pool = scored.filter(p => p.score <= best.score + 1.25);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return Math.random() < 0.5 ? [pick.a, pick.b] : [pick.b, pick.a];
}

export function ratingChange(matches, beers, match) {
  // Rating delta the winner earned from one match, given the log before it.
  const before = computeStandings(beers, matches.filter(m => m.id !== match.id && m.created_at <= match.created_at));
  const after = computeStandings(beers, matches.filter(m => m.created_at <= match.created_at));
  const w = match.winner_id;
  return Math.round((after.get(w)?.rating || 0) - (before.get(w)?.rating || 0));
}
