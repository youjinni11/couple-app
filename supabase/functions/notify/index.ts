import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type Lang = "ko" | "en" | "zh";
type Msg = { title: string; body: string; url: string; tag: string };
type Person = { id: string; nickname: string; lang: Lang };

let secrets: Record<string, string> | null = null;
async function getSecrets() {
  if (secrets) return secrets;
  const { data, error } = await supabase.from("app_secrets").select("key,value");
  if (error) throw error;
  secrets = Object.fromEntries(data.map((r) => [r.key, r.value]));
  webpush.setVapidDetails("mailto:couple-app@example.com", secrets.vapid_public, secrets.vapid_private);
  return secrets;
}

const L = (lang: string | null): Lang => (lang === "en" || lang === "zh" ? lang : "ko");
const sfx = (l: Lang) => (l === "ko" ? "" : "_" + l);

// ---- notification text in the RECIPIENT's language ----
const TXT = {
  ko: {
    partner: "짝꿍",
    note: (n: string) => `💌 ${n}의 쪽지`,
    ansDaily: (n: string) => `${n}님이 오늘의 질문에 답했어요`,
    ansBucket: (n: string) => `${n}님이 버킷리스트 질문에 답했어요`,
    ansBody: (q: string) => `“${q}” — 나도 답하면 서로의 답을 볼 수 있어요`,
    diary: (n: string) => `📷 ${n}님이 추억을 기록했어요`,
    bucketAdded: "📝 버킷리스트가 추가됐어요",
    bucketDone: "🎉 버킷리스트 달성!",
    bucketDoneBody: (t: string) => `${t} — 관련 질문에 답해볼까요?`,
    daily: "오늘의 질문이 기다려요 🌙",
    test: "🔔 알림 테스트",
    testBody: "이 알림을 누르면 쪽지 화면으로 바로 열려요",
    defaultBucketQ: "이걸 함께하면서 가장 기억에 남는 순간은 언제였어?",
  },
  en: {
    partner: "Your partner",
    note: (n: string) => `💌 Note from ${n}`,
    ansDaily: (n: string) => `${n} answered today’s question`,
    ansBucket: (n: string) => `${n} answered a bucket list question`,
    ansBody: (q: string) => `“${q}” — answer it too to see each other’s answers`,
    diary: (n: string) => `📷 ${n} saved a memory`,
    bucketAdded: "📝 New bucket list item",
    bucketDone: "🎉 Bucket list item done!",
    bucketDoneBody: (t: string) => `${t} — want to answer its question?`,
    daily: "Today’s question is waiting 🌙",
    test: "🔔 Test notification",
    testBody: "Tap this to open the Notes screen",
    defaultBucketQ: "What was the most memorable moment of doing this together?",
  },
  zh: {
    partner: "另一半",
    note: (n: string) => `💌 ${n} 的纸条`,
    ansDaily: (n: string) => `${n} 回答了今日问题`,
    ansBucket: (n: string) => `${n} 回答了心愿问答`,
    ansBody: (q: string) => `“${q}” —— 你也回答后就能看到彼此的答案`,
    diary: (n: string) => `📷 ${n} 记录了一段回忆`,
    bucketAdded: "📝 心愿清单有新内容",
    bucketDone: "🎉 完成了一个心愿！",
    bucketDoneBody: (t: string) => `${t} —— 来回答相关问题吧？`,
    daily: "今日问题在等你 🌙",
    test: "🔔 通知测试",
    testBody: "点击此通知会直接打开纸条页面",
    defaultBucketQ: "一起做这件事时，最难忘的瞬间是什么时候？",
  },
};

function kstToday(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

let questions: Record<string, string>[] | null = null;
async function dailyQuestion(dateStr: string, lang: Lang) {
  if (!questions) {
    const { data } = await supabase.from("daily_questions").select("*").order("id");
    questions = data ?? [];
  }
  if (!questions.length) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayIndex = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2024, 0, 1)) / 86400000);
  const q = questions[((dayIndex % questions.length) + questions.length) % questions.length];
  return q["text" + sfx(lang)] || q.text;
}

async function bucketInfo(itemId: string | null, fallback?: Record<string, string>) {
  let item = fallback;
  if (!item && itemId) {
    const { data } = await supabase.from("bucket_items").select("*").eq("id", itemId).maybeSingle();
    item = data ?? undefined;
  }
  if (!item) return null;
  let preset: Record<string, string> | null = null;
  if (item.preset_id) {
    const { data } = await supabase.from("bucket_presets").select("*").eq("id", item.preset_id).maybeSingle();
    preset = data;
  }
  return {
    emoji: item.emoji,
    title: (l: Lang) => (preset ? preset["title" + sfx(l)] || preset.title : item!.title),
    question: (l: Lang) => (preset ? preset["question" + sfx(l)] || preset.question : item!.question || TXT[l].defaultBucketQ),
  };
}

async function coupleMembers(coupleId: string, actorId: string) {
  const { data } = await supabase.from("profiles").select("id,nickname,lang").eq("couple_id", coupleId);
  const people = (data ?? []).map((p) => ({ id: p.id, nickname: p.nickname, lang: L(p.lang) })) as Person[];
  return { actor: people.find((p) => p.id === actorId), recipients: people.filter((p) => p.id !== actorId) };
}

async function sendTo(people: Person[], build: (l: Lang) => Promise<Msg> | Msg) {
  if (!people.length) return 0;
  const { data: subs } = await supabase.from("push_subscriptions").select("*").in("user_id", people.map((p) => p.id));
  let sent = 0;
  for (const s of subs ?? []) {
    const person = people.find((p) => p.id === s.user_id)!;
    const msg = await build(person.lang);
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(msg),
        { TTL: 60 * 60 * 24 },
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      console.error("push failed", code, (e as Error).message);
      if (code === 404 || code === 410) await supabase.from("push_subscriptions").delete().eq("id", s.id);
    }
  }
  return sent;
}

Deno.serve(async (req) => {
  try {
    const s = await getSecrets();
    if (req.headers.get("x-webhook-token") !== s.webhook_token) return new Response("forbidden", { status: 403 });
    const { type, record } = await req.json();
    let sent = 0;

    if (type === "test") {
      const { data: p } = await supabase.from("profiles").select("id,nickname,lang").eq("id", record.user_id).maybeSingle();
      if (p) sent = await sendTo([{ id: p.id, nickname: p.nickname, lang: L(p.lang) }], (l) => ({ title: TXT[l].test, body: TXT[l].testBody, url: "#/notes", tag: "test" }));
    } else if (type === "daily_reminder") {
      const today = kstToday();
      const key = `daily:${today}`;
      const { data: users } = await supabase.from("profiles").select("id,nickname,lang").not("couple_id", "is", null);
      const { data: done } = await supabase.from("answers").select("user_id").eq("question_key", key);
      const doneSet = new Set((done ?? []).map((a) => a.user_id));
      const targets = (users ?? []).filter((u) => !doneSet.has(u.id)).map((u) => ({ id: u.id, nickname: u.nickname, lang: L(u.lang) }));
      sent = await sendTo(targets, async (l) => ({ title: TXT[l].daily, body: await dailyQuestion(today, l), url: `#/q/${encodeURIComponent(key)}`, tag: key }));
    } else {
      const actorId = record.sender_id ?? record.user_id ?? record.created_by;
      const { actor, recipients } = await coupleMembers(record.couple_id, actorId);
      const who = (l: Lang) => actor?.nickname || TXT[l].partner;

      if (type === "note") {
        sent = await sendTo(recipients, (l) => ({ title: TXT[l].note(who(l)), body: record.body, url: `#/notes?focus=${record.id}`, tag: `note-${record.id}` }));
      } else if (type === "answer") {
        const key = String(record.question_key);
        const isDaily = key.startsWith("daily:");
        const b = isDaily ? null : await bucketInfo(key.slice(7));
        sent = await sendTo(recipients, async (l) => ({
          title: isDaily ? TXT[l].ansDaily(who(l)) : TXT[l].ansBucket(who(l)),
          body: TXT[l].ansBody(isDaily ? await dailyQuestion(key.slice(6), l) : b ? b.question(l) : record.question_text),
          url: `#/q/${encodeURIComponent(key)}`,
          tag: `answer-${key}`,
        }));
      } else if (type === "diary") {
        sent = await sendTo(recipients, (l) => ({ title: TXT[l].diary(who(l)), body: record.title, url: `#/diary/${record.id}`, tag: `diary-${record.id}` }));
      } else if (type === "bucket_added" || type === "bucket_done") {
        const b = await bucketInfo(null, record);
        sent = await sendTo(recipients, (l) => {
          const label = `${b!.emoji} ${b!.title(l)}`;
          return type === "bucket_added"
            ? { title: TXT[l].bucketAdded, body: label, url: `#/bucket/${record.id}`, tag: `bucket-${record.id}` }
            : { title: TXT[l].bucketDone, body: TXT[l].bucketDoneBody(label), url: `#/bucket/${record.id}`, tag: `bucket-${record.id}` };
        });
      }
    }
    return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
