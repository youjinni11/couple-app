import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_KEY, VAPID_PUBLIC } from './config.js';
import { t, getLang, fmtDateL, DEFAULT_FONT, fontAllowed } from './i18n.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'uridul-auth' },
});

// ---------- dates (KST) ----------
export function kstToday() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
export function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000);
}
export function addDays(s, n) {
  return new Date(parseDate(s) + n * 86400000).toISOString().slice(0, 10);
}
export function fmtDate(s, withYear = false) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return fmtDateL(y, m, d, new Date(parseDate(s)).getUTCDay(), withYear);
}
export function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return t('time.now');
  if (s < 3600) return t('time.min', { n: Math.floor(s / 60) });
  if (s < 86400) return t('time.hour', { n: Math.floor(s / 3600) });
  return fmtDate(new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10));
}

// D+N where the first day counts as day 1 (Korean convention)
export function dPlus(started) {
  return daysBetween(started, kstToday()) + 1;
}

export function upcomingEvents(started, annivs, limit = 5) {
  const today = kstToday();
  const out = [];
  if (started) {
    let found = 0;
    for (let n = 100; n <= 10000 && found < 3; n += 100) {
      const date = addDays(started, n - 1);
      if (date >= today) { out.push({ title: t('ev.days', { n }), date, kind: 'milestone' }); found++; }
    }
    const sy = Number(started.slice(0, 4));
    for (let k = 1; k <= 60; k++) {
      const date = `${sy + k}${started.slice(4)}`;
      if (date >= today) { out.push({ title: t('ev.years', { n: k }), date, kind: 'milestone' }); break; }
    }
  }
  for (const a of annivs || []) {
    let date = a.date;
    if (a.repeat_yearly) {
      const y = Number(today.slice(0, 4));
      date = `${y}${a.date.slice(4)}`;
      if (date < today) date = `${y + 1}${a.date.slice(4)}`;
    }
    if (date >= today) out.push({ title: a.title, date, kind: 'anniv', id: a.id });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  return out.slice(0, limit).map((e) => ({ ...e, dday: daysBetween(today, e.date) }));
}

// ---------- shared content (presets + daily questions in 3 languages) ----------
let presets = [];
let presetMap = new Map();
let questions = [];
export async function loadContent() {
  if (presets.length && questions.length) return;
  const [p, q] = await Promise.all([
    sb.from('bucket_presets').select('*').order('id'),
    sb.from('daily_questions').select('*').order('id'),
  ]);
  presets = p.data || [];
  presetMap = new Map(presets.map((r) => [r.id, r]));
  questions = q.data || [];
}
export const allPresets = () => presets;

const suffix = () => (getLang() === 'ko' ? '' : '_' + getLang());
export function presetTitle(p) {
  return p['title' + suffix()] || p.title;
}
// A bucket item made from a preset shows in the viewer's language; custom items show as written.
export function bucketTitle(item) {
  const p = item.preset_id && presetMap.get(item.preset_id);
  return p ? presetTitle(p) : item.title;
}
export function bucketQuestion(item) {
  const p = item && item.preset_id && presetMap.get(item.preset_id);
  if (p) return p['question' + suffix()] || p.question;
  return (item && item.question) || t('q.defaultBucket');
}
export function dailyQuestionFor(dateStr) {
  if (!questions.length) return '…';
  const dayIndex = Math.floor((parseDate(dateStr) - Date.UTC(2024, 0, 1)) / 86400000);
  const q = questions[((dayIndex % questions.length) + questions.length) % questions.length];
  return q['text' + suffix()] || q.text;
}

// ---------- photos ----------
export async function compressImage(file, max = 1600, quality = 0.82) {
  let img = await createImageBitmap(file).catch(() => null);
  if (!img) {
    img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = URL.createObjectURL(file);
    });
  }
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return await new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
}

const urlCache = new Map();
export async function signedUrls(paths) {
  const need = paths.filter((p) => !urlCache.has(p));
  if (need.length) {
    const { data } = await sb.storage.from('photos').createSignedUrls(need, 60 * 60 * 24);
    for (const r of data || []) if (r.signedUrl) urlCache.set(r.path, r.signedUrl);
  }
  return paths.map((p) => urlCache.get(p)).filter(Boolean);
}

// ---------- push ----------
function urlB64ToUint8Array(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
export async function currentPushState() {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && (await reg.pushManager.getSubscription());
  return sub ? 'on' : 'off';
}
export async function enablePush(userId) {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(t('err.notifDenied'));
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC) });
  }
  const j = sub.toJSON();
  const { error } = await sb.from('push_subscriptions').upsert(
    { user_id: userId, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth },
    { onConflict: 'endpoint' },
  );
  if (error) throw error;
}
export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub) {
    await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
}

// ---------- font & text size ----------
const ZH_FONT_CSS = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=ZCOOL+KuaiLe&family=Long+Cang&family=Ma+Shan+Zheng&display=swap';
function ensureChineseFonts() {
  if (document.getElementById('zh-fonts')) return;
  const l = document.createElement('link');
  l.id = 'zh-fonts';
  l.rel = 'stylesheet';
  l.href = ZH_FONT_CSS;
  document.head.appendChild(l);
}
export function applyFont(id, lang = getLang()) {
  if (!fontAllowed(lang, id)) id = DEFAULT_FONT[lang];
  if (lang === 'zh') ensureChineseFonts();
  document.documentElement.dataset.font = id;
  try { localStorage.setItem('font', id); } catch (e) {}
  return id;
}
export const SIZES = [0.88, 1, 1.12, 1.25, 1.4];
export function applySize(v) {
  document.documentElement.style.setProperty('--size', String(v));
  try { localStorage.setItem('size', String(v)); } catch (e) {}
}
