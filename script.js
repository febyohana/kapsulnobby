import {
  saveToCloud,
  listenCloud
} from "./firebase.js";

/* ========== LDR Companion — Vanilla JS ========== */

const KEYS = {
  settings: 'ldr.settings.v1',
  moods: 'ldr.moods.v1',
  missions: 'ldr.missions.v1',
  scheduled: 'ldr.scheduled.v1',
  memories: 'ldr.memories.v1',
  secrets: 'ldr.secrets.v1',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function uid() { return Math.random().toString(36).slice(2, 10); }

const MOODS = [
  { key: 'happy', label: 'Bahagia', emoji: '😊' },
  { key: 'love',  label: 'Sayang',  emoji: '🥰' },
  { key: 'calm',  label: 'Tenang',  emoji: '😌' },
  { key: 'tired', label: 'Capek',   emoji: '😵' },
  { key: 'miss',  label: 'Kangen',  emoji: '🥺' },
  { key: 'sad',   label: 'Sedih',   emoji: '😞' },
  { key: 'angry', label: 'Kesal',   emoji: '😤' },
  { key: 'angry', label: 'Santai',   emoji: '😎' },
  { key: 'Mood Self Care', label: 'Healing',   emoji: '🌱' },
  { key: 'excited', label: 'Semangat', emoji: '💪' },
];

const DEFAULT_MISSIONS = [
  { id: 'm1', title: 'Kirim foto langit hari ini', desc: 'Biar kita lihat langit yang sama', doneA: false, doneB: false, createdAt: new Date().toISOString() },
  { id: 'm2', title: 'Voice note 30 detik', desc: 'Ceritakan hal kecil yang bikin senyum', doneA: false, doneB: false, createdAt: new Date().toISOString() },
  { id: 'm3', title: 'Tonton 1 episode bareng (call)', doneA: false, doneB: false, createdAt: new Date().toISOString() },
  { id: 'm4', title: 'Tulis 3 hal yang disyukuri tentang pasangan', doneA: false, doneB: false, createdAt: new Date().toISOString() },
];

const defaultSettings = {
  nameA: 'Buy',
  nameB: 'Babik',
  startDate: new Date().toISOString().slice(0, 10),
  meetDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 16),
  activePartner: 'A',
  secretPin: '1234',
};

let state = {
  tab: 'home',
  settings: { ...defaultSettings },
  moods: [],
  missions: [...DEFAULT_MISSIONS],
  scheduled: [],
  memories: [],
  secrets: [],
  secretUnlocked: false,
};

function loadState() {
  state.settings = { ...defaultSettings, ...loadJSON(KEYS.settings, {}) };
  state.moods = loadJSON(KEYS.moods, []);
  state.missions = loadJSON(KEYS.missions, DEFAULT_MISSIONS);
  state.scheduled = loadJSON(KEYS.scheduled, []);
  state.memories = loadJSON(KEYS.memories, []);
  state.secrets = loadJSON(KEYS.secrets, []);
}

function saveState() {

  saveJSON(KEYS.settings, state.settings);
  saveJSON(KEYS.moods, state.moods);
  saveJSON(KEYS.missions, state.missions);
  saveJSON(KEYS.scheduled, state.scheduled);
  saveJSON(KEYS.memories, state.memories);
  saveJSON(KEYS.secrets, state.secrets);

  // sync data bersama aja
  saveToCloud({
    settings: state.settings,
    moods: state.moods,
    missions: state.missions,
    scheduled: state.scheduled,
    memories: state.memories,
    secrets: state.secrets
  });
}

/* ========== Icons (inline SVG) ========== */
const ICONS = {
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  smile: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  bookHeart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M16 8.2c.8.8.8 2.2 0 3l-3.3 3.3a.7.7 0 0 1-1 0L8.4 11a2.2 2.2 0 0 1 0-3.1 2.2 2.2 0 0 1 3.1 0l.3.3.3-.3a2.2 2.2 0 0 1 3.9 1.6z"/></svg>`,
  keyRound: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  unlock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
};

/* ========== DOM helpers ========== */
const app = document.getElementById('app');

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ========== Renderers ========== */

function renderApp() {
  const s = state.settings;
  const partner = s.activePartner;
  const partnerName = partner === 'A' ? s.nameA : s.nameB;
  const otherName = partner === 'A' ? s.nameB : s.nameA;

  app.innerHTML = `
    <div class="bg-layer"></div>
    <div class="bg-overlay"></div>
    <div class="bg-blur"></div>
    <div class="container">
      ${renderHeader(s)}
      <main style="margin-top:1.5rem;display:flex;flex-direction:column;gap:1.5rem;">
        ${state.tab === 'home' ? renderHome(s) : ''}
        ${state.tab === 'mood' ? renderMood(s, partner, partnerName, otherName) : ''}
        ${state.tab === 'missions' ? renderMissions(partner) : ''}
        ${state.tab === 'messages' ? renderMessages(partner, s) : ''}
        ${state.tab === 'memories' ? renderMemories() : ''}
        ${state.tab === 'secret' ? renderSecret() : ''}
        ${state.tab === 'settings' ? renderSettings(s) : ''}
      </main>
    </div>
    ${renderBottomNav()}
  `;
  attachListeners();
}

function renderHeader(s) {
  return `
    <header>
      <div class="header-left">
        <div class="heart-box">${ICONS.heart}</div>
        <div>
          <div class="header-sub">Ruang kita berdua</div>
          <h1 class="header-title">${esc(s.nameA)} <span class="text-primary">&</span> ${esc(s.nameB)}</h1>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <button class="btn btn-ghost" id="btn-switch" title="Ganti pengguna aktif">
          Aktif: <span class="text-primary">${esc(s.activePartner === 'A' ? s.nameA : s.nameB)}</span>
        </button>
        <button class="btn btn-icon btn-ghost" id="btn-settings" aria-label="Pengaturan">${ICONS.settings}</button>
      </div>
    </header>
  `;
}

function renderHome(s) {
  const today = new Date().toISOString().slice(0, 10);
  const todayA = state.moods.find(m => m.date === today && m.partner === 'A');
  const todayB = state.moods.find(m => m.date === today && m.partner === 'B');
  const doneCount = state.missions.filter(m => m.doneA && m.doneB).length;
  const upcomingLocked = state.scheduled.filter(x => new Date(x.unlockAt) > new Date()).length;

  return `
    ${renderCountdown(s.meetDate)}
    <div class="grid-3">
      <div class="glass-card summary-card" data-go="mood">
        <div style="display:flex;align-items:center;gap:0.5rem;color:var(--muted-foreground);">
          <div class="summary-icon">${ICONS.smile}</div>
          <span class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;">Mood hari ini</span>
        </div>
        <div class="mt-3" style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <span class="pill">${esc(s.nameA)}: ${emojiFor(todayA?.mood) ?? '—'}</span>
          <span class="pill">${esc(s.nameB)}: ${emojiFor(todayB?.mood) ?? '—'}</span>
        </div>
      </div>
      <div class="glass-card summary-card" data-go="missions">
        <div style="display:flex;align-items:center;gap:0.5rem;color:var(--muted-foreground);">
          <div class="summary-icon">${ICONS.target}</div>
          <span class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;">Misi selesai</span>
        </div>
        <div class="mt-3 text-2xl">${doneCount}<span class="text-sm text-muted">/${state.missions.length}</span></div>
      </div>
      <div class="glass-card summary-card" data-go="messages">
        <div style="display:flex;align-items:center;gap:0.5rem;color:var(--muted-foreground);">
          <div class="summary-icon">${ICONS.mail}</div>
          <span class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;">Pesan terkunci</span>
        </div>
        <div class="mt-3 text-2xl">${upcomingLocked}</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="glass-card quick-action" data-go="memories">
        <div class="quick-icon">${ICONS.bookHeart}</div>
        <div>
          <div class="font-medium text-lg">Tulis kenangan baru</div>
          <div class="text-sm text-muted">Abadikan momen kecil hari ini.</div>
        </div>
      </div>
      <div class="glass-card quick-action" data-go="secret">
        <div class="quick-icon">${ICONS.keyRound}</div>
        <div>
          <div class="font-medium text-lg">Buka kalender rahasia</div>
          <div class="text-sm text-muted">Hanya kalian yang tahu pin-nya.</div>
        </div>
      </div>
    </div>
  `;
}

function renderCountdown(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const mins = Math.floor((diff % 36e5) / 6e4);
  const secs = Math.floor((diff % 6e4) / 1e3);
  const passed = diff === 0;

  return `
    <section class="glass-card" style="position:relative;overflow:hidden;padding:1.5rem;">
      <div class="floaty-1"></div>
      <div class="floaty-2"></div>
      <div style="position:relative;z-index:1;">
        <p class="text-xs" style="text-transform:uppercase;letter-spacing:0.2em;color:var(--muted-foreground);">Hitung mundur ketemu</p>
        <h2 class="mt-1 text-3xl">${passed ? 'Hari ini kita bertemu 💌' : 'Sebentar lagi kita bertemu'}</h2>
        <div class="countdown-grid mt-5">
          ${['Hari','Jam','Mnt','Dtk'].map((l,i) => {
            const v = [days,hours,mins,secs][i];
            return `<div class="countdown-box"><div class="countdown-num">${String(v).padStart(2,'0')}</div><div class="countdown-label">${l}</div></div>`;
          }).join('')}
        </div>
        <p class="mt-4 text-sm text-muted">Target: ${new Date(target).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
      </div>
    </section>
  `;
}

function renderMood(s, partner, partnerName, otherName) {
  const today = new Date().toISOString().slice(0, 10);
  const mine = state.moods.find(m => m.date === today && m.partner === partner);
  const theirs = state.moods.find(m => m.date === today && m.partner === (partner === 'A' ? 'B' : 'A'));

  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    last14.push({
      date: iso,
      A: state.moods.find(m => m.date === iso && m.partner === 'A')?.mood,
      B: state.moods.find(m => m.date === iso && m.partner === 'B')?.mood,
    });
  }

  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      ${sectionTitle(ICONS.smile, 'Mood Hari Ini', `Pilih perasaan ${esc(partnerName)} hari ini`)}
      <div class="glass-card" style="padding:1.25rem;">
        <div class="mood-grid">
          ${MOODS.map(m => `
            <button class="mood-btn ${mine?.mood === m.key ? 'active' : ''}" data-mood="${m.key}">
              <span class="emoji">${m.emoji}</span>
              <span>${m.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="mt-4">
          <label class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">Catatan kecil (opsional)</label>
          <div class="mt-2" style="display:flex;gap:0.5rem;">
            <input class="input flex-1" id="mood-note" value="${esc(mine?.note ?? '')}" placeholder="Cerita singkat ${esc(partnerName)} hari ini…" />
            <button class="btn btn-primary" id="btn-save-note">Simpan</button>
          </div>
        </div>
        <div class="mt-4" style="border-radius:1rem;border:1px solid var(--border);background:var(--secondary);padding:1rem;font-size:0.875rem;">
          ${theirs ? `
            <span class="font-medium">${esc(otherName)}</span> hari ini merasa <span style="font-size:1.125rem;">${emojiFor(theirs.mood)}</span>
            <span class="text-muted">(${MOODS.find(x => x.key === theirs.mood)?.label})</span>
            ${theirs.note ? `<p class="mt-1 italic" style="color:rgba(58,46,61,0.8);">“${esc(theirs.note)}”</p>` : ''}
          ` : `<span class="text-muted">${esc(otherName)} belum menulis mood hari ini.</span>`}
        </div>
      </div>
      <div class="glass-card" style="padding:1.25rem;">
        <p class="text-xs" style="text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);">14 hari terakhir</p>
        <div class="mood-history mt-3">
          ${last14.map(d => `
            <div class="mood-day">
              <div class="date-label">${new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
              <div style="margin-top:0.25rem;font-size:1rem;">
                <span title="${esc(s.nameA)}">${emojiFor(d.A) ?? '·'}</span>
                <span style="color:var(--border);">/</span>
                <span title="${esc(s.nameB)}">${emojiFor(d.B) ?? '·'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMissions(partner) {
  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      ${sectionTitle(ICONS.target, 'Mission', 'Tantangan kecil untuk dilakukan berdua')}
      <div class="glass-card" style="padding:1.25rem;">
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <input class="input" id="mission-title" placeholder="Misi baru… (mis. Kirim playlist hari ini)" />
          <input class="input" id="mission-desc" placeholder="Deskripsi (opsional)" />
          <button class="btn btn-primary" id="btn-add-mission" style="align-self:flex-start;">${ICONS.plus} Tambah</button>
        </div>
      </div>
      <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
        ${state.missions.length === 0 ? '<li class="glass-card empty">Belum ada misi. Tambahkan yang pertama!</li>' : ''}
        ${state.missions.map(m => {
          const both = m.doneA && m.doneB;
          const done = partner === 'A' ? m.doneA : m.doneB;
          return `
            <li class="glass-card mission-item ${both ? 'ring-1' : ''}" style="${both ? 'box-shadow:0 0 0 1px var(--accent);' : ''}">
              <button class="mission-check ${done ? 'done' : ''}" data-mid="${m.id}" aria-label="Tandai selesai">${ICONS.check}</button>
              <div class="flex-1">
                <div class="font-medium ${both ? 'line-through' : ''}">${esc(m.title)}</div>
                ${m.desc ? `<div class="text-sm text-muted">${esc(m.desc)}</div>` : ''}
                <div class="mt-2" style="display:flex;flex-wrap:wrap;gap:0.5rem;font-size:0.75rem;">
                  <span class="pill">A: ${m.doneA ? '✓' : '—'}</span>
                  <span class="pill">B: ${m.doneB ? '✓' : '—'}</span>
                  ${both ? `<span style="display:inline-flex;align-items:center;gap:0.25rem;border-radius:9999px;background:rgba(168,196,160,0.5);color:var(--accent-foreground);padding:0.25rem 0.5rem;">${ICONS.star} Selesai bersama</span>` : ''}
                </div>
              </div>
              <button class="btn btn-icon btn-ghost" data-rm-mission="${m.id}" aria-label="Hapus" style="color:var(--muted-foreground);">${ICONS.trash}</button>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

function renderMessages(partner, s) {
  const now = Date.now();
  const to = partner === 'A' ? 'B' : 'A';
  const items = [...state.scheduled].sort((a, b) => new Date(a.unlockAt) - new Date(b.unlockAt));

  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      ${sectionTitle(ICONS.mail, 'Pesan Terjadwal', 'Tulis sekarang, terbuka tepat pada waktunya')}
      <div class="glass-card" style="padding:1.25rem;">
        <textarea class="textarea" id="msg-text" rows="3" placeholder="Tulis pesan untuk ${esc(partner === 'A' ? s.nameB : s.nameA)}…"></textarea>
        <div class="mt-3" style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;justify-content:space-between;">
          <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:var(--muted-foreground);">
            ${ICONS.calendar} Terbuka pada
            <input type="datetime-local" class="input" id="msg-unlock" style="width:auto;padding:0.5rem 0.75rem;" />
          </label>
          <button class="btn btn-primary" id="btn-send-msg">${ICONS.send} Jadwalkan</button>
        </div>
      </div>
      <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
        ${items.length === 0 ? '<li class="glass-card empty">Belum ada pesan terjadwal.</li>' : ''}
        ${items.map(msg => {
          const locked = new Date(msg.unlockAt).getTime() > now;
          const visibleToMe = msg.from === partner || !locked;
          const fromName = msg.from === 'A' ? s.nameA : s.nameB;
          const toName = msg.to === 'A' ? s.nameA : s.nameB;
          const diff = Math.max(0, new Date(msg.unlockAt) - now);
          const d = Math.floor(diff / 864e5);
          const h = Math.floor((diff % 864e5) / 36e5);
          const m = Math.floor((diff % 36e5) / 6e4);
          return `
            <li class="glass-card message-card">
              <div class="message-header">
                <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;color:var(--muted-foreground);flex-wrap:wrap;">
                  <span class="pill">${esc(fromName)} → ${esc(toName)}</span>
                  <span>${new Date(msg.unlockAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  ${locked
                    ? `<span class="status-badge status-locked">${ICONS.lock} Terkunci</span>`
                    : `<span class="status-badge status-open">${ICONS.unlock} Terbuka</span>`}
                  <button class="btn btn-icon btn-ghost" data-rm-msg="${msg.id}" style="width:2rem;height:2rem;color:var(--muted-foreground);">${ICONS.trash}</button>
                </div>
              </div>
              <div class="mt-3" style="border-radius:0.75rem;border:1px solid var(--border);background:rgba(255,255,255,0.6);padding:1rem;">
                ${visibleToMe
                  ? `<p class="whitespace-pre" style="line-height:1.6;">${esc(msg.text)}</p>`
                  : `<div style="display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;color:var(--muted-foreground);">
                      ${ICONS.lock} Pesan ini akan terbuka dalam <strong style="color:var(--foreground);">${d}h ${h}j ${m}m</strong>. Sabar ya 💌
                    </div>`}
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

function renderMemories() {
  const grid = buildCalendarGrid();
  const byDate = new Map();
  for (const m of state.memories) {
    const arr = byDate.get(m.date) ?? [];
    arr.push(m); byDate.set(m.date, arr);
  }

  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      ${sectionTitle(ICONS.bookHeart, 'Memories Calendar', 'Kenangan kecil yang ingin kita simpan')}
      <div class="glass-card" style="padding:1.25rem;">
        <div style="display:grid;gap:0.75rem;">
          <div style="display:grid;gap:0.75rem;grid-template-columns:1fr;">
            <input type="date" class="input" id="mem-date" value="${new Date().toISOString().slice(0,10)}" />
            <input class="input" id="mem-title" placeholder="Judul momen…" />
            <select class="input" id="mem-emoji" style="padding:0.75rem;">
              ${['💖','🌸','🌙','☕','🎶','📸','🍜','✈️','🎂','🌧️'].map(e => `<option value="${e}">${e}</option>`).join('')}
            </select>
          </div>
          <textarea class="textarea" id="mem-note" rows="2" placeholder="Catatan singkat…"></textarea>
          <button class="btn btn-primary" id="btn-add-memory" style="align-self:flex-start;">${ICONS.plus} Simpan kenangan</button>
        </div>
      </div>
      <div class="glass-card" style="padding:1.25rem;">
        ${renderCalendarHeader(grid.monthDate)}
        <div class="memory-grid mt-3" style="text-align:center;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted-foreground);margin-bottom:0.25rem;">
          ${['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => `<div>${d}</div>`).join('')}
        </div>
        <div class="memory-grid">
          ${grid.days.map(({ iso, day, inMonth }) => {
            const items = byDate.get(iso) ?? [];
            return `
              <div class="memory-cell ${inMonth ? '' : 'out'}">
                <div style="font-size:0.6875rem;">${day}</div>
                <div style="margin-top:0.125rem;display:flex;flex-wrap:wrap;gap:0.125rem;">
                  ${items.slice(0,3).map(i => `<span title="${esc(i.title)}">${i.emoji ?? '💖'}</span>`).join('')}
                  ${items.length > 3 ? `<span style="font-size:0.625rem;color:var(--muted-foreground);">+${items.length-3}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
        ${state.memories.length === 0 ? '<li class="glass-card empty">Belum ada kenangan tersimpan.</li>' : ''}
        ${state.memories.slice().sort((a,b) => b.date.localeCompare(a.date)).map(m => `
          <li class="glass-card" style="display:flex;align-items:flex-start;gap:0.75rem;padding:1rem;">
            <div style="width:3rem;height:3rem;border-radius:0.75rem;background:var(--secondary);display:grid;place-items:center;font-size:1.5rem;flex-shrink:0;">${m.emoji ?? '💖'}</div>
            <div class="flex-1">
              <div class="font-medium">${esc(m.title)}</div>
              <div class="text-xs text-muted">${new Date(m.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
              ${m.note ? `<div class="mt-1 text-sm" style="color:rgba(58,46,61,0.8);">${esc(m.note)}</div>` : ''}
            </div>
            <button class="btn btn-icon btn-ghost" data-rm-memory="${m.id}" style="width:2rem;height:2rem;color:var(--muted-foreground);">${ICONS.trash}</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderSecret() {
  if (!state.secretUnlocked) {
    return `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        ${sectionTitle(ICONS.keyRound, 'Secret Calendar', 'Catatan rahasia yang hanya kalian tahu')}
        <div class="glass-card secret-lock">
          <div class="secret-icon">${ICONS.lock}</div>
          <h3 class="mt-3" style="font-size:1.25rem;">Masukkan PIN</h3>
          <p class="mt-1 text-sm text-muted">Atur PIN di pengaturan. Default: 1234</p>
          <input type="password" inputmode="numeric" class="input mt-4" id="secret-pin" placeholder="••••" style="text-align:center;letter-spacing:0.5em;font-size:1.125rem;" />
          <p class="mt-2 text-sm text-destructive" id="secret-err"></p>
          <button class="btn btn-primary mt-4" id="btn-unlock" style="width:100%;">Buka</button>
        </div>
      </div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      <div class="section-title">
        <div class="section-title-left">
          <div class="section-icon">${ICONS.keyRound}</div>
          <div>
            <h2>Secret Calendar</h2>
            <p class="text-sm text-muted">Hanya kalian yang tahu</p>
          </div>
        </div>
        <button class="btn btn-ghost" id="btn-lock-again" style="font-size:0.75rem;padding:0.4rem 0.75rem;">Kunci lagi</button>
      </div>
      <div class="glass-card" style="padding:1.25rem;">
        <div style="display:grid;gap:0.75rem;grid-template-columns:1fr;">
          <input type="date" class="input" id="sec-date" value="${new Date().toISOString().slice(0,10)}" />
          <input class="input" id="sec-title" placeholder="Judul rahasia…" />
        </div>
        <textarea class="textarea mt-3" id="sec-note" rows="3" placeholder="Cerita rahasia…"></textarea>
        <button class="btn btn-primary mt-3" id="btn-add-secret" style="align-self:flex-start;">${ICONS.plus} Simpan</button>
      </div>
      <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
        ${state.secrets.length === 0 ? '<li class="glass-card empty">Belum ada catatan rahasia.</li>' : ''}
        ${state.secrets.slice().sort((a,b) => b.date.localeCompare(a.date)).map(s => `
          <li class="glass-card" style="display:flex;align-items:flex-start;gap:0.75rem;padding:1rem;">
            <div style="width:3rem;height:3rem;border-radius:0.75rem;background:rgba(168,196,160,0.4);color:var(--accent-foreground);display:grid;place-items:center;flex-shrink:0;">${ICONS.sparkles}</div>
            <div class="flex-1">
              <div class="font-medium">${esc(s.title)}</div>
              <div class="text-xs text-muted">${new Date(s.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
              ${s.note ? `<div class="mt-1 text-sm whitespace-pre" style="color:rgba(58,46,61,0.8);">${esc(s.note)}</div>` : ''}
            </div>
            <button class="btn btn-icon btn-ghost" data-rm-secret="${s.id}" style="width:2rem;height:2rem;color:var(--muted-foreground);">${ICONS.trash}</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderSettings(s) {
  return `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      ${sectionTitle(ICONS.settings, 'Pengaturan', 'Sesuaikan ruang kalian berdua')}
      <div class="glass-card" style="padding:1.25rem;">
        <div class="settings-grid">
          <div class="field">
            <label>Nama A</label>
            <input class="input" id="set-nameA" value="${esc(s.nameA)}" />
          </div>
          <div class="field">
            <label>Nama B</label>
            <input class="input" id="set-nameB" value="${esc(s.nameB)}" />
          </div>
          <div class="field">
            <label>Tanggal jadian</label>
            <input type="date" class="input" id="set-start" value="${esc(s.startDate)}" />
          </div>
          <div class="field">
            <label>Tanggal ketemu berikutnya</label>
            <input type="datetime-local" class="input" id="set-meet" value="${esc(s.meetDate)}" />
          </div>
          <div class="field">
            <label>PIN kalender rahasia (4–6 digit)</label>
            <input class="input" id="set-pin" value="${esc(s.secretPin)}" inputmode="numeric" />
          </div>
          <div class="field">
            <label>Pengguna aktif</label>
            <div class="partner-toggle">
              <button class="partner-btn ${s.activePartner === 'A' ? 'active' : ''}" data-partner="A">${esc(s.nameA)}</button>
              <button class="partner-btn ${s.activePartner === 'B' ? 'active' : ''}" data-partner="B">${esc(s.nameB)}</button>
            </div>
          </div>
        </div>
        <p class="field hint">Data disimpan secara lokal di perangkat ini. Untuk sinkron antar perangkat, hubungkan backend nanti.</p>
      </div>
    </div>
  `;
}

function sectionTitle(icon, title, subtitle) {
  return `
    <div class="section-title">
      <div class="section-title-left">
        <div class="section-icon">${icon}</div>
        <div>
          <h2>${esc(title)}</h2>
          ${subtitle ? `<p class="text-sm text-muted">${esc(subtitle)}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderBottomNav() {
  const items = [
    { key: 'home', label: 'Beranda', icon: ICONS.heart },
    { key: 'mood', label: 'Mood', icon: ICONS.smile },
    { key: 'missions', label: 'Misi', icon: ICONS.target },
    { key: 'messages', label: 'Pesan', icon: ICONS.mail },
    { key: 'memories', label: 'Kenangan', icon: ICONS.bookHeart },
    { key: 'secret', label: 'Rahasia', icon: ICONS.keyRound },
  ];
  return `
    <nav class="bottom-nav">
      ${items.map(i => `
        <button class="nav-btn ${state.tab === i.key ? 'active' : ''}" data-tab="${i.key}">
          <div style="width:1.25rem;height:1.25rem;">${i.icon}</div>
          <span>${i.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function emojiFor(key) {
  if (!key) return null;
  return MOODS.find(m => m.key === key)?.emoji ?? null;
}

function buildCalendarGrid() {
  const monthDate = state._monthDate ? new Date(state._monthDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const first = new Date(monthDate);
  const startWeekday = first.getDay();
  const gridStart = new Date(first); gridStart.setDate(first.getDate() - startWeekday);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
    days.push({ iso: d.toISOString().slice(0, 10), day: d.getDate(), inMonth: d.getMonth() === monthDate.getMonth() });
  }
  return { monthDate, setMonth: (d) => { state._monthDate = new Date(d).toISOString(); renderApp(); }, days };
}

function renderCalendarHeader(monthDate) {
  const label = monthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  return `
    <div class="calendar-header">
      <button class="btn btn-ghost" id="cal-prev" style="padding:0.375rem 0.75rem;font-size:0.875rem;">‹</button>
      <p class="text-lg" style="text-transform:capitalize;">${label}</p>
      <button class="btn btn-ghost" id="cal-next" style="padding:0.375rem 0.75rem;font-size:0.875rem;">›</button>
    </div>
  `;
}

/* ========== Event listeners ========== */

function attachListeners() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.onclick = () => { state.tab = btn.dataset.tab; renderApp(); };
  });
  document.querySelectorAll('[data-go]').forEach(card => {
    card.onclick = () => { state.tab = card.dataset.go; renderApp(); };
  });

  const btnSwitch = document.getElementById('btn-switch');
  if (btnSwitch) btnSwitch.onclick = () => {
    state.settings.activePartner = state.settings.activePartner === 'A' ? 'B' : 'A';
    saveState(); renderApp();
  };

  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) btnSettings.onclick = () => { state.tab = 'settings'; renderApp(); };

  // Mood
  document.querySelectorAll('[data-mood]').forEach(btn => {
    btn.onclick = () => setMood(btn.dataset.mood);
  });
  const btnSaveNote = document.getElementById('btn-save-note');
  if (btnSaveNote) btnSaveNote.onclick = saveMoodNote;

  // Missions
  const btnAddMission = document.getElementById('btn-add-mission');
  if (btnAddMission) btnAddMission.onclick = addMission;
  document.querySelectorAll('[data-mid]').forEach(btn => {
    btn.onclick = () => toggleMission(btn.dataset.mid);
  });
  document.querySelectorAll('[data-rm-mission]').forEach(btn => {
    btn.onclick = () => removeMission(btn.dataset.rmMission);
  });

  // Messages
  const btnSendMsg = document.getElementById('btn-send-msg');
  if (btnSendMsg) btnSendMsg.onclick = sendMessage;
  document.querySelectorAll('[data-rm-msg]').forEach(btn => {
    btn.onclick = () => removeMessage(btn.dataset.rmMsg);
  });

  // Memories
  const btnAddMemory = document.getElementById('btn-add-memory');
  if (btnAddMemory) btnAddMemory.onclick = addMemory;
  document.querySelectorAll('[data-rm-memory]').forEach(btn => {
    btn.onclick = () => removeMemory(btn.dataset.rmMemory);
  });

  // Calendar nav
  const grid = buildCalendarGrid();
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev) calPrev.onclick = () => grid.setMonth(new Date(grid.monthDate.getFullYear(), grid.monthDate.getMonth() - 1, 1));
  if (calNext) calNext.onclick = () => grid.setMonth(new Date(grid.monthDate.getFullYear(), grid.monthDate.getMonth() + 1, 1));

  // Secret
  const btnUnlock = document.getElementById('btn-unlock');
  if (btnUnlock) btnUnlock.onclick = tryUnlock;
  const btnLockAgain = document.getElementById('btn-lock-again');
  if (btnLockAgain) btnLockAgain.onclick = () => { state.secretUnlocked = false; renderApp(); };
  const btnAddSecret = document.getElementById('btn-add-secret');
  if (btnAddSecret) btnAddSecret.onclick = addSecret;
  document.querySelectorAll('[data-rm-secret]').forEach(btn => {
    btn.onclick = () => removeSecret(btn.dataset.rmSecret);
  });

  // Settings
  document.querySelectorAll('[data-partner]').forEach(btn => {
    btn.onclick = () => { state.settings.activePartner = btn.dataset.partner; saveState(); renderApp(); };
  });
  const setInputs = ['set-nameA','set-nameB','set-start','set-meet','set-pin'];
  setInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onchange = () => {
      const v = el.value;
      if (id === 'set-nameA') state.settings.nameA = v;
      if (id === 'set-nameB') state.settings.nameB = v;
      if (id === 'set-start') state.settings.startDate = v;
      if (id === 'set-meet') state.settings.meetDate = v;
      if (id === 'set-pin') state.settings.secretPin = v.replace(/\D/g, '').slice(0, 6);
      saveState(); renderApp();
    };
  });
}

/* ========== Actions ========== */

function setMood(key) {
  const today = new Date().toISOString().slice(0, 10);
  const partner = state.settings.activePartner;
  const noteEl = document.getElementById('mood-note');
  const note = noteEl ? noteEl.value : '';
  state.moods = state.moods.filter(m => !(m.date === today && m.partner === partner));
  state.moods.push({ date: today, partner, mood: key, note });
  saveState(); renderApp();
}

function saveMoodNote() {
  const today = new Date().toISOString().slice(0, 10);
  const partner = state.settings.activePartner;
  const note = document.getElementById('mood-note')?.value ?? '';
  const entry = state.moods.find(m => m.date === today && m.partner === partner);
  if (entry) entry.note = note;
  saveState(); renderApp();
}

function addMission() {
  const title = document.getElementById('mission-title')?.value.trim();
  if (!title) return;
  const desc = document.getElementById('mission-desc')?.value.trim() || undefined;
  state.missions.unshift({ id: uid(), title, desc, doneA: false, doneB: false, createdAt: new Date().toISOString() });
  saveState(); renderApp();
}

function toggleMission(id) {
  const partner = state.settings.activePartner;
  state.missions = state.missions.map(m => m.id === id ? { ...m, [partner === 'A' ? 'doneA' : 'doneB']: partner === 'A' ? !m.doneA : !m.doneB } : m);
  saveState(); renderApp();
}

function removeMission(id) {
  state.missions = state.missions.filter(m => m.id !== id);
  saveState(); renderApp();
}

function sendMessage() {

  const text =
    document.getElementById('msg-text')
    ?.value.trim();

  if (!text) return;

  const partner =
    state.settings.activePartner;

  const to =
    partner === 'A' ? 'B' : 'A';

  const unlockAt =
    new Date(
      document.getElementById('msg-unlock')
      ?.value || Date.now() + 864e5
    ).toISOString();

  state.scheduled.unshift({
    id: uid(),
    from: partner,
    to,
    text,
    unlockAt,
    createdAt: new Date().toISOString()
  });

  document.getElementById('msg-text').value = '';
  document.getElementById('msg-unlock').value = '';

  console.log(state.scheduled);

  saveState();
  renderApp();
}

function removeMessage(id) {
  state.scheduled = state.scheduled.filter(s => s.id !== id);
  saveState(); renderApp();
}

function addMemory() {
  const title = document.getElementById('mem-title')?.value.trim();
  if (!title) return;
  state.memories.unshift({
    id: uid(),
    date: document.getElementById('mem-date')?.value || new Date().toISOString().slice(0, 10),
    title,
    note: document.getElementById('mem-note')?.value.trim() || undefined,
    emoji: document.getElementById('mem-emoji')?.value || '💖',
  });
  saveState(); renderApp();
}

function removeMemory(id) {
  state.memories = state.memories.filter(m => m.id !== id);
  saveState(); renderApp();
}

function tryUnlock() {
  const input = document.getElementById('secret-pin')?.value || '';
  if (input === state.settings.secretPin) {
    state.secretUnlocked = true;
    renderApp();
  } else {
    const err = document.getElementById('secret-err');
    if (err) err.textContent = 'PIN salah. Coba lagi.';
  }
}

function addSecret() {
  const title = document.getElementById('sec-title')?.value.trim();
  if (!title) return;
  state.secrets.unshift({
    id: uid(),
    date: document.getElementById('sec-date')?.value || new Date().toISOString().slice(0, 10),
    title,
    note: document.getElementById('sec-note')?.value.trim() || undefined,
  });
  saveState(); renderApp();
}

function removeSecret(id) {
  state.secrets = state.secrets.filter(s => s.id !== id);
  saveState(); renderApp();
}

/* ========== Init ========== */

// load local dulu
loadState();

// listen realtime firebase
listenCloud((cloudData) => {

  if (!cloudData) return;

  const currentData = JSON.stringify({
    settings: state.settings,
    moods: state.moods,
    missions: state.missions,
    scheduled: state.scheduled,
    memories: state.memories,
    secrets: state.secrets
  });

  const incomingData = JSON.stringify(cloudData);

  // kalau data sama, jangan render ulang
  if (currentData === incomingData) return;

  // simpan state lokal user
  const currentTab = state.tab;
  const currentSecret = state.secretUnlocked;

  // update data cloud
  state.settings = cloudData.settings ?? state.settings;
  state.moods = cloudData.moods ?? state.moods;
  state.missions = cloudData.missions ?? state.missions;
  state.scheduled = cloudData.scheduled ?? state.scheduled;
  state.memories = cloudData.memories ?? state.memories;
  state.secrets = cloudData.secrets ?? state.secrets;

  // balikin UI user
  state.tab = currentTab;
  state.secretUnlocked = currentSecret;

  // jangan rerender kalau lagi ngetik
  const editingTabs = ["messages", "memories", "secret"];

  if (!editingTabs.includes(state.tab)) {
    renderApp();
  }
});

// render awal
renderApp();

// countdown refresh
setInterval(() => {
  if (state.tab === "home") {
    renderApp();
  }
}, 1000);
