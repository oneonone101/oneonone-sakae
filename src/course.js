function view(period) {
  const dec = period === "dec";
  const list = SITE.courses.filter(c => dec ? (c.dec || c.decOnly) : !c.decOnly).map(c => {
    if (!dec || c.decOnly) return { ...c };
    return { ...c, price: c.dec.price, drink: c.dec.drink, was: null };
  });
  document.getElementById("period-note").textContent = dec
    ? "12月は一部のコースの価格と飲み放題時間が変わります。STANDARDコースは12月の販売はありません。"
    : "1月〜11月の内容です。";
  document.getElementById("courses").innerHTML = list.map((c, i) => `
    <article class="course${c.featured ? " featured" : ""}"${c.verified === false ? " data-unverified" : ""} id="${esc(c.id)}">
      ${c.badge ? `<span class="badge">${esc(c.badge)}</span>` : ""}
      <h2 class="name">${esc(c.en)}<small>${esc(c.ja)}${c.note ? `（${esc(c.note)}）` : ""}${chk(c)}</small></h2>
      <p class="price"><strong>¥${yen(c.price)}</strong>${c.was ? `<s>¥${yen(c.was)}</s>` : ""}<span>税込／1名</span></p>
      <dl>
        <div><dt>ITEMS</dt><dd>全${c.items}品</dd></div>
        <div><dt>DRINK</dt><dd>${c.drink === "なし" ? "飲み放題なし（ドリンクは別注文）" : `飲み放題 ${esc(c.drink)}`}</dd></div>
        <div><dt>MENU</dt><dd>${esc(c.menu)}</dd></div>
        <div><dt>GUESTS</dt><dd>${esc(c.people)}</dd></div>
        <div><dt>START</dt><dd>${esc(c.time)} のご入店</dd></div>
      </dl>
      <button class="btn${c.featured ? " solid" : ""}" type="button" data-open-book data-loc="course-${esc(c.id)}">このコースで予約</button>
    </article>`).join("");
  document.getElementById("cmp").innerHTML = `
    <thead><tr><th scope="col">コース</th><th scope="col">価格</th><th scope="col">品数</th><th scope="col">飲み放題</th><th scope="col">人数</th><th scope="col">ご入店</th></tr></thead>
    <tbody>${list.map(c => `<tr><th scope="row"><a href="#${esc(c.id)}">${esc(c.ja)}</a>${c.note ? `<small>${esc(c.note)}</small>` : ""}</th><td>¥${yen(c.price)}</td><td>${c.items}品</td><td>${esc(c.drink)}</td><td>${esc(c.people)}</td><td>${esc(c.time)}</td></tr>`).join("")}</tbody>`;
  track("course_period_view", { period });
}
document.querySelectorAll("input[name=period]").forEach(r => r.addEventListener("change", e => view(e.target.value)));
const startDec = location.hash === "#december";
if (startDec) document.getElementById("p-dec").checked = true;
view(startDec ? "dec" : "normal");
