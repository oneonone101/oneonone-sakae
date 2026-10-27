/* カテゴリ（#cat=anniversary のようにURLで指定可）と時期（12月／1〜11月）で絞り込む */
const CATS = [{ id: "all", label: "すべて" }, ...SITE.courseCats];
let cat = (location.hash.match(/cat=([a-z]+)/) || [])[1] || "all";
if (!CATS.some(c => c.id === cat)) cat = "all";
let period = "normal";
document.getElementById("cat-chips").innerHTML = CATS.map(c => `<button type="button" class="chip-btn" data-cat="${c.id}">${esc(c.label)}</button>`).join("");
document.getElementById("photo-note").textContent = SITE.coursePhotoNote;

function view(p) {
  if (p) period = p;
  const all = coursesFor(period);
  const list = all.filter(c => cat === "all" || c.cat === cat);
  document.querySelectorAll(".chip-btn").forEach(b => {
    const n = b.dataset.cat === "all" ? all.length : all.filter(c => c.cat === b.dataset.cat).length;
    b.setAttribute("aria-pressed", String(b.dataset.cat === cat));
    b.innerHTML = `${esc(CATS.find(c => c.id === b.dataset.cat).label)}<small>${n}</small>`;
  });
  document.getElementById("period-note").textContent = `${periodNote(period)}　${list.length}件のコース`;
  document.getElementById("courses").innerHTML = list.map(c => courseListCard(c, { h: "h2", loc: "course" })).join("");
  const empty = document.getElementById("empty");
  empty.hidden = list.length > 0;
  if (!list.length) {
    const other = period === "dec" ? "normal" : "dec";
    empty.innerHTML = cat === "seasonal" && period === "normal"
      ? `<p>季節限定のコースは、12月のX'masコースです。</p><button class="btn" type="button" data-switch="dec">12月のコースを表示</button>`
      : `<p>この時期に該当するコースはありません。</p><button class="btn" type="button" data-switch="${other}">${other === "dec" ? "12月" : "1〜11月"}のコースを表示</button>`;
  }
  document.getElementById("cmp").innerHTML = `
    <caption class="note" style="text-align:left;padding:10px 14px">${period === "dec" ? "12月の料金" : "1〜11月の料金"}（税込・1名）</caption>
    <thead><tr><th scope="col">コース</th><th scope="col">価格</th><th scope="col">品数</th><th scope="col">飲み放題</th><th scope="col">ネット予約の人数</th><th scope="col">ご入店</th></tr></thead>
    <tbody>${all.map(c => `<tr><th scope="row"><a href="${courseHref(c)}">${esc(c.ja)}</a>${c.note ? `<small>${esc(c.note)}</small>` : ""}</th><td>¥${yen(c.price)}</td><td>${c.items}品</td><td>${esc(c.drink)}</td><td>${esc(c.people)}</td><td>${esc(c.time)}</td></tr>`).join("")}</tbody>`;
  fillPhotos(); cleanLinks();
}
document.getElementById("cat-chips").addEventListener("click", e => {
  const b = e.target.closest(".chip-btn"); if (!b) return;
  cat = b.dataset.cat; view();
  history.replaceState(null, "", cat === "all" ? location.pathname : "#cat=" + cat);
  track("course_filter", { cat });
});
document.getElementById("empty").addEventListener("click", e => {
  const b = e.target.closest("[data-switch]"); if (!b) return;
  const r = document.querySelector(`input[name=period][value=${b.dataset.switch}]`); r.checked = true; view(b.dataset.switch);
});
/* 季節限定（X'mas）を指定されたら12月表示から始める */
if (cat === "seasonal" && !location.hash.includes("december")) history.replaceState(null, "", "#december&cat=seasonal");
bindPeriodToggle("period", view);
