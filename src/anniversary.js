const ac = SITE.courses.find(c => c.id === "anniversary");
document.querySelector("[data-ac=price]").textContent = "¥" + yen(ac.price);
document.querySelector("[data-ac=items]").textContent = ac.items;
document.querySelector("[data-ac=drink]").textContent = ac.drink;
document.getElementById("ac-menu").innerHTML = ["テーブルアートの前菜", "自家製ローストビーフ", "和牛イチボのグリル", "季節のおすすめピザ", "メッセージ付きデザートプレート"]
  .map(x => `<li>${esc(x)}</li>`).join("");
document.querySelectorAll("[data-tel-text]").forEach(n => n.textContent = SITE.tel);

const options = [
  { en: "Dessert Plate", name: "メッセージ付きデザートプレート", price: SITE.plate.price, priceNote: "税込・アラカルトでも可", desc: "デザートとフルーツのプレートに、お名前やメッセージを添えてお席へ。", when: "当日のお電話でもOK", loc: "opt-plate", photo: "plate" },
  { en: "Table Art", name: "テーブルアート", price: SITE.tableArt.price, priceNote: "1卓・税込", desc: "テーブルいっぱいにデザートで描く演出。写真にも残る、いちばん華やかなサプライズ。", when: "前日までに予約", loc: "opt-art", photo: "tableart" },
  { en: "Anniversary Course", name: "ANNIVERSARYコース", price: ac.price, priceNote: "1名・税込・飲み放題付", desc: "テーブルアートの前菜からメッセージプレートまで、お祝いの演出がすべて入ったコース。", when: "ネット予約で選択", loc: "opt-course", featured: true, photo: "marble" }
];
document.getElementById("options").innerHTML = options.map(o => `
  <article class="option${o.featured ? " featured" : ""}">
    <div class="ph" data-photo="${esc(o.photo || "")}" role="img" aria-label="${esc(o.name)}（仮画像）"><span class="tag">PHOTO<b>${esc(o.name)}</b></span></div>
    <div class="body">
      <span class="k">${esc(o.en)}</span>
      <h3>${esc(o.name)}</h3>
      <p class="opt-price">${o.price ? "¥" + yen(o.price) : "—"}<small>${o.price ? esc(o.priceNote) : flag(o.priceNote)}</small></p>
      <p class="note">${esc(o.desc)}</p>
      <p class="when">${esc(o.when)}</p>
      <button class="btn${o.featured ? " solid" : ""}" type="button" data-open-book data-loc="${o.loc}">予約する</button>
    </div>
  </article>`).join("");
