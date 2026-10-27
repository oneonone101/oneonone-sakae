/* 以前の「宴会・貸切」ページの貸切部分へのリンク（party#hire など）は、新しい貸切ページへ移動 */
(() => {
  const moved = { "#hire": "#price", "#party-hire": "", "#equipment": "#equipment" };
  if (location.hash in moved) location.replace((PREVIEW ? "hire.html" : "/hire") + moved[location.hash]);
})();

const fmt = n => "¥" + n.toLocaleString("ja-JP");
const P = banquetPrices();
const dec = SITE.season.priceFocus === "dec";


/* 料金・飲み放題の表示（コースデータから計算） */
const banquetCourses = period => coursesFor(period).filter(c => BANQUET_IDS.includes(c.id));
const drinkRange = period => { const m = banquetCourses(period).map(c => parseInt(c.drink, 10)); return `${Math.min(...m)}〜${Math.max(...m)}分`; };
const range = dec
  ? `12月：飲み放題付きコース ¥${yen(P.dec)}〜（1名・税込）<small>1〜11月は ¥${yen(P.normal)}〜（${P.normalNote || "通常料金"}）</small>`
  : `飲み放題付きコース ¥${yen(P.normal)}〜（1名・税込）<small>12月は ¥${yen(P.dec)}〜</small>`;
const drinks = dec ? `コースにより${drinkRange("dec")}（12月）<small>1〜11月は${drinkRange("normal")}</small>` : `コースにより${drinkRange("normal")}<small>12月は${drinkRange("dec")}</small>`;
document.querySelectorAll("[data-bind=courseRange]").forEach(n => n.innerHTML = range);
document.querySelectorAll("[data-bind=drinkRange]").forEach(n => n.innerHTML = drinks);
document.querySelectorAll("[data-bind=partyFrom]").forEach(n => n.innerHTML = "¥" + yen(dec ? P.dec : P.normal) + "<small>〜／名</small>");
document.querySelectorAll("[data-bind=partyFromLabel]").forEach(n => n.innerHTML = dec ? "12月の飲み放題付き<br>宴会コース" : "飲み放題付き<br>宴会コース");
document.querySelectorAll("[data-bind=courseFrom]").forEach(n => n.textContent = `飲み放題付きコース ¥${yen(dec ? P.dec : P.normal)}〜／名${dec ? "（12月）" : ""}`);
document.querySelectorAll("[data-bind=hireFromShort]").forEach(n => n.textContent = `会場全体の最低保証 ¥${yen(dec ? P.hireDec : P.hireAll)}〜${dec ? "（12月）" : ""}`);
document.querySelectorAll("[data-bind=hireFrom]").forEach(n => n.innerHTML = `会場全体で¥${yen(dec ? P.hireDec : P.hireAll)}〜${dec ? "（12月）" : ""}<small>月・曜日・人数上限により変わります</small>`);

/* 宴会コース */
(() => {
  const period = dec ? "dec" : "normal";
  document.getElementById("pc-lead").textContent = `飲み放題付き・税込の1名様料金です。${dec ? "12月の料金を表示しています。" : ""}`;
  document.getElementById("party-courses").innerHTML = banquetCourses(period).map(c => courseListCard(c, { loc: "party-course" })).join("");
  const off = period === "dec" ? SITE.courses.filter(c => BANQUET_IDS.includes(c.id) && !c.dec).map(c => `${c.ja}は12月の販売はありません。`).join("") : "";
  document.getElementById("pc-off").textContent = off;
})();
