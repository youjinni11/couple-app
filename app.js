import { html, render, useState, useEffect, useRef, useCallback } from 'https://unpkg.com/htm@3.1.1/preact/standalone.module.js';
import {
  sb, kstToday, fmtDate, timeAgo, dPlus, upcomingEvents, dailyQuestionFor, compressImage, squareImage, signedUrls,
  isStandalone, currentPushState, enablePush, disablePush, applyFont, applySize, SIZES, daysBetween,
  loadContent, allPresets, presetTitle, bucketTitle, bucketQuestion,
} from './lib.js';
import { t, getLang, setLang, LANGS, FONTS, DEFAULT_FONT, catLabel, fmtMonth, WEEKDAYS } from './i18n.js';

// ---------------------------------------------------------------- router
function parseHash() {
  const raw = (location.hash || '#/').slice(1) || '/';
  const [path, qs] = raw.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(qs || '')) };
}
function useRoute() {
  const [r, setR] = useState(parseHash());
  useEffect(() => {
    const on = () => { setR(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
const go = (h) => { location.hash = h; };

// ---------------------------------------------------------------- small UI bits
let toastFn = () => {};
const toast = (m) => toastFn(m);
function Toast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    toastFn = (m) => { setMsg(m); clearTimeout(toastFn.t); toastFn.t = setTimeout(() => setMsg(null), 2600); };
  }, []);
  return msg ? html`<div class="toast" role="status">${msg}</div>` : null;
}

function Header({ title, back, right }) {
  return html`<header class="topbar">
    ${back ? html`<button class="icon-btn" aria-label=${t('back')} onClick=${() => (history.length > 1 ? history.back() : go(back))}>‹</button>` : html`<span class="icon-spacer"></span>`}
    <h1>${title}</h1>
    ${right || html`<span class="icon-spacer"></span>`}
  </header>`;
}

const nameOf = (id, ctx) => (id === ctx.user.id ? ctx.profile.nickname : (ctx.partner?.nickname || t('partner')));
const personOf = (id, ctx) => (id === ctx.user.id ? ctx.profile : ctx.partner);

// Profile photo in a ring of the person's color; falls back to their initial.
function Avatar({ person, mine, size = 'sm' }) {
  const path = person?.avatar_path;
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (path) signedUrls([path]).then((u) => { if (alive) setUrl(u[0] || null); });
    return () => { alive = false; };
  }, [path]);
  const cls = `av av-${size} ${mine ? 'me' : 'you'}`;
  if (url) return html`<img class=${cls} src=${url} alt="" />`;
  const initial = (person?.nickname || '').trim().slice(0, 1) || '·';
  return html`<span class=${cls + ' av-ph'} aria-hidden="true">${initial}</span>`;
}

function Who({ id, ctx, label }) {
  const me = id === ctx.user.id;
  return html`<span class=${'who ' + (me ? 'me' : 'you')}><${Avatar} person=${personOf(id, ctx)} mine=${me} />${label !== false ? nameOf(id, ctx) : ''}</span>`;
}

function Empty({ children, action }) {
  return html`<div class="empty"><p>${children}</p>${action || ''}</div>`;
}

function errMsg(e) {
  const m = (e && (e.message || e.error_description)) || String(e);
  if (/Invalid login/i.test(m)) return t('err.invalidLogin');
  if (/already registered/i.test(m)) return t('err.alreadyRegistered');
  if (/Password should be/i.test(m)) return t('err.pwShort');
  for (const code of ['ALREADY_PAIRED', 'CODE_NOT_FOUND', 'COUPLE_FULL']) if (m.includes(code)) return t('err.' + code);
  return m;
}

function LangSwitch({ onChange }) {
  const cur = getLang();
  return html`<div class="seg lang-seg" role="radiogroup" aria-label="Language">
    ${LANGS.map((l) => html`<button role="radio" aria-checked=${cur === l.id} aria-selected=${cur === l.id} lang=${l.id === 'zh' ? 'zh-CN' : l.id} onClick=${() => onChange(l.id)}>${l.name}</button>`)}
  </div>`;
}

// ---------------------------------------------------------------- auth & pairing
function Login({ onLang }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({ email, password: pw, options: { data: { nickname: nick || email.split('@')[0] } } });
        if (error) throw error;
      }
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
    } catch (e2) { setErr(errMsg(e2)); }
    setBusy(false);
  }
  return html`<main class="auth">
    <${LangSwitch} onChange=${onLang} />
    <div class="auth-mark" aria-hidden="true"><i class="me"></i><i class="you"></i></div>
    <h1 class="auth-title">${t('appName')}</h1>
    <p class="auth-sub">${t('login.tagline')}</p>
    <form class="card form" onSubmit=${submit}>
      ${mode === 'signup' && html`<label>${t('login.nickname')}<input value=${nick} onInput=${(e) => setNick(e.target.value)} placeholder=${t('login.nickPh')} maxlength="12" /></label>`}
      <label>${t('login.email')}<input type="email" required value=${email} onInput=${(e) => setEmail(e.target.value)} autocomplete="email" /></label>
      <label>${t('login.password')}<input type="password" required minlength="6" value=${pw} onInput=${(e) => setPw(e.target.value)} autocomplete=${mode === 'signup' ? 'new-password' : 'current-password'} /></label>
      ${err && html`<p class="error">${err}</p>`}
      <button class="btn primary" disabled=${busy}>${mode === 'signup' ? t('login.signup') : t('login.login')}</button>
    </form>
    <button class="link" onClick=${() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); }}>
      ${mode === 'login' ? t('login.toSignup') : t('login.toLogin')}
    </button>
  </main>`;
}

function Pair({ ctx }) {
  const [code, setCode] = useState('');
  const [start, setStart] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true); setErr('');
    const { error } = await sb.rpc('create_couple', { p_started_on: start || null });
    if (error) setErr(errMsg(error)); else await ctx.reload();
    setBusy(false);
  }
  async function join(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await sb.rpc('join_couple', { p_code: code });
    if (error) setErr(errMsg(error)); else await ctx.reload();
    setBusy(false);
  }
  return html`<main class="auth">
    <${LangSwitch} onChange=${ctx.changeLang} />
    <h1 class="auth-title small">${t('pair.title', { name: ctx.profile.nickname })}</h1>
    <section class="card form">
      <h2>${t('pair.startTitle')}</h2>
      <label>${t('pair.startDate')}<input type="date" value=${start} onInput=${(e) => setStart(e.target.value)} /></label>
      <button class="btn primary" disabled=${busy} onClick=${create}>${t('pair.makeCode')}</button>
    </section>
    <form class="card form" onSubmit=${join}>
      <h2>${t('pair.joinTitle')}</h2>
      <input value=${code} onInput=${(e) => setCode(e.target.value.toUpperCase())} placeholder=${t('pair.codePh')} maxlength="6" class="code-input" />
      <button class="btn" disabled=${busy || code.length < 6}>${t('pair.join')}</button>
    </form>
    ${err && html`<p class="error">${err}</p>`}
    <button class="link" onClick=${() => sb.auth.signOut()}>${t('logout')}</button>
  </main>`;
}

// ---------------------------------------------------------------- shared pieces
function AnswerPills({ status }) {
  return html`<span class="qstate">
    <span class=${'pill me ' + (status?.me ? 'on' : '')}>${status?.me ? t('q.meDone') : t('q.meNot')}</span>
    <span class=${'pill you ' + (status?.partner ? 'on' : '')}>${status?.partner ? t('q.youDone') : t('q.youNot')}</span>
  </span>`;
}
function EventList({ events, onDelete }) {
  return html`<ul class="events">${events.map((e) => html`<li>
    <span>${e.title}</span><span class="muted">${fmtDate(e.date)}</span><b>${e.dday === 0 ? t('today') : 'D-' + e.dday}</b>
    ${onDelete && (e.kind === 'anniv' ? html`<button class="icon-btn tiny" aria-label=${t('anniv.deleteAria')} onClick=${() => onDelete(e.id)}>×</button>` : html`<span></span>`)}
  </li>`)}</ul>`;
}

// ---------------------------------------------------------------- home
function Home({ ctx }) {
  const { couple, partner } = ctx;
  const [status, setStatus] = useState(null);
  const [bucket, setBucket] = useState([]);
  const [annivs, setAnnivs] = useState([]);
  const [push, setPush] = useState('on');
  const today = kstToday();
  const qKey = `daily:${today}`;
  useEffect(() => {
    sb.rpc('answer_status', { p_key: qKey }).then(({ data }) => setStatus(data && data[0]));
    sb.from('bucket_items').select('id,title,emoji,status,preset_id,created_by').order('created_at', { ascending: false }).then(({ data }) => setBucket(data || []));
    sb.from('anniversaries').select('*').then(({ data }) => setAnnivs(data || []));
    currentPushState().then(setPush);
  }, []);
  const done = bucket.filter((b) => b.status === 'done').length;
  const todo = bucket.filter((b) => b.status === 'todo').slice(0, 3);
  const events = upcomingEvents(couple.started_on, annivs, 3);
  const ios = /iPhone|iPad/.test(navigator.userAgent);
  return html`<main class="page home">
    <header class="home-top">
      <span class="pair-names"><${Who} id=${ctx.user.id} ctx=${ctx} /> <span class="amp">&</span> ${partner ? html`<${Who} id=${partner.id} ctx=${ctx} />` : html`<span class="muted">${t('home.waiting')}</span>`}</span>
    </header>

    <section class="hero">
      ${couple.started_on
        ? html`<p class="hero-label">${t('home.together')}</p>
               <p class="hero-num">${dPlus(couple.started_on)}<span>${t('home.daysUnit')}</span></p>
               <p class="hero-sub">${t('home.since', { date: fmtDate(couple.started_on, true) })}</p>`
        : html`<p class="hero-label">${t('home.setDate')}</p>
               <button class="btn small" onClick=${() => go('#/me')}>${t('home.setDateBtn')}</button>`}
    </section>

    ${!partner && html`<section class="card invite">
      <p>${t('home.shareCode')}</p>
      <p class="code">${couple.invite_code}</p>
      <button class="btn small" onClick=${() => navigator.clipboard?.writeText(couple.invite_code).then(() => toast(t('home.copied')))}>${t('home.copyCode')}</button>
    </section>`}

    ${push !== 'on' && html`<button class="card notice" onClick=${() => go('#/me')}>
      🔔 ${ios && !isStandalone() ? t('home.addHomeHint') : t('home.pushHint')}
    </button>`}

    <button class="card qcard" onClick=${() => go(`#/q/${encodeURIComponent(qKey)}`)}>
      <span class="card-kicker">${t('q.todayKicker')}</span>
      <p class="qtext">${dailyQuestionFor(today)}</p>
      <${AnswerPills} status=${status} />
    </button>

    <section class="card">
      <div class="row-between">
        <h2>${t('bucket.title')}</h2>
        <button class="link" onClick=${() => go('#/bucket')}>${t('seeAll')}</button>
      </div>
      <div class="progress" aria-hidden="true"><div style=${`width:${bucket.length ? (done / bucket.length) * 100 : 0}%`}></div></div>
      <p class="muted small">${t('bucket.progress', { total: bucket.length, done })}</p>
      ${todo.length
        ? html`<ul class="mini-list">${todo.map((b) => html`<li><button onClick=${() => go('#/bucket/' + b.id)}><span>${b.emoji}</span>${bucketTitle(b)}</button></li>`)}</ul>`
        : html`<button class="btn small" onClick=${() => go('#/bucket-pick')}>${t('bucket.pickFromIdeas')}</button>`}
    </section>

    ${events.length > 0 && html`<section class="card">
      <div class="row-between"><h2>${t('home.upcoming')}</h2><button class="link" onClick=${() => go('#/calendar')}>${t('cal.title')}</button></div>
      <${EventList} events=${events} />
    </section>`}

    <button class="card link-card" onClick=${() => go('#/memories')}>${t('home.openMemories')}</button>
  </main>`;
}

// ---------------------------------------------------------------- bucket
function BucketList({ ctx, query }) {
  const [tab, setTab] = useState(query.tab || 'todo');
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const load = () => sb.from('bucket_items').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await sb.from('bucket_items').insert({ couple_id: ctx.couple.id, title: title.trim(), created_by: ctx.user.id });
    if (error) return toast(errMsg(error));
    setTitle(''); setAdding(false); toast(t('bucket.added')); load();
  }
  const count = (s) => (items ? items.filter((i) => i.status === s).length : '');
  const shown = (items || []).filter((i) => i.status === tab);
  return html`<main class="page">
    <${Header} title=${t('bucket.title')} />
    <div class="seg" role="tablist">
      <button role="tab" aria-selected=${tab === 'todo'} onClick=${() => setTab('todo')}>${t('bucket.tabTodo')} ${count('todo')}</button>
      <button role="tab" aria-selected=${tab === 'done'} onClick=${() => setTab('done')}>${t('bucket.tabDone')} ${count('done')}</button>
    </div>
    <div class="actions-row">
      <button class="btn primary" onClick=${() => go('#/bucket-pick')}>${t('bucket.pick')}</button>
      <button class="btn" onClick=${() => setAdding(!adding)}>${t('bucket.write')}</button>
    </div>
    ${adding && html`<form class="card form inline" onSubmit=${add}>
      <input autofocus value=${title} onInput=${(e) => setTitle(e.target.value)} placeholder=${t('bucket.addPh')} maxlength="40" />
      <button class="btn primary">${t('bucket.add')}</button>
    </form>`}
    ${items === null ? html`<p class="muted center">${t('loading')}</p>` : shown.length === 0
      ? html`<${Empty}>${tab === 'todo' ? t('bucket.emptyTodo') : t('bucket.emptyDone')}<//>`
      : html`<ul class="list">${shown.map((b) => html`<li>
          <button class="list-item" onClick=${() => go('#/bucket/' + b.id)}>
            <span class="emoji">${b.emoji}</span>
            <span class="grow"><b>${bucketTitle(b)}</b><small>${b.status === 'done' ? t('bucket.doneOn', { date: fmtDate(b.done_on, true) }) : catLabel(b.category)}</small></span>
            <${Who} id=${b.created_by} ctx=${ctx} label=${false} />
          </button></li>`)}</ul>`}
  </main>`;
}

function BucketPick({ ctx }) {
  const presets = allPresets();
  const [have, setHave] = useState(new Set());
  const [cat, setCat] = useState('*');
  useEffect(() => {
    sb.from('bucket_items').select('preset_id').then(({ data }) => setHave(new Set((data || []).map((d) => d.preset_id))));
  }, []);
  const cats = ['*', ...new Set(presets.map((p) => p.category))];
  async function add(p) {
    if (have.has(p.id)) return;
    const { error } = await sb.from('bucket_items').insert({
      couple_id: ctx.couple.id, preset_id: p.id, title: p.title, category: p.category, emoji: p.emoji, question: p.question, created_by: ctx.user.id,
    });
    if (error) return toast(errMsg(error));
    setHave(new Set([...have, p.id]));
    toast(t('pick.toast', { emoji: p.emoji }));
  }
  const shown = presets.filter((p) => cat === '*' || p.category === cat);
  return html`<main class="page">
    <${Header} title=${t('pick.title')} back="#/bucket" />
    <div class="chips">${cats.map((c) => html`<button class=${'chip ' + (c === cat ? 'on' : '')} aria-pressed=${c === cat} onClick=${() => setCat(c)}>${c === '*' ? t('pick.all') : catLabel(c)}</button>`)}</div>
    <ul class="list">${shown.map((p) => html`<li>
      <button class=${'list-item ' + (have.has(p.id) ? 'added' : '')} onClick=${() => add(p)} aria-pressed=${have.has(p.id)}>
        <span class="emoji">${p.emoji}</span>
        <span class="grow"><b>${presetTitle(p)}</b><small>${catLabel(p.category)}</small></span>
        <span class="add-mark">${have.has(p.id) ? t('pick.addedMark') : t('pick.addMark')}</span>
      </button></li>`)}</ul>
  </main>`;
}

function BucketDetail({ ctx, id }) {
  const [item, setItem] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [status, setStatus] = useState(null);
  const [doneOn, setDoneOn] = useState(kstToday());
  const load = async () => {
    const { data } = await sb.from('bucket_items').select('*').eq('id', id).maybeSingle();
    setItem(data || false);
    const { data: ds } = await sb.from('diaries').select('id,title,date,photo_paths,created_by').eq('bucket_item_id', id).order('date', { ascending: false });
    setDiaries(ds || []);
    const { data: st } = await sb.rpc('answer_status', { p_key: `bucket:${id}` });
    setStatus(st && st[0]);
  };
  useEffect(() => { load(); }, [id]);
  if (item === null) return html`<main class="page"><${Header} title="" back="#/bucket" /><p class="muted center">${t('loading')}</p></main>`;
  if (item === false) return html`<main class="page"><${Header} title="" back="#/bucket" /><${Empty}>${t('bucket.missing')}<//></main>`;
  async function markDone() {
    const { error } = await sb.from('bucket_items').update({ status: 'done', done_on: doneOn }).eq('id', id);
    if (error) return toast(errMsg(error));
    toast(t('bucket.doneToast')); load();
  }
  async function undo() {
    await sb.from('bucket_items').update({ status: 'todo', done_on: null }).eq('id', id);
    load();
  }
  async function remove() {
    if (!confirm(t('bucket.confirmDelete'))) return;
    await sb.from('bucket_items').delete().eq('id', id);
    go('#/bucket');
  }
  const qKey = `bucket:${id}`;
  return html`<main class="page">
    <${Header} title="" back="#/bucket" right=${html`<button class="icon-btn" aria-label=${t('delete')} onClick=${remove}>🗑</button>`} />
    <section class="bucket-hero">
      <span class="big-emoji">${item.emoji}</span>
      <h1>${bucketTitle(item)}</h1>
      <p class="muted"><${Who} id=${item.created_by} ctx=${ctx} label=${false} /> ${t('bucket.addedBy', { name: nameOf(item.created_by, ctx) })} · ${catLabel(item.category)}</p>
    </section>
    ${item.status === 'todo'
      ? html`<section class="card form">
          <h2>${t('bucket.didIt')}</h2>
          <label>${t('bucket.doneDate')}<input type="date" value=${doneOn} onInput=${(e) => setDoneOn(e.target.value)} /></label>
          <button class="btn primary" onClick=${markDone}>${t('bucket.markDone')}</button>
        </section>`
      : html`<section class="card done-card">
          <p>${t('bucket.doneBanner', { date: fmtDate(item.done_on, true) })}</p>
          <button class="link small" onClick=${undo}>${t('bucket.undo')}</button>
        </section>
        <button class="card qcard" onClick=${() => go(`#/q/${encodeURIComponent(qKey)}`)}>
          <span class="card-kicker">${t('q.bucketKicker')}</span>
          <p class="qtext">${bucketQuestion(item)}</p>
          <${AnswerPills} status=${status} />
        </button>`}
    <section class="card">
      <div class="row-between"><h2>${t('diary.section')}</h2><button class="btn small" onClick=${() => go(`#/diary-new?bucket=${id}&date=${item.done_on || kstToday()}`)}>${t('diary.write')}</button></div>
      ${diaries.length ? html`<${DiaryGrid} diaries=${diaries} ctx=${ctx} />` : html`<p class="muted small">${t('bucket.diaryEmpty')}</p>`}
    </section>
  </main>`;
}

// ---------------------------------------------------------------- diary
function Thumb({ path }) {
  const [url, setUrl] = useState(null);
  useEffect(() => { if (path) signedUrls([path]).then((u) => setUrl(u[0])); }, [path]);
  return url ? html`<img src=${url} alt="" loading="lazy" />` : html`<span class="thumb-ph"></span>`;
}

function DiaryGrid({ diaries, ctx }) {
  return html`<ul class="grid">${diaries.map((d) => html`<li>
    <button onClick=${() => go('#/diary/' + d.id)} class=${'grid-item ' + (d.created_by === ctx.user.id ? 'me' : 'you')} aria-label=${d.title}>
      ${d.photo_paths?.length ? html`<${Thumb} path=${d.photo_paths[0]} />` : html`<span class="thumb-ph text">${d.title.slice(0, 12)}</span>`}
      <span class="cap">${fmtDate(d.date)}</span>
    </button></li>`)}</ul>`;
}

function DiaryNew({ ctx, query }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(query.date || kstToday());
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const previews = files.map((f) => URL.createObjectURL(f));
  async function save(e) {
    e.preventDefault();
    if (!title.trim()) return toast(t('err.titleRequired'));
    setBusy(true);
    try {
      const paths = [];
      for (const f of files) {
        const blob = await compressImage(f);
        const path = `${ctx.couple.id}/${crypto.randomUUID()}.jpg`;
        const { error } = await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
        if (error) throw error;
        paths.push(path);
      }
      const { data, error } = await sb.from('diaries').insert({
        couple_id: ctx.couple.id, bucket_item_id: query.bucket || null, date, title: title.trim(), body, photo_paths: paths, created_by: ctx.user.id,
      }).select('id').single();
      if (error) throw error;
      toast(t('diary.saved'));
      location.replace('#/diary/' + data.id);
    } catch (e2) { toast(errMsg(e2)); }
    setBusy(false);
  }
  return html`<main class="page">
    <${Header} title=${t('diary.newTitle')} back="#/memories" />
    <form class="card form" onSubmit=${save}>
      <label class="photo-pick">
        <input type="file" accept="image/*" multiple onChange=${(e) => setFiles([...files, ...e.target.files].slice(0, 10))} />
        <span>${t('diary.addPhotos')}</span>
      </label>
      ${files.length > 0 && html`<div class="preview-row">${previews.map((u, i) => html`<button type="button" class="preview" onClick=${() => setFiles(files.filter((_, j) => j !== i))} aria-label=${t('diary.removePhoto')}><img src=${u} alt="" /><span>×</span></button>`)}</div>`}
      <label>${t('diary.date')}<input type="date" value=${date} onInput=${(e) => setDate(e.target.value)} /></label>
      <label>${t('diary.titleLabel')}<input value=${title} onInput=${(e) => setTitle(e.target.value)} maxlength="40" placeholder=${t('diary.titlePh')} /></label>
      <label>${t('diary.body')}<textarea rows="6" value=${body} onInput=${(e) => setBody(e.target.value)} placeholder=${t('diary.bodyPh')}></textarea></label>
      <button class="btn primary" disabled=${busy}>${busy ? t('diary.saving') : t('diary.save')}</button>
    </form>
  </main>`;
}

function DiaryView({ ctx, id }) {
  const [d, setD] = useState(null);
  const [urls, setUrls] = useState([]);
  const [best, setBest] = useState([]);
  const [bucket, setBucket] = useState(null);
  const load = async () => {
    const { data } = await sb.from('diaries').select('*').eq('id', id).maybeSingle();
    setD(data || false);
    if (data?.photo_paths?.length) setUrls(await signedUrls(data.photo_paths));
    if (data?.bucket_item_id) sb.from('bucket_items').select('id,title,emoji,preset_id').eq('id', data.bucket_item_id).maybeSingle().then(({ data: b }) => setBucket(b));
    const { data: bm } = await sb.from('best_moments').select('user_id').eq('diary_id', id);
    setBest((bm || []).map((b) => b.user_id));
  };
  useEffect(() => { load(); }, [id]);
  if (d === null) return html`<main class="page"><${Header} title="" back="#/memories" /><p class="muted center">${t('loading')}</p></main>`;
  if (d === false) return html`<main class="page"><${Header} title="" back="#/memories" /><${Empty}>${t('diary.missing')}<//></main>`;
  const mine = best.includes(ctx.user.id);
  const theirs = ctx.partner && best.includes(ctx.partner.id);
  async function toggleBest() {
    if (mine) await sb.from('best_moments').delete().eq('diary_id', id).eq('user_id', ctx.user.id);
    else await sb.from('best_moments').insert({ diary_id: id, user_id: ctx.user.id });
    load();
  }
  async function remove() {
    if (!confirm(t('diary.confirmDelete'))) return;
    if (d.photo_paths?.length) await sb.storage.from('photos').remove(d.photo_paths);
    await sb.from('diaries').delete().eq('id', id);
    go('#/memories');
  }
  return html`<main class="page diary">
    <${Header} title="" back="#/memories" right=${d.created_by === ctx.user.id ? html`<button class="icon-btn" aria-label=${t('delete')} onClick=${remove}>🗑</button>` : null} />
    ${urls.length > 0 && html`<div class="photos">${urls.map((u) => html`<img src=${u} alt="" />`)}</div>`}
    <article class=${'diary-body ' + (d.created_by === ctx.user.id ? 'me' : 'you')}>
      <p class="muted small">${fmtDate(d.date, true)} · <${Who} id=${d.created_by} ctx=${ctx} /></p>
      <h1>${d.title}</h1>
      ${bucket && html`<button class="tag" onClick=${() => go('#/bucket/' + bucket.id)}>${bucket.emoji} ${bucketTitle(bucket)}</button>`}
      <p class="prose">${d.body}</p>
    </article>
    <section class="best-row">
      <button class=${'best me ' + (mine ? 'on' : '')} onClick=${toggleBest} aria-pressed=${mine}>${mine ? t('best.mine') : t('best.add')}</button>
      ${theirs && html`<span class="best you on">${t('best.theirs')}</span>`}
    </section>
  </main>`;
}

function Memories({ ctx, query }) {
  const [tab, setTab] = useState(query.tab || 'all');
  const [diaries, setDiaries] = useState(null);
  const [best, setBest] = useState([]);
  useEffect(() => {
    sb.from('diaries').select('id,title,date,photo_paths,created_by').order('date', { ascending: false }).then(({ data }) => setDiaries(data || []));
    sb.from('best_moments').select('user_id,diary_id').then(({ data }) => setBest(data || []));
  }, []);
  const pick = (uid) => (diaries || []).filter((d) => best.some((b) => b.diary_id === d.id && b.user_id === uid));
  const shown = tab === 'all' ? diaries || [] : tab === 'me' ? pick(ctx.user.id) : pick(ctx.partner?.id);
  return html`<main class="page">
    <${Header} title=${t('mem.title')} back="#/" right=${html`<button class="icon-btn" aria-label=${t('mem.writeAria')} onClick=${() => go('#/diary-new')}>＋</button>`} />
    <div class="seg" role="tablist">
      <button role="tab" aria-selected=${tab === 'all'} onClick=${() => setTab('all')}>${t('mem.all')}</button>
      <button role="tab" aria-selected=${tab === 'me'} onClick=${() => setTab('me')}>${t('mem.mine')}</button>
      <button role="tab" aria-selected=${tab === 'you'} onClick=${() => setTab('you')}>${t('mem.theirs')}</button>
    </div>
    ${diaries === null ? html`<p class="muted center">${t('loading')}</p>` : shown.length
      ? html`<${DiaryGrid} diaries=${shown} ctx=${ctx} />`
      : html`<${Empty} action=${tab === 'all' ? html`<button class="btn primary" onClick=${() => go('#/diary-new')}>${t('mem.first')}</button>` : ''}>
          ${tab === 'all' ? t('mem.empty') : t('mem.bestEmpty')}<//>`}
  </main>`;
}

// ---------------------------------------------------------------- questions
function Question({ ctx, qkey }) {
  const [bucketItem, setBucketItem] = useState(undefined);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const kind = qkey.split(':')[0];
  const ref = qkey.split(':').slice(1).join(':');
  const load = useCallback(async () => {
    const { data } = await sb.from('answers').select('*').eq('question_key', qkey);
    setAnswers(data || []);
    const mineA = (data || []).find((a) => a.user_id === ctx.user.id);
    if (mineA) setDraft(mineA.body);
    const { data: st } = await sb.rpc('answer_status', { p_key: qkey });
    setStatus(st && st[0]);
  }, [qkey]);
  useEffect(() => {
    if (kind === 'bucket') sb.from('bucket_items').select('question,preset_id').eq('id', ref).maybeSingle().then(({ data }) => setBucketItem(data));
    load();
    const ch = sb.channel('answers-' + qkey)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter: `couple_id=eq.${ctx.couple.id}` }, load)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [qkey]);
  const text = kind === 'daily' ? dailyQuestionFor(ref) : bucketItem === undefined ? '…' : bucketQuestion(bucketItem);
  const mine = answers.find((a) => a.user_id === ctx.user.id);
  const theirs = answers.find((a) => a.user_id !== ctx.user.id);
  async function save(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    const now = new Date().toISOString();
    const { error } = mine
      ? await sb.from('answers').update({ body: draft.trim(), updated_at: now }).eq('id', mine.id)
      : await sb.from('answers').insert({ couple_id: ctx.couple.id, question_key: qkey, question_text: text, user_id: ctx.user.id, body: draft.trim() });
    setBusy(false);
    if (error) return toast(errMsg(error));
    setEditing(false); load();
  }
  return html`<main class="page">
    <${Header} title=${kind === 'daily' ? fmtDate(ref) : t('q.bucketKicker')} back="#/q" />
    <section class="q-hero"><p>${text}</p></section>
    <section class="answer me">
      <h2><${Who} id=${ctx.user.id} ctx=${ctx} /></h2>
      ${mine && !editing
        ? html`<p class="prose">${mine.body}</p><button class="link small" onClick=${() => setEditing(true)}>${t('q.edit')}</button>`
        : html`<form class="form" onSubmit=${save}>
            <textarea rows="5" value=${draft} onInput=${(e) => setDraft(e.target.value)} placeholder=${t('q.answerPh')}></textarea>
            <button class="btn primary" disabled=${busy || !draft.trim()}>${mine ? t('q.saveEdit') : t('q.answer')}</button>
          </form>`}
    </section>
    <section class="answer you">
      <h2>${ctx.partner ? html`<${Who} id=${ctx.partner.id} ctx=${ctx} />` : t('partner')}</h2>
      ${theirs ? html`<p class="prose">${theirs.body}</p>`
        : status?.partner ? html`<p class="locked">${t('q.locked')}</p>`
        : html`<p class="muted">${t('q.waiting')}</p>`}
    </section>
  </main>`;
}

function QuestionHome({ ctx }) {
  const [history, setHistory] = useState(null);
  const [bucketMap, setBucketMap] = useState(new Map());
  const key = `daily:${kstToday()}`;
  useEffect(() => {
    sb.from('answers').select('question_key,question_text,user_id,created_at').order('created_at', { ascending: false }).then(({ data }) => {
      const map = new Map();
      for (const a of data || []) {
        const e = map.get(a.question_key) || { key: a.question_key, text: a.question_text, users: new Set() };
        e.users.add(a.user_id);
        map.set(a.question_key, e);
      }
      setHistory([...map.values()]);
    });
    sb.from('bucket_items').select('id,question,preset_id').then(({ data }) => setBucketMap(new Map((data || []).map((b) => [b.id, b]))));
  }, []);
  const textOf = (h) => {
    if (h.key.startsWith('daily:')) return dailyQuestionFor(h.key.slice(6));
    const b = bucketMap.get(h.key.slice(7));
    return b ? bucketQuestion(b) : h.text;
  };
  return html`<main class="page">
    <${TalkSwitch} active="q" ctx=${ctx} />
    <button class="card qcard" onClick=${() => go(`#/q/${encodeURIComponent(key)}`)}>
      <span class="card-kicker">${t('q.todayKicker')}</span>
      <p class="qtext">${dailyQuestionFor(kstToday())}</p>
    </button>
    <h2 class="section-title">${t('q.history')}</h2>
    ${history === null ? html`<p class="muted center">${t('loading')}</p>` : history.length === 0
      ? html`<${Empty}>${t('q.historyEmpty')}<//>`
      : html`<ul class="list">${history.map((h) => html`<li>
          <button class="list-item" onClick=${() => go(`#/q/${encodeURIComponent(h.key)}`)}>
            <span class="grow"><b>${textOf(h)}</b><small>${h.key.startsWith('daily:') ? fmtDate(h.key.slice(6)) : t('bucket.title')}</small></span>
            <span class="dots" aria-hidden="true">${h.users.has(ctx.user.id) ? html`<i class="me"></i>` : html`<i class="empty"></i>`}${ctx.partner && h.users.has(ctx.partner.id) ? html`<i class="you"></i>` : html`<i class="empty"></i>`}</span>
          </button></li>`)}</ul>`}
  </main>`;
}

// ---------------------------------------------------------------- notes
function Notes({ ctx, query }) {
  const [notes, setNotes] = useState(null);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const load = useCallback(async () => {
    const { data } = await sb.from('notes').select('*').order('created_at', { ascending: true }).limit(200);
    setNotes(data || []);
    const unread = (data || []).filter((n) => n.sender_id !== ctx.user.id && !n.read_at).map((n) => n.id);
    if (unread.length) { await sb.from('notes').update({ read_at: new Date().toISOString() }).in('id', unread); ctx.refreshUnread(); }
  }, []);
  useEffect(() => {
    load();
    const ch = sb.channel('notes-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes', filter: `couple_id=eq.${ctx.couple.id}` }, load)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);
  useEffect(() => {
    if (!notes) return;
    const el = query.focus && document.getElementById('note-' + query.focus);
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
    else endRef.current?.scrollIntoView();
  }, [notes, query.focus]);
  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    const { error } = await sb.from('notes').insert({ couple_id: ctx.couple.id, sender_id: ctx.user.id, body });
    if (error) { setText(body); return toast(errMsg(error)); }
    load();
  }
  return html`<main class="page notes">
    <${TalkSwitch} active="notes" ctx=${ctx} />
    ${notes === null ? html`<p class="muted center">${t('loading')}</p>` : notes.length === 0
      ? html`<${Empty}>${t('notes.empty')}<//>`
      : html`<ul class="note-list">${notes.map((n) => html`<li id=${'note-' + n.id} class=${'note ' + (n.sender_id === ctx.user.id ? 'me' : 'you')}>
          <p>${n.body}</p><small>${timeAgo(n.created_at)}${n.sender_id === ctx.user.id && n.read_at ? ' · ' + t('notes.read') : ''}</small>
        </li>`)}</ul>`}
    <div ref=${endRef}></div>
    <form class="note-compose" onSubmit=${send}>
      <input value=${text} onInput=${(e) => setText(e.target.value.slice(0, 60))} placeholder=${t('notes.ph')} maxlength="60" aria-label=${t('notes.ph')} />
      <span class="count">${text.length}/60</span>
      <button class="btn primary" disabled=${!text.trim()}>${t('notes.send')}</button>
    </form>
  </main>`;
}

// ---------------------------------------------------------------- calendar
function Calendar({ ctx }) {
  const today = kstToday();
  const [ym, setYm] = useState(today.slice(0, 7));
  const [sel, setSel] = useState(today);
  const [diaries, setDiaries] = useState([]);
  const [annivs, setAnnivs] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [form, setForm] = useState({ title: '', date: today, repeat: true });
  const [showForm, setShowForm] = useState(false);
  const loadAnniv = () => sb.from('anniversaries').select('*').order('date').then(({ data }) => setAnnivs(data || []));
  useEffect(() => {
    sb.from('diaries').select('id,title,date,created_by').then(({ data }) => setDiaries(data || []));
    sb.from('bucket_items').select('id,title,emoji,done_on,preset_id').eq('status', 'done').then(({ data }) => setBuckets(data || []));
    loadAnniv();
  }, []);
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const nDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: nDays }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)];
  const started = ctx.couple.started_on;
  function eventsOn(day) {
    const ev = [];
    if (started && day >= started) {
      const n = daysBetween(started, day) + 1;
      if (n % 100 === 0) ev.push(t('ev.days', { n }));
      if (day.slice(5) === started.slice(5) && day !== started) ev.push(t('ev.years', { n: Number(day.slice(0, 4)) - Number(started.slice(0, 4)) }));
    }
    if (day === started) ev.push(t('ev.firstDay'));
    for (const a of annivs) if (a.repeat_yearly ? a.date.slice(5) === day.slice(5) && day >= a.date : a.date === day) ev.push(a.title);
    return ev;
  }
  const move = (d) => { const dt = new Date(Date.UTC(y, m - 1 + d, 1)); setYm(dt.toISOString().slice(0, 7)); };
  async function addAnniv(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const { error } = await sb.from('anniversaries').insert({ couple_id: ctx.couple.id, title: form.title.trim(), date: form.date, repeat_yearly: form.repeat });
    if (error) return toast(errMsg(error));
    setForm({ title: '', date: today, repeat: true }); setShowForm(false); loadAnniv();
  }
  async function delAnniv(id) {
    if (!confirm(t('anniv.confirmDelete'))) return;
    await sb.from('anniversaries').delete().eq('id', id); loadAnniv();
  }
  const selDiaries = diaries.filter((d) => d.date === sel);
  const selBuckets = buckets.filter((b) => b.done_on === sel);
  const selEvents = eventsOn(sel);
  return html`<main class="page">
    <${Header} title=${t('cal.title')} />
    <div class="cal-head">
      <button class="icon-btn" aria-label=${t('cal.prev')} onClick=${() => move(-1)}>‹</button>
      <b>${fmtMonth(y, m)}</b>
      <button class="icon-btn" aria-label=${t('cal.next')} onClick=${() => move(1)}>›</button>
    </div>
    <div class="cal">
      ${WEEKDAYS[getLang()].map((w) => html`<span class="wd">${w}</span>`)}
      ${cells.map((c) => c ? html`<button class=${'day ' + (c === today ? 'today ' : '') + (c === sel ? 'sel' : '')} aria-pressed=${c === sel} onClick=${() => setSel(c)}>
          <span>${Number(c.slice(8))}</span>
          <span class="marks">
            ${diaries.some((d) => d.date === c && d.created_by === ctx.user.id) && html`<i class="me"></i>`}
            ${diaries.some((d) => d.date === c && d.created_by !== ctx.user.id) && html`<i class="you"></i>`}
            ${(eventsOn(c).length > 0 || buckets.some((b) => b.done_on === c)) && html`<i class="ev"></i>`}
          </span>
        </button>` : html`<span></span>`)}
    </div>
    <section class="card">
      <div class="row-between"><h2>${fmtDate(sel)}</h2><button class="btn small" onClick=${() => go(`#/diary-new?date=${sel}`)}>${t('cal.recordDay')}</button></div>
      ${started && sel >= started && html`<p class="muted small">${t('cal.nthDay', { n: daysBetween(started, sel) + 1 })}</p>`}
      ${selEvents.map((e) => html`<p class="ev-line">🎈 ${e}</p>`)}
      ${selBuckets.map((b) => html`<button class="ev-line link-like" onClick=${() => go('#/bucket/' + b.id)}>${t('cal.bucketDone', { emoji: b.emoji, title: bucketTitle(b) })}</button>`)}
      ${selDiaries.map((d) => html`<button class="ev-line link-like" onClick=${() => go('#/diary/' + d.id)}><${Who} id=${d.created_by} ctx=${ctx} label=${false} /> ${d.title}</button>`)}
      ${!selEvents.length && !selBuckets.length && !selDiaries.length && html`<p class="muted small">${t('cal.empty')}</p>`}
    </section>
    <section class="card">
      <div class="row-between"><h2>${t('anniv.title')}</h2><button class="link" onClick=${() => setShowForm(!showForm)}>${showForm ? t('close') : t('anniv.add')}</button></div>
      ${showForm && html`<form class="form" onSubmit=${addAnniv}>
        <input value=${form.title} onInput=${(e) => setForm({ ...form, title: e.target.value })} placeholder=${t('anniv.ph')} maxlength="20" />
        <input type="date" value=${form.date} onInput=${(e) => setForm({ ...form, date: e.target.value })} />
        <label class="check"><input type="checkbox" checked=${form.repeat} onChange=${(e) => setForm({ ...form, repeat: e.target.checked })} /> ${t('anniv.yearly')}</label>
        <button class="btn primary">${t('anniv.addBtn')}</button>
      </form>`}
      <${EventList} events=${upcomingEvents(started, annivs, 8)} onDelete=${delAnniv} />
    </section>
  </main>`;
}

// ---------------------------------------------------------------- settings
function Settings({ ctx }) {
  const lang = getLang();
  const [nick, setNick] = useState(ctx.profile.nickname);
  const [start, setStart] = useState(ctx.couple.started_on || '');
  const [push, setPush] = useState('…');
  const [busy, setBusy] = useState(false);
  const [font, setFontState] = useState(document.documentElement.dataset.font || DEFAULT_FONT[lang]);
  const [size, setSizeState] = useState(Number(ctx.profile.font_size) || 1);
  const [photoBusy, setPhotoBusy] = useState(false);
  useEffect(() => { currentPushState().then(setPush); }, []);
  async function changePhoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    try {
      const blob = await squareImage(file, 512);
      const path = `${ctx.couple.id}/avatars/${ctx.user.id}-${Date.now()}.jpg`;
      const { error: upErr } = await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const old = ctx.profile.avatar_path;
      const { error } = await sb.from('profiles').update({ avatar_path: path }).eq('id', ctx.user.id);
      if (error) throw error;
      if (old) await sb.storage.from('photos').remove([old]);
      toast(t('set.photoSaved'));
      await ctx.reload();
    } catch (e2) { toast(errMsg(e2)); }
    setPhotoBusy(false);
  }
  async function removePhoto() {
    const old = ctx.profile.avatar_path;
    if (!old) return;
    setPhotoBusy(true);
    const { error } = await sb.from('profiles').update({ avatar_path: null }).eq('id', ctx.user.id);
    if (error) toast(errMsg(error));
    else { await sb.storage.from('photos').remove([old]); toast(t('set.photoRemoved')); await ctx.reload(); }
    setPhotoBusy(false);
  }
  async function saveNick() {
    const { error } = await sb.from('profiles').update({ nickname: nick.trim() || ctx.profile.nickname }).eq('id', ctx.user.id);
    if (error) return toast(errMsg(error));
    toast(t('set.nameSaved')); ctx.reload();
  }
  async function saveStart() {
    const { error } = await sb.from('couples').update({ started_on: start || null }).eq('id', ctx.couple.id);
    if (error) return toast(errMsg(error));
    toast(t('set.dateSaved')); ctx.reload();
  }
  async function pickFont(id) {
    setFontState(applyFont(id));
    await sb.from('profiles').update({ font_pref: id }).eq('id', ctx.user.id);
  }
  async function pickSize(v) {
    applySize(v);
    setSizeState(v);
    await sb.from('profiles').update({ font_size: v }).eq('id', ctx.user.id);
  }
  async function togglePush() {
    setBusy(true);
    try {
      if (push === 'on') { await disablePush(); toast(t('set.notifOffToast')); }
      else { await enablePush(ctx.user.id); toast(t('set.notifOnToast')); }
    } catch (e) { toast(errMsg(e)); }
    setPush(await currentPushState());
    setBusy(false);
  }
  async function testPush() {
    const { error } = await sb.rpc('send_test_push');
    toast(error ? errMsg(error) : t('set.testSent'));
  }
  const ios = /iPhone|iPad/.test(navigator.userAgent);
  const sizeIdx = SIZES.indexOf(size);
  return html`<main class="page">
    <${Header} title=${t('tab.me')} />

    <section class="card form">
      <h2>${t('set.profile')}</h2>
      <div class="profile-row">
        <${Avatar} person=${ctx.profile} mine=${true} size="lg" />
        <div class="profile-actions">
          <label class=${'btn small' + (photoBusy ? ' disabled' : '')}>
            <input type="file" accept="image/*" class="visually-hidden" disabled=${photoBusy} onChange=${changePhoto} />
            ${photoBusy ? t('set.photoUploading') : ctx.profile.avatar_path ? t('set.photoChange') : t('set.photoAdd')}
          </label>
          ${ctx.profile.avatar_path && html`<button class="link small" disabled=${photoBusy} onClick=${removePhoto}>${t('set.photoRemove')}</button>`}
        </div>
      </div>
      <label>${t('set.name')}<div class="inline"><input value=${nick} onInput=${(e) => setNick(e.target.value)} maxlength="12" /><button class="btn" onClick=${saveNick}>${t('save')}</button></div></label>
    </section>

    <section class="card form">
      <h2>${t('set.language')}</h2>
      <${LangSwitch} onChange=${ctx.changeLang} />
      <p class="muted small">${t('set.languageHint')}</p>
    </section>

    <section class="card">
      <h2>${t('set.size')}</h2>
      <div class="size-row" role="radiogroup" aria-label=${t('set.size')}>
        ${SIZES.map((v, i) => html`<button role="radio" aria-checked=${size === v} class=${'size-opt ' + (size === v ? 'on' : '')} onClick=${() => pickSize(v)}>
          <span class="size-a" style=${`font-size:${14 + i * 3}px`}>${lang === 'zh' ? '字' : lang === 'en' ? 'Aa' : '가'}</span>
          <small>${t('size.' + i)}</small>
        </button>`)}
      </div>
      <p class="size-preview">${t('set.sizePreview')}</p>
      <p class="muted small">${t('size.' + (sizeIdx < 0 ? 1 : sizeIdx))}</p>
    </section>

    <section class="card">
      <h2>${t('set.font')}</h2>
      <ul class="font-list">${FONTS[lang].map((f) => html`<li>
        <button class=${'font-opt ' + (font === f.id ? 'on' : '')} data-font=${f.id} aria-pressed=${font === f.id} onClick=${() => pickFont(f.id)}>
          <span class="font-sample" style=${`font-family:var(--font-${f.id})`}>${t('set.sample')}</span>
          <small>${f.name} · ${f.desc}</small>
        </button></li>`)}</ul>
    </section>

    <section class="card form">
      <h2>${t('set.notif')}</h2>
      ${push === 'unsupported' || (ios && !isStandalone())
        ? html`<ol class="steps"><li>${t('set.ios1')}</li><li>${t('set.ios2')}</li><li>${t('set.ios3')}</li></ol>`
        : push === 'denied'
          ? html`<p class="muted">${t('set.denied')}</p>`
          : html`<button class=${'btn ' + (push === 'on' ? '' : 'primary')} disabled=${busy} onClick=${togglePush}>${push === 'on' ? t('set.notifOff') : t('set.notifOn')}</button>
                 ${push === 'on' && html`<button class="btn" onClick=${testPush}>${t('set.test')}</button>
                 <p class="muted small">${t('set.notifDesc')}</p>`}`}
    </section>

    <section class="card form">
      <h2>${t('set.us')}</h2>
      <label>${t('set.startDate')}<div class="inline"><input type="date" value=${start} onInput=${(e) => setStart(e.target.value)} /><button class="btn" onClick=${saveStart}>${t('save')}</button></div></label>
      <p class="muted small">${ctx.partner ? t('set.partner', { name: ctx.partner.nickname }) : t('set.partnerPending', { code: ctx.couple.invite_code })}</p>
    </section>

    <button class="btn ghost wide" onClick=${() => sb.auth.signOut()}>${t('logout')}</button>
  </main>`;
}

// ---------------------------------------------------------------- shell
// Line icons drawn at 24px; stroke takes the tab's current color.
const svg = (body) => html`<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICONS = {
  home: () => svg(html`<path d="M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z" />`),
  bucket: () => svg(html`<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="m8.5 12.2 2.4 2.4 4.6-5" />`),
  talk: () => svg(html`<path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-6.5L8 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z" /><path d="M8 9.5h8M8 12.5h5" />`),
  cal: () => svg(html`<rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" />`),
};

const lastTalk = () => { try { return localStorage.getItem('talkTab') === 'notes' ? '#/notes' : '#/q'; } catch (e) { return '#/q'; } };
const TABS = [
  { k: 'tab.home', icon: 'home', h: () => '#/', match: (p) => p === '/' || p.startsWith('/memories') || p.startsWith('/diary') },
  { k: 'tab.bucket', icon: 'bucket', h: () => '#/bucket', match: (p) => p.startsWith('/bucket') },
  { k: 'tab.talk', icon: 'talk', h: lastTalk, match: (p) => p.startsWith('/q') || p.startsWith('/notes'), badge: true },
  { k: 'tab.cal', icon: 'cal', h: () => '#/calendar', match: (p) => p.startsWith('/calendar') },
  { k: 'tab.me', icon: 'me', h: () => '#/me', match: (p) => p.startsWith('/me') || p.startsWith('/settings') },
];

// Top switch shared by the Q&A and Notes screens (they live under one tab).
function TalkSwitch({ active, ctx }) {
  useEffect(() => { try { localStorage.setItem('talkTab', active); } catch (e) {} }, [active]);
  return html`<nav class="talk-switch seg" aria-label=${t('tab.talk')}>
    <a href="#/q" aria-current=${active === 'q' ? 'page' : null} class=${active === 'q' ? 'on' : ''}>${t('q.homeTitle')}</a>
    <a href="#/notes" aria-current=${active === 'notes' ? 'page' : null} class=${active === 'notes' ? 'on' : ''}>${t('notes.title')}${ctx.unread > 0 && active !== 'notes' ? html`<span class="badge inline">${ctx.unread}</span>` : ''}</a>
  </nav>`;
}

function Main({ ctx }) {
  const { path, query } = useRoute();
  let page;
  let m;
  if (path === '/' || path === '') page = html`<${Home} ctx=${ctx} />`;
  else if (path === '/bucket') page = html`<${BucketList} ctx=${ctx} query=${query} />`;
  else if (path === '/bucket-pick') page = html`<${BucketPick} ctx=${ctx} />`;
  else if ((m = path.match(/^\/bucket\/(.+)$/))) page = html`<${BucketDetail} ctx=${ctx} id=${m[1]} key=${m[1]} />`;
  else if (path === '/diary-new') page = html`<${DiaryNew} ctx=${ctx} query=${query} />`;
  else if ((m = path.match(/^\/diary\/(.+)$/))) page = html`<${DiaryView} ctx=${ctx} id=${m[1]} key=${m[1]} />`;
  else if (path === '/memories') page = html`<${Memories} ctx=${ctx} query=${query} />`;
  else if (path === '/q') page = html`<${QuestionHome} ctx=${ctx} />`;
  else if ((m = path.match(/^\/q\/(.+)$/))) page = html`<${Question} ctx=${ctx} qkey=${decodeURIComponent(m[1])} key=${m[1]} />`;
  else if (path === '/notes') page = html`<${Notes} ctx=${ctx} query=${query} key=${query.focus || 'n'} />`;
  else if (path === '/calendar') page = html`<${Calendar} ctx=${ctx} />`;
  else if (path === '/me' || path === '/settings') page = html`<${Settings} ctx=${ctx} />`;
  else page = html`<main class="page"><${Header} title="" back="#/" /><${Empty} action=${html`<button class="btn" onClick=${() => go('#/')}>${t('goHome')}</button>`}>${t('notFound')}<//></main>`;
  return html`${page}
    <nav class="tabbar" aria-label="Menu">${TABS.map((tb) => {
      const on = tb.match(path);
      return html`<a href=${tb.h()} class=${on ? 'on' : ''} aria-current=${on ? 'page' : null}>
        <span class="ti">${tb.icon === 'me' ? html`<${Avatar} person=${ctx.profile} mine=${true} size="tab" />` : ICONS[tb.icon]()}</span>
        <span class="tl">${t(tb.k)}</span>
        ${tb.badge && ctx.unread > 0 && html`<span class="badge" aria-label=${String(ctx.unread)}>${ctx.unread}</span>`}
      </a>`;
    })}</nav>`;
}

function App() {
  const [session, setSession] = useState(undefined);
  const [state, setState] = useState(null);
  const [unread, setUnread] = useState(0);
  const [lang, setLangState] = useState(getLang());

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data?.type === 'navigate' && e.data.hash) location.hash = e.data.hash;
      });
    }
    return () => sub.subscription.unsubscribe();
  }, []);

  const changeLang = useCallback(async (l) => {
    setLang(l);
    setLangState(l);
    const f = applyFont(document.documentElement.dataset.font, l);
    const { data } = await sb.auth.getSession();
    if (data.session) await sb.from('profiles').update({ lang: l, font_pref: f }).eq('id', data.session.user.id);
  }, []);

  const reload = useCallback(async () => {
    if (!session) { setState(null); return; }
    const uid = session.user.id;
    const [{ data: profile }] = await Promise.all([sb.from('profiles').select('*').eq('id', uid).maybeSingle(), loadContent()]);
    if (!profile) { setState({ profile: { nickname: '' }, couple: null }); return; }
    // The account's saved language wins; a first login adopts whatever was picked on this device.
    if (profile.lang && profile.lang !== getLang()) { setLang(profile.lang); setLangState(profile.lang); }
    if (!profile.lang) await sb.from('profiles').update({ lang: getLang() }).eq('id', uid);
    applyFont(profile.font_pref, getLang());
    applySize(Number(profile.font_size) || 1);
    let couple = null, partner = null;
    if (profile.couple_id) {
      const { data: c } = await sb.from('couples').select('*').eq('id', profile.couple_id).maybeSingle();
      couple = c;
      const { data: p } = await sb.from('profiles').select('id,nickname,avatar_path').eq('couple_id', profile.couple_id).neq('id', uid).maybeSingle();
      partner = p;
    }
    setState({ profile, couple, partner });
  }, [session?.user?.id]);

  const refreshUnread = useCallback(async () => {
    if (!session) return;
    const { count } = await sb.from('notes').select('id', { count: 'exact', head: true }).neq('sender_id', session.user.id).is('read_at', null);
    setUnread(count || 0);
  }, [session?.user?.id]);

  useEffect(() => { reload(); refreshUnread(); }, [session?.user?.id]);

  useEffect(() => {
    if (!state?.couple) return;
    const ch = sb.channel('shell')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `couple_id=eq.${state.couple.id}` }, refreshUnread)
      .subscribe();
    // coming back to the app picks up a partner who just joined or changed their photo/name
    const onVis = () => { if (document.visibilityState === 'visible') { refreshUnread(); reload(); } };
    document.addEventListener('visibilitychange', onVis);
    return () => { sb.removeChannel(ch); document.removeEventListener('visibilitychange', onVis); };
  }, [state?.couple?.id, !!state?.partner]);

  if (session === undefined || (session && !state)) return html`<div class="boot">${t('appName')}</div>`;
  if (!session) return html`<${Login} onLang=${changeLang} key=${lang} /><${Toast} />`;
  const ctx = { user: session.user, ...state, reload, unread, refreshUnread, changeLang };
  if (!state.couple) return html`<${Pair} ctx=${ctx} key=${lang} /><${Toast} />`;
  // key=lang remounts every screen so all text switches at once
  return html`<${Main} ctx=${ctx} key=${lang} /><${Toast} />`;
}

render(html`<${App} />`, document.getElementById('app'));
