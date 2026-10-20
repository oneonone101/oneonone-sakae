function view(period) {
  const list = coursesFor(period);
  document.getElementById("period-note").textContent = periodNote(period);
  document.getElementById("courses").innerHTML = list.map(c => courseCard(c, { h: "h2", showTime: true, loc: "course" })).join("");
  document.getElementById("cmp").innerHTML = `
    <caption class="note" style="text-align:left;padding:10px 14px">${period === "dec" ? "12月の料金" : "1〜11月の料金"}（税込・1名）</caption>
    <thead><tr><th scope="col">コース</th><th scope="col">価格</th><th scope="col">品数</th><th scope="col">飲み放題</th><th scope="col">ネット予約の人数</th><th scope="col">ご入店</th></tr></thead>
    <tbody>${list.map(c => `<tr><th scope="row"><a href="#${esc(c.id)}">${esc(c.ja)}</a>${c.note ? `<small>${esc(c.note)}</small>` : ""}</th><td>¥${yen(c.price)}</td><td>${c.items}品</td><td>${esc(c.drink)}</td><td>${esc(c.people)}</td><td>${esc(c.time)}</td></tr>`).join("")}</tbody>`;
}
bindPeriodToggle("period", view);
