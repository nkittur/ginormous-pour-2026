import { MONSTERS, MONSTER_IDS, SPRITES, monsterEl, spriteEl, spriteURL, drawSkyline } from './sprites.js';
import { createStore } from './store.js';
import { rankBeers, computeStandings, drawPair, MARGINS, ratingChange } from './elo.js';

const $ = (sel, root = document) => root.querySelector(sel);
const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, reducedMotion ? 0 : ms));

const SAMPLE_BEERS = [
  { name: 'Skyscraper Stout', brewery: 'Rooftop Brewing', style: 'Imperial Stout', brought_by: 'Sample', monster: 'kongo' },
  { name: 'Sewer Sour', brewery: 'Undercity Ales', style: 'Gose', brought_by: 'Sample', monster: 'ratzilla' },
  { name: 'Cold Blooded Lager', brewery: 'Reptile House', style: 'Pilsner', brought_by: 'Sample', monster: 'gilla' },
  { name: 'Full Moon IPA', brewery: 'Howler Brewing', style: 'West Coast IPA', brought_by: 'Sample', monster: 'wulf' },
  { name: 'Porch Light Pale', brewery: 'Mothball Brewery', style: 'Pale Ale', brought_by: 'Sample', monster: 'mothrax' },
  { name: 'Ice Age Helles', brewery: 'Glacier Brewing', style: 'Helles', brought_by: 'Sample', monster: 'yeti' },
];

const app = {
  store: null,
  data: { beers: [], raters: [], matches: [] },
  rater: null,
  round: 0,
  lastPair: null,
  view: null,
};

try { app.rater = JSON.parse(localStorage.getItem('gp:rater') || 'null'); } catch { app.rater = null; }
function saveRater(r) { app.rater = r; try { localStorage.setItem('gp:rater', JSON.stringify(r)); } catch { /* ignore */ } }

/* ------------------------------------------------------------------ */
/* Boot                                                               */
/* ------------------------------------------------------------------ */
async function boot() {
  const root = $('#app');
  root.replaceChildren(h('p', { class: 'muted', style: 'text-align:center' }, 'Loading the city…'));
  decorate();
  app.store = await createStore();
  app.store.subscribe(state => {
    app.data = state;
    if (app.view && app.view.onData) app.view.onData(state);
  });
  $('#mode').replaceChildren(
    h('span', { class: 'dot' }),
    app.store.mode === 'supabase' ? 'Live: everyone sees the same fight' : 'Local mode: scores stay on this device',
  );
  $('#mode').classList.toggle('local', app.store.mode !== 'supabase');
  window.addEventListener('hashchange', route);
  route();
}

function decorate() {
  const sky = $('#skyline');
  const c = sky.querySelector('canvas');
  c.width = Math.min(1200, Math.ceil(innerWidth / 2) * 2);
  c.height = 120;
  drawSkyline(c, 11);
}
function heli(delay = 0) {
  const el = spriteEl('heli', 3);
  el.classList.add('heli');
  el.style.animationDelay = delay + 's';
  return el;
}

function route() {
  const name = (location.hash || '#home').slice(1);
  const views = { home, bring, judge, round, tower, roster };
  const fn = views[name] || home;
  if ((name === 'round') && !app.rater) { location.hash = '#judge'; return; }
  app.view = null;
  const root = $('#app');
  root.replaceChildren();
  fn(root);
  window.scrollTo({ top: 0 });
}
const go = hash => { if (location.hash === hash) route(); else location.hash = hash; };

/* ------------------------------------------------------------------ */
/* Home                                                               */
/* ------------------------------------------------------------------ */
function home(root) {
  const hero = h('div', { class: 'hero' },
    h('div', { class: 'moon' }),
    h('div', { class: 'lineup' }),
    h('div', { class: 'roof-strip', style: `background-image:url(${spriteURL('floor', 4)})` }),
  );
  const tank = spriteEl('tank', 3); tank.classList.add('tank'); hero.append(tank, heli(-4));
  const stats = h('div', { class: 'stats' });
  const actions = h('div', { class: 'stack' });
  const notice = h('div');

  const render = ({ beers, matches, raters }) => {
    const lineup = hero.querySelector('.lineup');
    const ids = beers.length ? [...new Set(beers.map(b => b.monster))].slice(-4) : ['kongo', 'gilla', 'wulf'];
    lineup.replaceChildren(...ids.map((id, i) => monsterEl(id, 4, { flip: i % 2 === 1 })));
    stats.replaceChildren(
      statTile(beers.length, beers.length === 1 ? 'beer in the city' : 'beers in the city'),
      statTile(matches.length, matches.length === 1 ? 'round fought' : 'rounds fought'),
      statTile(raters.length, raters.length === 1 ? 'judge' : 'judges'),
    );
    const canFight = beers.length >= 2;
    actions.replaceChildren(
      h('a', { class: 'btn gold', href: '#bring' }, spriteEl('mug', 3), 'BRING A BEER'),
      h('a', { class: 'btn primary', href: canFight ? (app.rater ? '#round' : '#judge') : '#bring' },
        canFight ? (app.rater ? `FIGHT! (AS ${app.rater.name.toUpperCase()})` : 'RATE BEERS') : 'NEED 2 BEERS TO FIGHT'),
      h('div', { class: 'btn-row two' },
        h('a', { class: 'btn ghost', href: '#tower' }, 'THE TOWER'),
        h('a', { class: 'btn ghost', href: '#roster' }, 'BEER ROSTER'),
      ),
    );
    notice.replaceChildren();
    if (app.rater) {
      notice.append(h('p', { class: 'muted', style: 'text-align:center;margin:0' },
        `Judging as ${app.rater.name}. `,
        h('button', { class: 'chip', onclick: () => { saveRater(null); route(); } }, 'Not you?')));
    }
    if (app.store.mode === 'local' && beers.length === 0) {
      notice.append(h('div', { class: 'notice' },
        'No backend is connected, so this copy keeps everything on this device. Try it with a sample lineup. ',
        h('button', { class: 'chip', onclick: async () => { for (const b of SAMPLE_BEERS) await app.store.addBeer(b); } }, 'Load sample beers')));
    }
  };
  root.append(
    hero,
    h('section', { class: 'stack', style: 'margin-top:14px' },
      h('p', { style: 'text-align:center;margin:0' }, 'Bring a beer. Pick your monster. Judge head-to-head rounds until only one is left standing on the tower.'),
      stats, actions, notice),
  );
  app.view = { onData: render };
  render(app.data);
}

function statTile(n, label) {
  return h('div', { class: 'stat' }, h('div', { class: 'big num' }, String(n)), h('div', { class: 'lbl' }, label));
}

/* ------------------------------------------------------------------ */
/* Bring a beer                                                       */
/* ------------------------------------------------------------------ */
function bring(root) {
  let monster = MONSTER_IDS[Math.floor(Math.random() * MONSTER_IDS.length)];
  const blurb = h('div', { class: 'monster-blurb' });
  const grid = h('div', { class: 'monster-grid', role: 'group', 'aria-label': 'Choose a monster' });
  const renderGrid = () => {
    grid.replaceChildren(...MONSTER_IDS.map(id => h('button', {
      type: 'button', class: 'monster-pick', 'aria-pressed': String(id === monster),
      onclick: () => { monster = id; renderGrid(); },
    }, monsterEl(id, 3), h('span', { class: 'nm' }, MONSTERS[id].name))));
    blurb.textContent = `${MONSTERS[monster].name}, ${MONSTERS[monster].title}. ${MONSTERS[monster].flavor}`;
  };
  renderGrid();

  const err = h('div', { class: 'notice error', hidden: true });
  const submit = h('button', { class: 'btn primary', type: 'submit' }, 'RELEASE THE BEER');
  const form = h('form', { class: 'stack', onsubmit: async e => {
    e.preventDefault();
    const f = new FormData(form);
    const beer = {
      name: String(f.get('name') || '').trim(),
      brewery: String(f.get('brewery') || '').trim() || null,
      style: String(f.get('style') || '').trim() || null,
      brought_by: String(f.get('brought_by') || '').trim() || null,
      monster,
    };
    if (!beer.name) { err.textContent = 'Give the beer a name first.'; err.hidden = false; return; }
    submit.disabled = true; submit.textContent = 'RELEASING…';
    try {
      await app.store.addBeer(beer);
      try { localStorage.setItem('gp:bringer', beer.brought_by || ''); } catch { /* ignore */ }
      showEntered(root, beer);
    } catch (ex) {
      err.textContent = 'Could not save the beer: ' + ex.message; err.hidden = false;
      submit.disabled = false; submit.textContent = 'RELEASE THE BEER';
    }
  } },
    h('label', { class: 'field' }, h('span', null, 'BEER NAME'), h('input', { type: 'text', name: 'name', id: 'beer-name', required: true, placeholder: 'Skyscraper Stout', autocomplete: 'off', maxlength: '60' })),
    h('label', { class: 'field' }, h('span', null, 'BREWERY'), h('input', { type: 'text', name: 'brewery', id: 'beer-brewery', placeholder: 'Rooftop Brewing', autocomplete: 'off', maxlength: '60' })),
    h('label', { class: 'field' }, h('span', null, 'STYLE'), h('input', { type: 'text', name: 'style', id: 'beer-style', placeholder: 'Imperial Stout, 9.5%', autocomplete: 'off', maxlength: '60' })),
    h('label', { class: 'field' }, h('span', null, 'BROUGHT BY'), h('input', { type: 'text', name: 'brought_by', id: 'beer-by', placeholder: 'Your name', autocomplete: 'off', maxlength: '40', value: safeGet('gp:bringer') || (app.rater ? app.rater.name : '') })),
    h('div', null, h('h3', null, 'PICK ITS MONSTER'), grid, blurb),
    err,
    submit,
    h('a', { class: 'btn ghost', href: '#home' }, 'BACK'),
  );
  root.append(h('h2', null, 'Bring a beer'), h('p', { class: 'muted' }, 'Every beer stomps into the city as a monster. Name it, claim it, pick its form.'), form);
}
function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }

function showEntered(root, beer) {
  const m = MONSTERS[beer.monster];
  root.replaceChildren(
    h('div', { class: 'panel enter-city' },
      monsterEl(beer.monster, 7),
      h('div', { class: 'eyebrow' }, `${m.name} HAS ENTERED THE CITY`),
      h('div', { style: 'font-size:28px;line-height:1.1' }, beer.name),
      h('div', { class: 'muted' }, [beer.brewery, beer.style].filter(Boolean).join(' · ')),
    ),
    h('div', { class: 'stack', style: 'margin-top:14px' },
      h('a', { class: 'btn gold', href: '#bring', onclick: e => { e.preventDefault(); go('#bring'); } }, 'BRING ANOTHER'),
      h('a', { class: 'btn primary', href: app.rater ? '#round' : '#judge' }, 'START RATING'),
      h('a', { class: 'btn ghost', href: '#home' }, 'HOME'),
    ),
  );
  window.scrollTo({ top: 0 });
}

/* ------------------------------------------------------------------ */
/* Judge sign-in                                                      */
/* ------------------------------------------------------------------ */
function judge(root) {
  const input = h('input', { type: 'text', name: 'rater', id: 'rater-name', placeholder: 'Your name', autocomplete: 'off', maxlength: '40', value: app.rater ? app.rater.name : (safeGet('gp:bringer') || '') });
  const err = h('div', { class: 'notice error', hidden: true });
  const chips = h('div', { class: 'chips' });
  const renderChips = ({ raters }) => {
    chips.replaceChildren(...raters.slice(-12).map(r => h('button', { type: 'button', class: 'chip', onclick: () => { input.value = r.name; } }, r.name)));
  };
  const form = h('form', { class: 'stack', onsubmit: async e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) { err.textContent = 'The city needs to know who is judging.'; err.hidden = false; return; }
    try {
      const rater = await app.store.addRater(name);
      saveRater(rater);
      app.round = 0; app.lastPair = null;
      go('#round');
    } catch (ex) { err.textContent = 'Could not sign in: ' + ex.message; err.hidden = false; }
  } },
    h('label', { class: 'field' }, h('span', null, 'JUDGE NAME'), input),
    h('div', null, h('h3', null, 'ALREADY IN THE CITY'), chips),
    err,
    h('button', { class: 'btn primary', type: 'submit' }, 'ENTER THE CITY'),
    h('a', { class: 'btn ghost', href: '#home' }, 'BACK'),
  );
  root.append(h('h2', null, "Who's judging?"), h('p', { class: 'muted' }, 'Each round hands you two beers. Drink both, pick the winner, watch the loser get knocked off the roof. Play as many rounds as you like.'), form);
  app.view = { onData: renderChips };
  renderChips(app.data);
}

/* ------------------------------------------------------------------ */
/* A round                                                            */
/* ------------------------------------------------------------------ */
function round(root) {
  const { beers, matches } = app.data;
  if (beers.length < 2) {
    root.append(h('h2', null, 'Not enough beers'), h('p', null, 'The city needs at least two beers before a fight can start.'),
      h('div', { class: 'stack' }, h('a', { class: 'btn gold', href: '#bring' }, 'BRING A BEER'), h('a', { class: 'btn ghost', href: '#home' }, 'HOME')));
    return;
  }
  const pair = drawPair(beers, matches, app.rater.id, app.lastPair);
  app.round += 1;
  app.lastPair = [pair[0].id, pair[1].id];
  const [A, B] = pair;
  let picked = null;
  let locked = false;

  const arena = h('div', { class: 'arena' },
    h('div', { class: 'backdrop' }, backdropCanvas()),
    h('div', { class: 'roofline' }),
    h('div', { class: 'rooftop', style: `background-image:url(${spriteURL('floor', 4)})` }),
    heli(-11),
  );
  const fA = h('div', { class: 'fighter left', 'data-side': 'a' }, monsterEl(A.monster, 5), h('div', { class: 'tag' }, MONSTERS[A.monster].name));
  const fB = h('div', { class: 'fighter right', 'data-side': 'b' }, monsterEl(B.monster, 5, { flip: true }), h('div', { class: 'tag' }, MONSTERS[B.monster].name));
  const vs = h('div', { class: 'vs' }, 'VS');
  arena.append(fA, fB, vs);

  const cardA = beerCard(A, () => pick('a'));
  const cardB = beerCard(B, () => pick('b'));
  const hint = h('p', { class: 'hint' }, 'Drink both. Tap the beer that wins.');
  const marginBox = h('div', { class: 'margin-pick stack', hidden: true });
  const result = h('div', { class: 'result', hidden: true });

  function pick(side) {
    if (locked) return;
    picked = side;
    cardA.setAttribute('aria-pressed', String(side === 'a'));
    cardB.setAttribute('aria-pressed', String(side === 'b'));
    fA.classList.toggle('picked', side === 'a');
    fB.classList.toggle('picked', side === 'b');
    const winner = side === 'a' ? A : B;
    hint.textContent = `${winner.name} wins. How badly?`;
    marginBox.hidden = false;
    marginBox.replaceChildren(...MARGINS.map((m, i) => h('button', { type: 'button', class: 'btn' + (i === 2 ? ' primary' : ''), onclick: () => finish(m.value) },
      h('span', null, m.label), h('small', null, m.blurb))));
    marginBox.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  async function finish(margin) {
    if (locked || !picked) return;
    locked = true;
    marginBox.hidden = true;
    const winner = picked === 'a' ? A : B;
    const loser = picked === 'a' ? B : A;
    const winF = picked === 'a' ? fA : fB;
    const loseF = picked === 'a' ? fB : fA;
    const loseCard = picked === 'a' ? cardB : cardA;
    hint.textContent = '';
    let saved = null; let saveError = null;
    const saving = app.store.addMatch({ rater_id: app.rater.id, beer_a: A.id, beer_b: B.id, winner_id: winner.id, margin })
      .then(m => { saved = m; }).catch(e => { saveError = e; });

    // Fight animation.
    vs.remove();
    winF.classList.add('punch');
    arena.classList.add('shake');
    loseF.classList.add('ko');
    await wait(420);
    explode(arena, loseF, margin);
    arena.append(h('div', { class: 'ko-banner' }, margin === 3 ? 'KO!' : margin === 2 ? 'POW!' : 'OOF'));
    loseCard.classList.add('lost');
    await wait(900);
    winF.classList.add('winner-glow');
    await saving;

    const wm = MONSTERS[winner.monster].name; const lm = MONSTERS[loser.monster].name;
    const verb = margin === 3 ? 'demolishes' : margin === 2 ? 'knocks out' : 'edges past';
    const delta = saved ? ratingChange(app.data.matches, app.data.beers, saved) : null;
    result.hidden = false;
    result.replaceChildren(
      h('div', { class: 'line' }, h('b', null, winner.name), ` (${wm}) ${verb} `, h('span', null, loser.name), ` (${lm})`),
      saveError ? h('div', { class: 'notice error' }, 'That round did not save: ' + saveError.message) :
        h('div', { class: 'delta' }, delta !== null ? `+${delta} POWER TO ${wm}` : 'RECORDED'),
      h('div', { class: 'stack' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => go('#round') }, 'NEXT ROUND'),
        h('div', { class: 'btn-row two' },
          h('a', { class: 'btn ghost', href: '#tower' }, "I'M DONE"),
          h('a', { class: 'btn ghost', href: '#home' }, 'HOME')),
      ),
    );
    result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  root.append(
    h('div', { class: 'round-head' }, h('span', null, 'ROUND ', h('b', { class: 'num' }, String(app.round))), h('span', null, 'JUDGE: ', h('b', null, app.rater.name.toUpperCase()))),
    arena,
    h('div', { class: 'cards' }, cardA, cardB),
    hint, marginBox, result,
  );
}

function beerCard(beer, onclick) {
  return h('button', { type: 'button', class: 'beer-card', 'aria-pressed': 'false', onclick },
    h('span', { class: 'mon' }, MONSTERS[beer.monster].name),
    h('span', { class: 'name' }, beer.name),
    h('span', { class: 'sub' }, [beer.brewery, beer.style].filter(Boolean).join(' · ')),
    beer.brought_by ? h('span', { class: 'by' }, 'brought by ' + beer.brought_by) : null,
  );
}

function backdropCanvas() {
  const c = document.createElement('canvas');
  c.width = 480; c.height = 90;
  drawSkyline(c, 3);
  return c;
}

function explode(arena, target, margin) {
  const frames = ['explosion1', 'explosion2', 'explosion3'];
  const r = target.getBoundingClientRect();
  const ar = arena.getBoundingClientRect();
  const count = margin === 3 ? 4 : margin === 2 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const scale = margin === 3 ? 5 : 4;
    const fx = h('div', { class: 'fx' });
    const x = r.left - ar.left + r.width / 2 - 6 * scale + (Math.random() - 0.5) * 50;
    const y = r.top - ar.top + 20 + (Math.random() - 0.5) * 50;
    fx.style.left = x + 'px'; fx.style.top = y + 'px';
    arena.append(fx);
    let f = 0;
    const step = () => {
      if (f >= frames.length) { fx.remove(); return; }
      fx.replaceChildren(spriteEl(frames[f], scale));
      f++;
      setTimeout(step, reducedMotion ? 0 : 160);
    };
    setTimeout(step, i * 110);
  }
}

/* ------------------------------------------------------------------ */
/* Roster                                                             */
/* ------------------------------------------------------------------ */
function roster(root) {
  const list = h('div', { class: 'roster' });
  const render = ({ beers, matches }) => {
    const stats = computeStandings(beers, matches);
    list.replaceChildren(...(beers.length ? beers.map(b => {
      const s = stats.get(b.id);
      return h('div', { class: 'roster-row' },
        monsterEl(b.monster, 3),
        h('div', null, h('div', { class: 'name' }, b.name), h('div', { class: 'sub' }, [b.brewery, b.style, b.brought_by ? 'by ' + b.brought_by : null].filter(Boolean).join(' · '))),
        h('div', { class: 'rec num' }, `${MONSTERS[b.monster].name}`, h('br'), `${s.wins}W ${s.losses}L`));
    }) : [h('p', { class: 'muted' }, 'No beers in the city yet.')]));
  };
  root.append(h('h2', null, 'Beer roster'), list,
    h('div', { class: 'stack', style: 'margin-top:14px' }, h('a', { class: 'btn gold', href: '#bring' }, 'BRING A BEER'), h('a', { class: 'btn ghost', href: '#home' }, 'HOME')));
  app.view = { onData: render };
  render(app.data);
}

/* ------------------------------------------------------------------ */
/* The Tower                                                          */
/* ------------------------------------------------------------------ */
function tower(root) {
  const { beers, matches } = app.data;
  root.append(h('h2', null, 'The final rampage'));
  if (beers.length < 2 || matches.length === 0) {
    root.append(h('p', null, matches.length === 0 && beers.length >= 2 ? 'No rounds have been fought yet. Judge a few rounds and the tower will rise.' : 'The city needs at least two beers and one round before the tower can rise.'),
      h('div', { class: 'stack' }, h('a', { class: 'btn primary', href: beers.length >= 2 ? (app.rater ? '#round' : '#judge') : '#bring' }, beers.length >= 2 ? 'FIGHT A ROUND' : 'BRING A BEER'), h('a', { class: 'btn ghost', href: '#home' }, 'HOME')));
    return;
  }
  const brawl = h('div', { class: 'brawl' }, h('div', { class: 'rooftop', style: `background-image:url(${spriteURL('floor', 3)})` }));
  const ids = beers.map(b => b.monster);
  ids.slice(0, 8).forEach((id, i) => {
    const el = monsterEl(id, 3, { flip: i % 2 === 1 });
    el.classList.add('brawler');
    el.style.left = (4 + (i * 92) / Math.min(8, ids.length)) + '%';
    el.style.animationDelay = (-i * 0.23) + 's';
    el.style.animationDuration = (0.8 + (i % 3) * 0.15) + 's';
    brawl.append(el);
  });
  const intro = h('p', { class: 'muted', style: 'text-align:center' }, `${beers.length} beers. ${matches.length} rounds. One roof.`);
  const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => runFinale() }, 'LET THEM FIGHT');
  const towerBox = h('div', { class: 'tower', hidden: true });
  const report = h('div', { class: 'panel report', hidden: true });
  root.append(brawl, intro, btn, towerBox, report, h('div', { class: 'stack', style: 'margin-top:14px' },
    h('a', { class: 'btn ghost', href: app.rater ? '#round' : '#judge' }, 'KEEP FIGHTING'), h('a', { class: 'btn ghost', href: '#home' }, 'HOME')));

  async function runFinale() {
    btn.disabled = true; btn.textContent = 'RAMPAGE IN PROGRESS…';
    const brawlers = [...brawl.querySelectorAll('.brawler')];
    const t0 = Date.now();
    while (Date.now() - t0 < (reducedMotion ? 0 : 2600)) {
      const target = brawlers[Math.floor(Math.random() * brawlers.length)];
      const fx = h('div', { class: 'fx' });
      fx.style.left = (parseFloat(target.style.left) + (Math.random() * 6 - 3)) + '%';
      fx.style.bottom = (20 + Math.random() * 60) + 'px';
      brawl.append(fx);
      const frames = ['explosion1', 'explosion2', 'explosion3'];
      let f = 0;
      const step = () => { if (f >= frames.length) { fx.remove(); return; } fx.replaceChildren(spriteEl(frames[f++], 3)); setTimeout(step, 120); };
      step();
      if (Math.random() < 0.3) target.style.transform = 'scaleY(0.85)';
      await wait(180);
    }
    brawl.classList.add('done');
    btn.hidden = true;
    intro.hidden = true;
    renderTower();
  }

  function renderTower() {
    const ranked = rankBeers(app.data.beers, app.data.matches);
    const champ = ranked[0];
    towerBox.hidden = false;
    const top = h('div', { class: 'sky-top' });
    const champEl = h('div', { class: 'champ' });
    const crown = spriteEl('crown', 3); crown.classList.add('crown');
    champEl.append(crown, monsterEl(champ.beer.monster, 4));
    const roof = spriteEl('roof', 5); roof.classList.add('roof');
    top.append(champEl, roof, h('div', { class: 'roofline' }));
    towerBox.append(top);
    ranked.forEach((s, i) => {
      const rank = i + 1;
      const damaged = s.losses > s.wins;
      const floor = h('div', { class: `floor rank-${rank}` + (damaged ? ' damaged' : ''), style: `background-image:url(${spriteURL(damaged ? 'floorDamaged' : 'floor', 4)});animation-delay:${Math.min(ranked.length - 1 - i, 20) * 90}ms` });
      if (damaged) { const f = spriteEl('fire1', 2); f.classList.add('fire'); f.style.left = (10 + (i * 37) % 60) + '%'; floor.append(f); }
      const rec = h('div', { class: 'rec num' }, h('b', null, `${s.wins}W ${s.losses}L`), h('br'), `${Math.round(s.rating)} PWR`, s.kos ? [h('br'), `${s.kos} KO`] : null);
      floor.append(h('div', { class: 'card' },
        h('div', { class: 'rank num' + (rank > 3 ? ' low' : '') }, rank <= 3 ? ['1ST', '2ND', '3RD'][i] : String(rank)),
        monsterEl(s.beer.monster, 2),
        h('div', null, h('div', { class: 'name' }, s.beer.name), h('div', { class: 'sub' }, [s.beer.brewery, s.beer.style, s.beer.brought_by ? 'by ' + s.beer.brought_by : null].filter(Boolean).join(' · '))),
        rec));
      towerBox.append(floor);
    });
    towerBox.append(h('div', { class: 'street', style: `background-image:url(${spriteURL('ground', 4)})` }));

    const raterCount = new Set(app.data.matches.map(m => m.rater_id)).size;
    const koKing = [...ranked].sort((a, b) => b.kos - a.kos)[0];
    const busiest = [...ranked].sort((a, b) => b.played - a.played)[0];
    report.hidden = false;
    report.replaceChildren(h('h3', null, 'DAMAGE REPORT'), h('dl', null,
      h('dt', null, 'Champion'), h('dd', null, `${champ.beer.name} (${MONSTERS[champ.beer.monster].name})`),
      h('dt', null, 'Rounds fought'), h('dd', { class: 'num' }, String(app.data.matches.length)),
      h('dt', null, 'Judges'), h('dd', { class: 'num' }, String(raterCount)),
      koKing && koKing.kos ? [h('dt', null, 'Most demolitions'), h('dd', null, `${koKing.beer.name} (${koKing.kos})`)] : null,
      busiest ? [h('dt', null, 'Most rounds'), h('dd', null, `${busiest.beer.name} (${busiest.played})`)] : null,
    ));
    towerBox.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
}

boot();
