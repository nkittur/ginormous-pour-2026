// Pixel-art sprite library for The Ginormous Pour.
// Each sprite is a list of equal-width strings; each character maps to a
// palette color. "." is transparent. Rendered to <canvas> at an integer
// scale with image smoothing off, so pixels stay crisp on any screen.

const BASE = {
  K: '#1b1024', // outline
  W: '#fff7ea', // white
  w: '#c9d6e6', // light shade
  R: '#e0402f', // red
  O: '#ff8a2a', // orange
  Y: '#f6c945', // yellow
  C: '#5ee1ff', // cyan
  S: '#8c8aa5', // smoke light
  s: '#55536b', // smoke dark
  N: '#1a1730', // dark window
  D: '#3c3552', // building wall
  d: '#2a2540', // building wall dark
  T: '#d9a679', // tan
};

export const MONSTERS = {
  kongo: {
    name: 'KONGO', title: 'The Ape', flavor: 'Beats chest. Drinks stout.',
    pal: { B: '#6b3f2a', b: '#4a2a1c' },
    rows: [
      '.....KKKKKK.....',
      '....KbbbbbbK....',
      '...KbBBBBBBbK...',
      '..KbBBTTTTBBbK..',
      '..KBTTTTTTTTBK..',
      '..KBTWKTTWKTBK..',
      '..KBTTTTTTTTBK..',
      '..KBTTKRRRRKTTBK',
      '..KBTTKWRWRKTTBK',
      '...KBTTKKKKTTBK.',
      '..KKKBBBBBBBBKKK',
      '.KBBKBBBBBBBKBBK',
      'KBBKBBTTTTBBKBBK',
      'KBBKBBTTTTBBKBBK',
      'KBTKBBTTTTBBKBTK',
      'KBBKKBBBBBBKKBBK',
      '.KK.KBBBBBBK.KK.',
      '....KBBBBBBK....',
      '...KBBBKKBBBK...',
      '...KKKK..KKKK...',
    ],
  },
  gilla: {
    name: 'GILLA', title: 'The Lizard', flavor: 'Cold-blooded. Prefers lagers.',
    pal: { G: '#3f9a3a', g: '#2a6b28', L: '#b7e07a' },
    rows: [
      '.....KKKKKK.....',
      '....KgGGGGGK....',
      '...KgGGGGGGGKK..',
      '...KGGYKGGGGGGK.',
      '...KGGGGGGGGGGK.',
      '...KGGKRRRRRRGK.',
      '....KGKWKWKWKK..',
      '....KgGGGGGKK...',
      '...KKgGGGGGK....',
      '..KgGKGLLGGGK...',
      '.KgGGKGLLLGGGKK.',
      '.KgGKKGLLLGGGGGK',
      'KgGK.KGLLLGGGKKK',
      'KgK..KGLLLGGGK..',
      'KgK.KKgGLLGGGK..',
      'KggKKggGGGGGGK..',
      '.KgggggKGGKGGK..',
      '..KKKKK.KGGKGGK.',
      '........KGGKKGK.',
      '........KKK.KKK.',
    ],
  },
  wulf: {
    name: 'WULF', title: 'The Wolf', flavor: 'Howls at IPAs.',
    pal: { F: '#8a8f9c', f: '#5c6170', N: '#cfd3da' },
    rows: [
      '..K.......K.....',
      '.KFK.....KFK....',
      '.KFFK...KFFK....',
      '.KFFFKKKFFFFK...',
      '.KFFFFFFFFFFK...',
      '..KFFRKFFRKFFK..',
      '..KFFFFFFFFNNNK.',
      '..KfFFFFFNNNNNNK',
      '...KFFFKKNKRRKK.',
      '...KfFFKWKWKWK..',
      '...KFFFFKKKKK...',
      '..KKFFFFFFFK....',
      '.KFFKFFNNFFFK...',
      'KFFFKFNNNNFFKK..',
      'KFfFKFNNNNFFFFK.',
      'KFFFKKFNNFFFKKK.',
      '.KKK.KFFFFFFK...',
      '.....KFFFKFFK...',
      '....KFFFKKFFFK..',
      '....KKKK..KKKK..',
    ],
  },
  ratzilla: {
    name: 'RATZILLA', title: 'The Rat', flavor: 'Came up through the sewer for a sour.',
    pal: { M: '#8c6f5e', m: '#5e493d', I: '#f0a3b8', N: '#d8c2ae' },
    rows: [
      '.KKK......KKK...',
      'KMIMK....KMIMK..',
      'KMIIMK..KMIIMK..',
      '.KMMMKKKKMMMK...',
      '..KMMMMMMMMMK...',
      '..KMMWKMMWKMMK..',
      '..KMMMMMMMMMMMK.',
      '...KMMMMMMMMMMIK',
      '...KmMMKRRRKMMK.',
      '....KMMKWWKKKK..',
      '....KmMMMMMK....',
      '..KKKMMMMMMKK...',
      '.KMMKMMNNMMMMK..',
      'KMMMKMNNNNMMMMK.',
      'KMmMKMNNNNMMMMMK',
      'KMMMKKMNNMMMKKK.',
      '.KKK.KMMMMMMK...',
      '..IIIKMMMMMMK...',
      '.I..IKMMMKKMMK..',
      '.I...KKKK.KKKK..',
    ],
  },
  mothrax: {
    name: 'MOTHRAX', title: 'The Moth', flavor: 'Drawn to the light beer.',
    pal: { V: '#c9a4e8', v: '#8f5fc2', D: '#3b2d4a' },
    rows: [
      '.K...KKKK...K...',
      '..K.KDDDDK.K....',
      '...KKDYYDDKK....',
      '.KKKKDYKDDKKKK..',
      'KVVVVKDDDDKVVVVK',
      'KVvVVVKDDKVVVvVK',
      'KVVvVVKDDKVVvVVK',
      'KVVVVvKDDKvVVVVK',
      'KVYYVVKDDKVVYYVK',
      'KVYYVVKDDKVVYYVK',
      'KVVVVVKDDKVVVVVK',
      '.KVVVVKDDKVVVVK.',
      '.KvvVVKDDKVVvvK.',
      '..KvVVKDDKVVvK..',
      '..KVVVKDDKVVVK..',
      '...KVVKDDKVVK...',
      '....KVKDDKVK....',
      '.....KKDDKK.....',
      '......KDDK......',
      '......KKKK......',
    ],
  },
  mecha9: {
    name: 'MECHA-9', title: 'The Robot', flavor: 'Runs on barrel-aged fuel.',
    pal: { S: '#7f8fa6', s: '#4b5668' },
    rows: [
      '.......KK.......',
      '......KRRK......',
      '.......KK.......',
      '...KKKKKKKKKK...',
      '..KSSSSSSSSSSK..',
      '..KSKCCCCCCKSK..',
      '..KSKCCKKCCKSK..',
      '..KSSSSSSSSSSK..',
      '..KsKKKKKKKKsK..',
      '...KKssssssKK...',
      '.KKKSSSSSSSSKKK.',
      'KSSKSSYYYYSSKSSK',
      'KSsKSSYRRYSSKSsK',
      'KSSKSSYYYYSSKSSK',
      'KsSKSSSSSSSSKSsK',
      'KKKKKSSSSSSKKKKK',
      '....KsSSSSsK....',
      '....KSSKKSSK....',
      '...KSSSK.KSSSK..',
      '...KKKKK.KKKKK..',
    ],
  },
  kraken: {
    name: 'KRAKEN', title: 'The Squid', flavor: 'Eight arms, eight pints.',
    pal: { O: '#e8734a', o: '#b8482a' },
    rows: [
      '....KKKKKKKK....',
      '...KOOOOOOOOK...',
      '..KOOOOOOOOOOK..',
      '.KOOOOOOOOOOOOK.',
      '.KOKWWWKOKWWWKOK',
      '.KOKWWKKOKWWKKOK',
      '.KOOKKKOOOKKKOOK',
      '.KOOOOOOOOOOOOK.',
      '..KoOOOOOOOOoK..',
      '..KKoOOOOOOoKK..',
      '.KOOKoooooooKOOK',
      'KOOKKOOKKOOKKOOK',
      'KOOKKOOKKOOKKOOK',
      'KoOKKoOKKoOKKoOK',
      'KOOKKOOKKOOKKOOK',
      '.KKKKOOKKOOKKKK.',
      '....KoOKKoOK....',
      '....KKOOKOOKK...',
      '.....KOOKOOK....',
      '.....KKKKKKK....',
    ],
  },
  yeti: {
    name: 'YETI', title: 'The Snow Beast', flavor: 'Likes it ice cold.',
    pal: { J: '#5f7fa8' },
    rows: [
      '....KKKKKKKK....',
      '...KWWWWWWWWK...',
      '..KWWWWWWWWWWK..',
      '..KWWJJJJJJWWK..',
      '..KWJJWKJJWKJWK.',
      '..KWJJJJJJJJJWK.',
      '..KWJKRRRRRRKWK.',
      '..KWJKWKWKWKKWK.',
      '...KWWKKKKKKWK..',
      '..KKWWWWWWWWWKK.',
      '.KWWKWWWWWWWKWWK',
      'KWWKWWwwwwWWKWWK',
      'KWWKWWwwwwWWKWWK',
      'KWwKWWwwwwWWKWwK',
      'KWWKKWWwwWWKKWWK',
      '.KK.KWWWWWWK.KK.',
      '....KWWWWWWK....',
      '....KWWWKWWWK...',
      '...KWWWK.KWWWK..',
      '...KKKKK.KKKKK..',
    ],
  },
};

export const MONSTER_IDS = Object.keys(MONSTERS);

export const SPRITES = {
  explosion1: { rows: [
    '............',
    '............',
    '....RRRR....',
    '...ROOOOR...',
    '...ROYYOR...',
    '..ROYWWYOR..',
    '..ROYWWYOR..',
    '...ROYYOR...',
    '...ROOOOR...',
    '....RRRR....',
    '............',
    '............',
  ] },
  explosion2: { rows: [
    '.....R......',
    '..R..RR..R..',
    '.RR.ROOR.RR.',
    '..ROOYYOOR..',
    '..ROYYWYOR..',
    'RROYWWWWYORR',
    'RROYWWWWYORR',
    '..ROYYWYOR..',
    '..ROOYYOOR..',
    '.RR.ROOR.RR.',
    '..R..RR..R..',
    '.....R......',
  ] },
  explosion3: { rows: [
    '..S......S..',
    '.SSS.SS.SSS.',
    '..S.SSSS.S..',
    '...SssssS...',
    '..SsSSSSsS..',
    '.SsS....SsS.',
    '.SsS....SsS.',
    '..SsSSSSsS..',
    '...SssssS...',
    '..S.SSSS.S..',
    '.SSS.SS.SSS.',
    '..S......S..',
  ] },
  fire1: { rows: [
    '...R....',
    '..RR....',
    '..ROR.R.',
    '.ROOR.R.',
    '.ROYORR.',
    'ROYYYOR.',
    'ROYWYOR.',
    'ROYYYOR.',
    '.ROOOR..',
    '..RRR...',
  ] },
  fire2: { rows: [
    '.....R..',
    '..R.RR..',
    '..RR.R..',
    '.ROOROR.',
    '.ROYOOR.',
    'ROYYYOR.',
    'ROYWWOR.',
    'ROYYYOR.',
    '.ROOOR..',
    '..RRR...',
  ] },
  floor: { rows: [
    'KKKKKKKKKKKKKKKK',
    'DDDDDDDDDDDDDDDD',
    'DKYYKDKYYKDKYYKD',
    'DKYYKDKNNKDKYYKD',
    'DDDDDDDDDDDDDDDD',
    'DKNNKDKYYKDKYYKD',
    'DKNNKDKYYKDKYYKD',
    'dddddddddddddddd',
  ] },
  floorDamaged: { rows: [
    'KKKKKKKKKKKKKKKK',
    'DDDDKDDDDDDDKDDD',
    'DKYYKDKRRKDKYYKD',
    'DKYYKDKORKDKYYKD',
    'DDKDDDDDDDDDDKDD',
    'DKNNKDKYYKDDKNKD',
    'DKNKKDKYYKDKKNKD',
    'dddddddddddddddd',
  ] },
  roof: { rows: [
    '.......KK.......',
    '......KRRK......',
    '.......KK.......',
    '...KKKKKKKKKK...',
    '..KDDDDDDDDDDK..',
    '.KDDDDDDDDDDDDK.',
    'KKKKKKKKKKKKKKKK',
  ] },
  ground: { rows: [
    'ssssssssssssssss',
    'SSSSSSSSSSSSSSSS',
    'sSsSsSsSsSsSsSsS',
    'ssssssssssssssss',
  ] },
  mug: { pal: { G: '#f2b632', g: '#ffd76a' }, rows: [
    '..WWWWWWW...',
    '.WWWWWWWWW..',
    '.KWWWWWWWK..',
    '.KGgGGGGGKK.',
    '.KGgGGGGGKGK',
    '.KGgGGGGGKGK',
    '.KGgGGGGGKGK',
    '.KGgGGGGGKKK',
    '.KGgGGGGGK..',
    '.KGgGGGGGK..',
    '.KKKKKKKKK..',
    '............',
  ] },
  crown: { rows: [
    'K...K...K',
    'KY.KYK.YK',
    'KYYKYKYYK',
    'KYYYYYYYK',
    'KYRYYYRYK',
    'KKKKKKKKK',
  ] },
  heli: { pal: { H: '#5f7040' }, rows: [
    'KKKKKKKKKKKKK...',
    '......K.........',
    '.....KKKK.......',
    '...KKHHHHKKKK...',
    '..KHHCCHHHHHHKK.',
    '..KHHHHHHHHKKK..',
    '...KKKKKKK..K...',
    '....K...K.KKK...',
  ] },
  tank: { pal: { H: '#5f7040' }, rows: [
    '........KKKK....',
    '.....KKKHHHHKK..',
    'KKKKKKHHHHHHHHK.',
    '.....KHHHHHHHHHK',
    '....KHHHHHHHHHHK',
    '...KKsKsKsKsKsKK',
    '...KsKsKsKsKsKsK',
    '....KKKKKKKKKKK.',
  ] },
  star: { rows: [
    '...Y...',
    '..YYY..',
    '.YYWYY.',
    'YYWWWYY',
    '.YYWYY.',
    '..YYY..',
    '...Y...',
  ] },
  skull: { rows: [
    '..KKKK..',
    '.KWWWWK.',
    'KWWWWWWK',
    'KWKWWKWK',
    'KWWWWWWK',
    '.KWKKWK.',
    '..KWWK..',
    '..KKKK..',
  ] },
};

const cache = new Map();

/** Render a sprite definition to a canvas. */
export function drawSprite(def, scale = 4, { flip = false } = {}) {
  const rows = def.rows;
  const h = rows.length;
  const w = rows[0].length;
  const pal = { ...BASE, ...(def.pal || {}) };
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = pal[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      const px = flip ? (w - 1 - x) : x;
      ctx.fillRect(px * scale, y * scale, scale, scale);
    }
  }
  c.className = 'px';
  c.setAttribute('role', 'img');
  return c;
}

/** Data URL for a sprite, cached, for CSS backgrounds. */
export function spriteURL(name, scale = 4) {
  const key = name + ':' + scale;
  if (cache.has(key)) return cache.get(key);
  const def = SPRITES[name] || MONSTERS[name];
  const url = drawSprite(def, scale).toDataURL();
  cache.set(key, url);
  return url;
}

/** Monster canvas element with a data attribute for CSS hooks. */
export function monsterEl(id, scale = 5, opts = {}) {
  const def = MONSTERS[id] || MONSTERS.kongo;
  const el = drawSprite(def, scale, opts);
  el.dataset.monster = id;
  el.setAttribute('aria-label', def.name);
  return el;
}

export function spriteEl(name, scale = 4, opts = {}) {
  const el = drawSprite(SPRITES[name], scale, opts);
  el.dataset.sprite = name;
  el.setAttribute('aria-hidden', 'true');
  return el;
}

/** Decorative night skyline drawn to a canvas, seeded so it is stable. */
export function drawSkyline(canvas, seed = 7) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  const px = 4;
  let x = 0;
  while (x < W) {
    const bw = px * (3 + Math.floor(rnd() * 6));
    const bh = px * (4 + Math.floor(rnd() * (H / px - 6)));
    const top = H - bh;
    ctx.fillStyle = rnd() > 0.5 ? BASE.D : BASE.d;
    ctx.fillRect(x, top, bw, bh);
    ctx.fillStyle = BASE.K;
    ctx.fillRect(x, top, bw, px);
    for (let wy = top + px * 2; wy < H - px; wy += px * 2) {
      for (let wx = x + px; wx < x + bw - px; wx += px * 2) {
        if (rnd() > 0.45) {
          ctx.fillStyle = rnd() > 0.85 ? BASE.C : BASE.Y;
          ctx.fillRect(wx, wy, px, px);
        }
      }
    }
    if (rnd() > 0.7) {
      ctx.fillStyle = BASE.R;
      ctx.fillRect(x + Math.floor(bw / 2 / px) * px, top - px, px, px);
    }
    x += bw + px;
  }
}
