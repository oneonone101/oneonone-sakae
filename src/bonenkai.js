const P = banquetPrices();
const fmt = n => "¥" + n.toLocaleString("ja-JP");
document.querySelectorAll("[data-bind=decFrom]").forEach(n => n.textContent = fmt(P.dec) + "〜");

/* 12月の注意点 */
const offDec = SITE.courses.filter(c => !c.dec && !c.decOnly).map(c => c.ja);
document.getElementById("dec-points").innerHTML = [
  `宴会コースは飲み放題付き <b>${fmt(P.dec)}〜</b>（1名・税込）。飲み放題は${P.decDrink}〜です。`,
  offDec.length ? `${offDec.join("・")}は12月の販売はありません。` : "",
  "12月1日〜22日の貸切は、可能であれば1か月前までに全額のお支払いをお願いしています。",
  "12月31日〜1月4日は休業します。"
].filter(Boolean).map(x => `<li>${x}</li>`).join("");

/* 人数別 */
renderBanquet(document.getElementById("banquet"), { loc: "bonenkai", focus: "dec", formHref: "#reserve" });

/* 12月のコース表 */
const decList = coursesFor("dec").filter(c => !c.decOnly && c.id !== "afterparty");
document.getElementById("dec-table").innerHTML = `
  <caption class="note" style="text-align:left;padding:10px 14px">12月の料金（税込・1名）</caption>
  <thead><tr><th scope="col">コース</th><th scope="col">12月の料金</th><th scope="col">飲み放題</th><th scope="col">品数</th><th scope="col">主な料理</th></tr></thead>
  <tbody>${decList.map(c => `<tr><th scope="row">${esc(c.ja)}${c.featured ? " <small>人気</small>" : ""}</th>
    <td class="num">${fmt(c.price)}<small>1〜11月は${fmt(c.normalPrice)}</small></td>
    <td>${esc(c.drink)}${c.normalDrink !== c.drink ? `<small>1〜11月は${esc(c.normalDrink)}</small>` : ""}</td>
    <td>${c.items}品</td><td>${esc(c.menu)}</td></tr>`).join("")}
  ${SITE.courses.filter(c => !c.dec && !c.decOnly).map(c => `<tr class="off"><th scope="row">${esc(c.ja)}</th><td>12月は販売なし</td><td>—</td><td>${c.items}品</td><td>1〜11月の${esc(c.note || "")}のみ ${fmt(c.price)}</td></tr>`).join("")}
  </tbody>`;

/* 12月の貸切料金 */
document.getElementById("dec-hire-tables").innerHTML = SITE.hire.periods.filter(p => ["dec", "xmas", "yearend"].includes(p.id)).map(p => `
  <div class="ptable">
    <h3>${esc(p.label)}${p.note ? `<small>${esc(p.note)}</small>` : ""}</h3>
    <div class="scroll"><table>
      <thead><tr><th scope="col">曜日</th><th scope="col">フロア貸切</th><th scope="col">完全貸切</th><th scope="col">上限</th></tr></thead>
      <tbody>${p.rows.map(r => `<tr><th scope="row">${esc(r.days)}</th><td>${fmt(r.noRoom)}${r.from ? "〜" : ""}</td><td>${fmt(r.room)}${r.from ? "〜" : ""}</td><td>${r.cap}名</td></tr>`).join("")}</tbody>
    </table></div>
  </div>`).join("");

/* 二次会 */
const ap = SITE.courses.find(c => c.id === "afterparty");
document.getElementById("after-text").textContent = `22時からの二次会コースは全${ap.items}品・飲み放題${ap.dec ? ap.dec.drink : ap.drink}で${fmt(ap.dec ? ap.dec.price : ap.price)}（1名・税込）。月〜土・祝前日は翌5時まで営業しています。24時以降のご入店はテーブルチャージが1,100円になります（コース利用時はかかりません）。`;

/* 新年会 */
const jan = SITE.hire.periods.find(p => p.id === "jan");
const janMin = Math.min(...jan.rows.map(r => r.noRoom));
document.getElementById("ny-text").textContent = `1月の新年会は通常料金です。宴会コースは飲み放題付き${fmt(P.normal)}〜（${P.normalNote || "通常料金"}）、金・土も${fmt(P.normalAnyDay)}〜。1月・2月の貸切は${fmt(janMin)}〜でご案内しています。`;
