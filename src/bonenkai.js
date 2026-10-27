const P = banquetPrices();
window.BOOK_MONTH = 12; // 予約シートに「12月を選んでください」を出す
const fmt = n => "¥" + n.toLocaleString("ja-JP");
document.querySelectorAll("[data-bind=decFrom]").forEach(n => n.innerHTML = fmt(P.dec) + "<small>〜／名</small>");

/* 12月の注意点 */
const offDec = SITE.courses.filter(c => !c.dec && !c.decOnly).map(c => c.ja);
document.getElementById("dec-points").innerHTML = [
  `宴会コースは飲み放題付き <b>${fmt(P.dec)}〜</b>（1名・税込）。飲み放題は${P.decDrink}〜です。`,
  offDec.length ? `${offDec.join("・")}は12月の販売はありません。` : "",
  "12月31日〜1月4日は休業します。"
].filter(Boolean).map(x => `<li>${x}</li>`).join("");

/* 人数別 */
renderBanquet(document.getElementById("banquet"), { loc: "bonenkai", focus: "dec", formHref: "#reserve", showNormal: false });

/* 12月のコース */
const decList = coursesFor("dec").filter(c => !c.decOnly && !["afterparty", "anniversary"].includes(c.id));
document.getElementById("dec-cards").innerHTML = decList.map(c => courseListCard(c, { loc: "bonenkai-course" })).join("");
const offList = SITE.courses.filter(c => !c.dec && !c.decOnly);
document.getElementById("dec-off").textContent = offList.length ? `${offList.map(c => c.ja).join("・")}は12月の販売はありません（1〜11月の${offList.map(c => c.note).filter(Boolean).join("・")}のみ）。` : "";

/* 12月の貸切料金 */
document.getElementById("dec-hire-tables").innerHTML = SITE.hire.periods.filter(p => ["dec", "xmas", "yearend"].includes(p.id)).map(p => `
  <div class="ptable">
    <h3>${esc(p.label)}</h3>
    <div class="scroll"><table>
      <thead><tr><th scope="col">曜日</th><th scope="col">フロア貸切</th><th scope="col">完全貸切</th><th scope="col">上限</th></tr></thead>
      <tbody>${p.rows.map(r => `<tr><th scope="row">${esc(r.days)}</th><td>${fmt(r.noRoom)}${r.from ? "〜" : ""}</td><td>${fmt(r.room)}${r.from ? "〜" : ""}</td><td>${r.cap}名</td></tr>`).join("")}</tbody>
    </table></div>
    ${p.note ? `<p class="ptable-note">${esc(p.note)}</p>` : ""}
  </div>`).join("");

/* 二次会 */
const ap = SITE.courses.find(c => c.id === "afterparty");
document.getElementById("after-text").textContent = `22時からの二次会コースは全${ap.items}品・飲み放題${ap.dec ? ap.dec.drink : ap.drink}で${fmt(ap.dec ? ap.dec.price : ap.price)}（1名・税込）。月〜土・祝前日は翌5時まで営業しています。24時以降のご入店はテーブルチャージが1,100円になります（コース利用時はかかりません）。`;

/* 新年会 */
const jan = SITE.hire.periods.find(p => p.id === "jan");
const janMin = Math.min(...jan.rows.map(r => r.noRoom));
document.getElementById("ny-text").textContent = `1月の新年会は通常料金です。宴会コースは飲み放題付き${fmt(P.normal)}〜（${P.normalNote || "通常料金"}）、金・土も${fmt(P.normalAnyDay)}〜。1月・2月の貸切は${fmt(janMin)}〜でご案内しています。`;
