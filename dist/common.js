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
    ["f-tel", "e-tel", v => /^[0-9\-+() ]{10,}$/.test(v.trim()) ? "" : "電話番号を数字で入力してください（例：090-1234-5678）"],
    ["f-mail", "e-mail", v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? "" : "メールアドレスの形式を確認してください"],
    ["f-date", "e-date", v => v ? "" : "希望日を選択してください"],
    ["f-people", "e-people", v => Number(v) >= 1 ? "" : "予定人数を入力してください"]
  ];
  const IS_PREVIEW = PREVIEW;
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
    if (!IS_PREVIEW) {
      submitBtn.disabled = true; submitBtn.textContent = "送信しています…";
      try {
        const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "送信できませんでした。");
      } catch (err) {
        formErr.textContent = `${err.message} お手数ですが、お電話（${SITE.tel}）でもご相談いただけます。`;
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
