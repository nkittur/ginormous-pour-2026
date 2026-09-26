// Storage layer. Two adapters share one interface:
//   load()            -> { beers, raters, matches }
//   addBeer(beer)     -> beer
//   addRater(name)    -> rater (reuses an existing rater with the same name)
//   addMatch(match)   -> match
//   subscribe(fn)     -> unsubscribe; fn(state) fires on every change
//   mode              -> 'supabase' | 'local'
//
// SupabaseStore talks to PostgREST directly with fetch, so there is no
// client library to load. LocalStore keeps everything in this browser only
// and exists for demos and for previewing the app without a backend.

import { CONFIG } from './config.js';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() :
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }));
const now = () => new Date().toISOString();

class BaseStore {
  constructor() { this.listeners = new Set(); this.state = { beers: [], raters: [], matches: [] }; }
  subscribe(fn) { this.listeners.add(fn); fn(this.state); return () => this.listeners.delete(fn); }
  emit() { for (const fn of this.listeners) fn(this.state); }
}

/* ------------------------------------------------------------------ */
export class LocalStore extends BaseStore {
  constructor() { super(); this.mode = 'local'; this.key = 'ginormous-pour:v1'; }
  async load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) this.state = { beers: [], raters: [], matches: [], ...JSON.parse(raw) };
    } catch { /* storage unavailable: run in memory */ }
    this.emit();
    return this.state;
  }
  persist() {
    try { localStorage.setItem(this.key, JSON.stringify(this.state)); } catch { /* ignore */ }
    this.emit();
  }
  async addBeer(beer) {
    const row = { id: uuid(), created_at: now(), ...beer };
    this.state.beers.push(row); this.persist(); return row;
  }
  async addRater(name) {
    const clean = name.trim();
    const existing = this.state.raters.find(r => r.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;
    const row = { id: uuid(), name: clean, created_at: now() };
    this.state.raters.push(row); this.persist(); return row;
  }
  async addMatch(match) {
    const row = { id: uuid(), created_at: now(), ...match };
    this.state.matches.push(row); this.persist(); return row;
  }
  async reset() { this.state = { beers: [], raters: [], matches: [] }; this.persist(); }
}

/* ------------------------------------------------------------------ */
export class SupabaseStore extends BaseStore {
  constructor(url, anonKey) {
    super();
    this.mode = 'supabase';
    this.base = url.replace(/\/$/, '') + '/rest/v1';
    this.headers = {
      apikey: anonKey,
      Authorization: 'Bearer ' + anonKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
    this.pollMs = 4000;
    this.timer = null;
  }
  async req(path, opts = {}) {
    const res = await fetch(this.base + path, { ...opts, headers: { ...this.headers, ...(opts.headers || {}) } });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).message || ''; } catch { /* no body */ }
      throw new Error(`Supabase ${res.status}${detail ? ': ' + detail : ''}`);
    }
    return res.status === 204 ? null : res.json();
  }
  async load() {
    const [beers, raters, matches] = await Promise.all([
      this.req('/beers?select=*&order=created_at.asc'),
      this.req('/raters?select=*&order=created_at.asc'),
      this.req('/matches?select=*&order=created_at.asc'),
    ]);
    this.state = { beers, raters, matches };
    this.emit();
    this.startPolling();
    return this.state;
  }
  startPolling() {
    if (this.timer) return;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const [beers, matches, raters] = await Promise.all([
          this.req('/beers?select=*&order=created_at.asc'),
          this.req('/matches?select=*&order=created_at.asc'),
          this.req('/raters?select=*&order=created_at.asc'),
        ]);
        if (beers.length !== this.state.beers.length || matches.length !== this.state.matches.length || raters.length !== this.state.raters.length) {
          this.state = { beers, raters, matches };
          this.emit();
        }
      } catch { /* transient; try again next tick */ }
    };
    this.timer = setInterval(tick, this.pollMs);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });
  }
  async addBeer(beer) {
    const [row] = await this.req('/beers', { method: 'POST', body: JSON.stringify({ id: uuid(), ...beer }) });
    this.state.beers.push(row); this.emit(); return row;
  }
  async addRater(name) {
    const clean = name.trim();
    const found = await this.req('/raters?select=*&name=ilike.' + encodeURIComponent(clean.replace(/[%_]/g, '')) + '&limit=1');
    if (found.length) {
      if (!this.state.raters.some(r => r.id === found[0].id)) { this.state.raters.push(found[0]); this.emit(); }
      return found[0];
    }
    const [row] = await this.req('/raters', { method: 'POST', body: JSON.stringify({ id: uuid(), name: clean }) });
    this.state.raters.push(row); this.emit(); return row;
  }
  async addMatch(match) {
    const [row] = await this.req('/matches', { method: 'POST', body: JSON.stringify({ id: uuid(), ...match }) });
    this.state.matches.push(row); this.emit(); return row;
  }
}

/* ------------------------------------------------------------------ */
async function resolveConfig() {
  let cfg = { ...CONFIG };
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    try {
      const res = await fetch('api/config', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        cfg = { ...cfg, ...remote };
      }
    } catch { /* no server-side config; fall through */ }
  }
  return cfg;
}

export async function createStore() {
  const cfg = await resolveConfig();
  if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
    const store = new SupabaseStore(cfg.supabaseUrl, cfg.supabaseAnonKey);
    try {
      await store.load();
      return store;
    } catch (err) {
      console.warn('Supabase unavailable, falling back to local storage:', err.message);
    }
  }
  const local = new LocalStore();
  await local.load();
  return local;
}
