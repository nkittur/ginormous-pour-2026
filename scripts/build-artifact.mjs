// Bundles the app into a single HTML fragment for publishing as a claude.ai
// artifact (no doctype/head/body: the artifact host supplies those).
// Usage: node scripts/build-artifact.mjs > dist/artifact.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

// Modules in dependency order; imports/exports are stripped and the result
// runs as one module script (names were chosen not to collide).
const order = ['js/sprites.js', 'js/config.js', 'js/elo.js', 'js/store.js', 'js/app.js'];
const js = order.map(f => read(f)
  .replace(/^import .*?;\s*$/gm, '')
  .replace(/^export (?=(const|let|function|class|async))/gm, '')
).join('\n\n');

const css = read('css/style.css');
const html = read('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
  .replace(/<script type="module" src="js\/app.js"><\/script>/, '');

const out = `<title>The Ginormous Pour</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap">
<style>
${css}
</style>
${body}
<script type="module">
${js}
</script>
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), out);
console.log('wrote dist/artifact.html', out.length, 'bytes');
