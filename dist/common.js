/* ---------- analytics (GA4 想定) ---------- */
function track(event, params) {
  params = params || {};
  if (typeof window.gtag === "function") window.gtag("event", event, params);
  else console.info("[GA4]", event, params);
}
document.addEventListener("click", function (e) {
  const el = e.target.closest("[data-track]");
  if (el) track(el.dataset.track, { location: el.dataset.loc || "", site: el.dataset.book || "" });
});

/* ---------- helpers & bindings ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PREVIEW = !!document.querySelector(".previewbar"); // 本番ビルドではプレビューバーが無い
if (!PREVIEW) document.documentElement.classList.add("is-live"); // 本番では写真枠の説明文を出さない
const flag = label => PREVIEW ? `<span class="chk">${esc(label)}</span>` : "";
const chk = (item, label) => item.verified === false ? flag(label || item.flag || "要確認") : "";
const yen = n => n.toLocaleString("ja-JP");
const priceText = d => d.price ? `¥${yen(d.price)}${d.from ? "〜" : ""}` : "";
const decText = c => c.decNote ? c.decNote : !c.dec ? "" : (c.dec.price === c.price && c.dec.drink === c.drink) ? "12月も同じ内容" : `12月は¥${yen(c.dec.price)}・飲み放題${c.dec.drink}`;
const telHref = "tel:" + SITE.tel.replace(/-/g, "");

document.querySelectorAll("[data-bind=hoursShort]").forEach(n => n.textContent = SITE.hoursShort);
document.querySelectorAll("[data-book]").forEach(a => a.href = SITE.booking[a.dataset.book]);
document.querySelectorAll("[data-tel]").forEach(a => { a.href = telHref; a.textContent = SITE.tel; });
document.querySelectorAll("[data-tel-link]").forEach(a => a.href = telHref);
document.querySelectorAll("[data-tel-text]").forEach(n => n.textContent = SITE.tel);

if (SITE.season.active) {
  $("#season").innerHTML = `<a href="${esc(SITE.season.link)}" class="wrap"><span class="en">${esc(SITE.season.en)}</span><span>${esc(SITE.season.text)}</span><u>DETAIL</u></a>`;
} else $("#season").hidden = true;

/* ---------- UI ---------- */
$("#toggle-chk") && $("#toggle-chk").addEventListener("change", e => document.body.classList.toggle("show-chk", e.target.checked));

const menuBtn = $("#menu-btn"), drawer = $("#drawer");
menuBtn.addEventListener("click", () => { const open = drawer.hidden; drawer.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.textContent = open ? "CLOSE" : "MENU"; });
drawer.addEventListener("click", e => { if (e.target.closest("a")) { drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.textContent = "MENU"; } });

const sheet = $("#sheet");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-open-book]");
  if (!b) return;
  e.preventDefault();
  track("reserve_open", { location: b.dataset.loc || "" });
  sheet.hidden = false;
  sheet.querySelector("a").focus();
});
const closeSheet = () => { sheet.hidden = true; };
$("#sheet-close").addEventListener("click", closeSheet);
sheet.addEventListener("click", e => { if (e.target === sheet || e.target.closest("a")) closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

/* ---------- inquiry form（フォームがあるページのみ） ---------- */
if ($("#inq")) {
  const form = $("#inq"), done = $("#done");
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $("#f-date").min = today.toISOString().slice(0, 10);
  const rules = [
    ["f-name", "e-name", v => v.trim() ? "" : "お名前を入力してください"],
    ["f-tel", "e-tel", v => /^[0-9\-+() ]+$/.test(v.trim()) && v.replace(/\D/g, "").length >= 10 ? "" : "電話番号を数字で入力してください（例：090-1234-5678）"],
    ["f-mail", "e-mail", v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? "" : "メールアドレスの形式を確認してください"],
    ["f-date", "e-date", v => !v ? "希望日を選択してください" : v < today.toISOString().slice(0, 10) ? "今日以降の日付を選んでください" : ""],
    ["f-people", "e-people", v => Number(v) >= 1 ? "" : "予定人数を入力してください"]
  ];
  const IS_PREVIEW = PREVIEW;
  const openedAt = Date.now(); // 迷惑送信対策：開いてすぐの機械的な送信を見分ける
  const submitBtn = form.querySelector("button[type=submit]");
  const formErr = document.createElement("p");
  formErr.className = "err"; formErr.setAttribute("role", "alert");
  submitBtn.before(formErr);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    formErr.textContent = "";
    let first = null;
    rules.forEach(([id, eid, fn]) => {
      const el = document.getElementById(id), msg = fn(el.value);
      document.getElementById(eid).textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg && !first) first = el;
    });
    if (first) { first.focus(); return; }
    const payload = Object.fromEntries(new FormData(form));
    payload.page = location.pathname;
    payload.elapsed = Math.round((Date.now() - openedAt) / 1000);
    if (!IS_PREVIEW) {
      submitBtn.disabled = true; submitBtn.textContent = "送信しています…";
      let errMsg = "";
      try {
        const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) errMsg = data.error || "送信できませんでした。";
      } catch (err) {
        errMsg = "通信エラーで送信できませんでした。電波の良い場所でもう一度お試しください。";
      }
      if (errMsg) {
        formErr.textContent = `${errMsg} お手数ですが、お電話（${SITE.tel}・17:00〜）でもご相談いただけます。`;
        track("group_inquiry_error", { message: errMsg });
        submitBtn.disabled = false; submitBtn.textContent = "相談内容を送信する";
        return;
      }
      submitBtn.disabled = false; submitBtn.textContent = "相談内容を送信する";
    }
    track("group_inquiry_submit", { people: Number(payload.people), purpose: payload.purpose || "" });
    form.hidden = true; done.hidden = false; done.focus();
  });
  $("#again").addEventListener("click", () => { form.reset(); done.hidden = true; form.hidden = false; });
}

/* ---------- 写真：data-photo="キー" の枠に実写真を入れる ---------- */
function fillPhotos() {
  document.querySelectorAll(".ph[data-photo]").forEach(box => {
    const p = SITE.photos[box.dataset.photo];
    if (!p || box.querySelector("img")) return;
    const img = document.createElement("img");
    img.src = p.src; img.alt = p.alt; img.width = p.w; img.height = p.h; img.decoding = "async";
    if (box.hasAttribute("data-eager")) img.setAttribute("fetchpriority", "high"); else img.loading = "lazy";
    box.prepend(img);
    box.classList.add("has-img");
    box.removeAttribute("role"); box.removeAttribute("aria-label");
  });
}
document.addEventListener("DOMContentLoaded", fillPhotos);

/* ---------- 宴会の料金（コース・貸切料金表から計算） ---------- */
const BANQUET_IDS = ["standard", "recommended", "gradeup", "premium"];
function banquetPrices() {
  const list = SITE.courses.filter(c => BANQUET_IDS.includes(c.id));
  const dec = list.filter(c => c.dec);
  const minBy = (arr, f) => arr.reduce((m, c) => (f(c) < f(m) ? c : m));
  const decMin = minBy(dec, c => c.dec.price);
  const normalMin = minBy(list, c => c.price);
  const normalAnyDay = minBy(list.filter(c => !c.note), c => c.price);
  const decDrink = Math.min(...dec.map(c => parseInt(c.dec.drink, 10)));
  const hireRows = p => SITE.hire.periods.filter(p).flatMap(x => x.rows.map(r => r.noRoom));
  return {
    dec: decMin.dec.price, decDrink: decDrink + "分",
    normal: normalMin.price, normalNote: normalMin.note || "", normalAnyDay: normalAnyDay.price,
    hireDec: Math.min(...hireRows(x => x.id === "dec" || x.id === "xmas" || x.id === "yearend")),
    hireAll: Math.min(...hireRows(() => true))
  };
}
function renderBanquet(el, opts) {
  if (!el) return;
  opts = opts || {};
  const P = banquetPrices();
  const focusDec = (opts.focus || SITE.season.priceFocus) === "dec";
  const loc = opts.loc || "banquet";
  el.innerHTML = SITE.banquet.map(b => {
    const isHire = b.kind === "hire";
    const main = isHire
      ? (focusDec ? `<span class="pk">12月の貸切</span><strong>¥${yen(P.hireDec)}〜</strong>` : `<span class="pk">貸切</span><strong>¥${yen(P.hireAll)}〜</strong>`)
      : (focusDec ? `<span class="pk">12月の宴会コース</span><strong>¥${yen(P.dec)}〜</strong>` : `<span class="pk">宴会コース</span><strong>¥${yen(P.normal)}〜</strong>`);
    const sub = isHire
      ? `最低保証・税込／コース料理・飲み放題込み`
      : (focusDec ? `1名・税込／飲み放題${P.decDrink}〜` : `1名・税込／飲み放題付き${P.normalNote ? `（¥${yen(P.normal)}は${P.normalNote}）` : ""}`);
    const other = isHire
      ? (focusDec ? `1〜11月は ¥${yen(P.hireAll)}〜（月・曜日で変動）` : "")
      : (focusDec ? `1〜11月は ¥${yen(P.normal)}〜（${P.normalNote || "通常料金"}）` : "");
    const cta = isHire
      ? `<a class="btn solid" href="${opts.hireHref || "party.html#hire"}" data-track="hire_price_click" data-loc="${loc}-${b.id}">日付で貸切料金を見る</a>
         <a class="textlink" href="${opts.formHref || "#reserve"}" data-track="group_inquiry_click" data-loc="${loc}-${b.id}">貸切を相談する</a>`
      : `<button class="btn solid" type="button" data-open-book data-loc="${loc}-${b.id}">空席を確認・予約</button>
         <a class="textlink" href="${opts.formHref || "#reserve"}" data-track="group_inquiry_click" data-loc="${loc}-${b.id}">${b.id === "b20" ? "人数・席を相談する" : "電話・フォームで相談"}</a>`;
    return `<article class="bq" id="${b.id}">
      <div class="ph" data-photo="${esc(b.photoKey)}"></div>
      <div class="bq-body">
        <p class="bq-size"><b>${esc(b.range)}</b><small>名</small><span class="chip">${esc(b.chip)}</span></p>
        <h3>${esc(b.title)}</h3>
        <p class="bq-price">${main}</p>
        <p class="bq-sub">${sub}</p>
        ${other ? `<p class="bq-other">${other}</p>` : ""}
        <ul>${b.seats.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="bq-cta">${cta}</div>
      </div>
    </article>`;
  }).join("");
  if (typeof fillPhotos === "function") fillPhotos();
}

/* ---------- コース一覧（通常／12月の切り替え） ---------- */
function coursesFor(period) {
  const dec = period === "dec";
  return SITE.courses.filter(c => dec ? (c.dec || c.decOnly) : !c.decOnly).map(c => {
    if (!dec || c.decOnly) return { ...c, period };
    return { ...c, period, price: c.dec.price, drink: c.dec.drink, was: null, normalPrice: c.price, normalDrink: c.drink };
  });
}
function periodNote(period) {
  const off = SITE.courses.filter(c => !c.dec && !c.decOnly).map(c => c.ja);
  return period === "dec"
    ? `12月（忘年会シーズン）の料金です。${off.length ? off.join("・") + "は12月の販売はありません。" : ""}`
    : "1月〜11月の料金です。12月は料金と飲み放題時間が変わります。";
}
function courseCard(c, opts) {
  opts = opts || {};
  const H = opts.h || "h3";
  const dec = c.period === "dec";
  const drink = c.drink === "なし" ? "飲み放題なし（ドリンクは別注文）" : `飲み放題 ${esc(c.drink)}`;
  const otherLine = dec && c.normalPrice
    ? (c.normalPrice !== c.price || c.normalDrink !== c.drink ? `1〜11月は ¥${yen(c.normalPrice)}・飲み放題${esc(c.normalDrink)}` : "1〜11月も同じ内容")
    : (!dec && decText(c) ? decText(c) : "");
  return `<article class="course${c.featured ? " featured" : ""}" id="${esc(c.id)}">
    ${c.badge ? `<span class="badge">${esc(c.badge)}</span>` : ""}
    <${H} class="name">${esc(c.en)}<small>${esc(c.ja)}${c.note ? `（${esc(c.note)}）` : ""}</small></${H}>
    <p class="price">${dec ? `<span class="pk-dec">12月料金</span>` : ""}<strong>¥${yen(c.price)}</strong>${c.was ? `<s>¥${yen(c.was)}</s>` : ""}<span>税込／1名</span></p>
    <dl>
      <div><dt>ITEMS</dt><dd>全${c.items}品</dd></div>
      <div><dt>DRINK</dt><dd>${drink}</dd></div>
      <div><dt>MENU</dt><dd>${esc(c.menu)}</dd></div>
      <div><dt>GUESTS</dt><dd>${esc(c.people)}</dd></div>
      ${opts.showTime ? `<div><dt>START</dt><dd>${esc(c.time)} のご入店</dd></div>` : ""}
      ${otherLine ? `<div><dt>${dec ? "OTHER" : "DEC"}</dt><dd>${otherLine}</dd></div>` : ""}
    </dl>
    <button class="btn${c.featured ? " solid" : ""}" type="button" data-open-book data-loc="${opts.loc || "course"}-${esc(c.id)}">このコースで予約</button>
  </article>`;
}
function bindPeriodToggle(name, render) {
  const radios = document.querySelectorAll(`input[name=${name}]`);
  const initial = location.hash === "#december" ? "dec" : (SITE.season.priceFocus || "normal");
  radios.forEach(r => { r.checked = r.value === initial; r.addEventListener("change", e => { render(e.target.value); track("course_period_view", { period: e.target.value }); }); });
  render(initial);
}

/* ---------- 本番では JS で作ったリンクもきれいな URL に（/party.html → /party） ---------- */
function cleanLinks(root) {
  if (PREVIEW) return;
  (root || document).querySelectorAll("a[href]").forEach(a => {
    const m = a.getAttribute("href").match(/^([a-z]+)\.html(#.*)?$/);
    if (m) a.setAttribute("href", (m[1] === "index" ? "/" : "/" + m[1]) + (m[2] || ""));
  });
}
document.addEventListener("DOMContentLoaded", () => cleanLinks());
