/**
 * 団体・貸切の相談フォーム送信 API（Vercel Serverless Function）
 *
 * 必要な環境変数（Vercel の Settings → Environment Variables）
 *   RESEND_API_KEY  Resend の API キー（必須）
 *   STORE_EMAIL     通知を受け取るアドレス（省略時 oneonone01010101@gmail.com）
 *   FROM_EMAIL      送信元。Resend でドメイン認証後に "ONE on ONE <info@oneonone-sakae.jp>" を設定。
 *                   未設定の間は onboarding@resend.dev から店舗宛てだけ送る（お客様への控えは送らない）
 */
const STORE_EMAIL = process.env.STORE_EMAIL || "oneonone01010101@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "";
const STORE_TEL = "052-957-6646";

const LIMITS = { name: 60, tel: 20, email: 120, date: 10, time: 20, people: 4, budget: 30, purpose: 30, message: 2000, page: 60 };

function clean(body) {
  const out = {};
  for (const [k, max] of Object.entries(LIMITS)) {
    out[k] = String(body?.[k] ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
  }
  return out;
}

function validate(d) {
  if (!d.name) return "お名前を入力してください。";
  if (!/^[0-9\-+() ]{10,}$/.test(d.tel)) return "電話番号を確認してください。";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return "メールアドレスを確認してください。";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return "希望日を選択してください。";
  if (!(Number(d.people) >= 1)) return "予定人数を入力してください。";
  return "";
}

const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function summary(d) {
  return [
    ["お名前", d.name], ["電話番号", d.tel], ["メール", d.email],
    ["希望日", d.date], ["希望時間", d.time || "未選択"], ["予定人数", `${d.people}名`],
    ["ご予算", d.budget || "未選択"], ["ご利用目的", d.purpose || "未選択"],
    ["ご要望", d.message || "（なし）"], ["送信ページ", d.page || "-"]
  ];
}

async function send(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "送信方法が正しくありません。" });
  }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }

  // 迷惑送信対策：隠し項目に入力があれば、成功したふりをして何もしない
  if (body?.company) return res.status(200).json({ ok: true });

  const d = clean(body);
  const problem = validate(d);
  if (problem) return res.status(400).json({ error: problem });
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "現在フォームを利用できません。" });
  }

  const rows = summary(d);
  const text = rows.map(([k, v]) => `■${k}\n${v}`).join("\n\n");
  const html = `<table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><th align="left" style="background:#f4efe6;border:1px solid #ddd;white-space:nowrap">${esc(k)}</th><td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;

  try {
    // 1) 店舗への通知（返信するとお客様に届く）
    await send({
      from: FROM_EMAIL || "ONE on ONE フォーム <onboarding@resend.dev>",
      to: [STORE_EMAIL],
      reply_to: d.email,
      subject: `【貸切・団体相談】${d.date} ${d.people}名 ${d.name}様`,
      text: `ホームページから団体・貸切の相談が届きました。\nこのメールに返信すると、お客様に届きます。\n\n${text}`,
      html: `<p>ホームページから団体・貸切の相談が届きました。<br>このメールに返信すると、お客様に届きます。</p>${html}`
    });

    // 2) お客様への控え（送信元ドメインの認証後のみ）
    if (FROM_EMAIL) {
      await send({
        from: FROM_EMAIL,
        to: [d.email],
        reply_to: STORE_EMAIL,
        subject: "【ONE on ONE】ご相談を受け付けました",
        text: `${d.name} 様\n\nONE on ONE へのご相談ありがとうございます。\n内容を確認のうえ、店舗より折り返しご連絡いたします。\n\n※このメールはご相談の受付控えです。この時点では予約は確定していません。\n日時・人数・料金をご確認いただいた時点で確定となります。\n\n${text}\n\n――――――――――\nONE on ONE（ワンオンワン）\n愛知県名古屋市中区錦3-10-21 プロシーム錦2F\nTEL ${STORE_TEL}（17:00〜）\nhttps://oneonone-sakae.jp/`
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "送信できませんでした。" });
  }
};
