document.getElementById("signature").innerHTML = SITE.dishes.map((d, i) => `
  <article class="dish">
    <div class="ph" data-photo="${esc(d.photoKey || "")}" role="img" aria-label="${esc(d.name)}" style="--lx:${i % 2 ? 32 : 68}%;--ly:40%;--rx:50%;--ry:85%"></div>
    <h3>${esc(d.name)}${d.price ? `<span class="note">　${priceText(d)}</span>` : flag("価格 要確認")}</h3>
    ${d.desc ? `<p>${esc(d.desc)}</p>` : ""}
  </article>`).join("");
const slug = s => s.toLowerCase().replace(/[^a-z]+/g, "-");
document.getElementById("catnav").innerHTML = SITE.menu.map(c => `<a href="#${slug(c.cat)}">${esc(c.ja)}</a>`).join("") + `<a href="#drink-title">ドリンク</a>`;
document.getElementById("menu").innerHTML = SITE.menu.map(c => `
  <div class="menu-cat" id="${slug(c.cat)}">
    <h3><span class="en">${esc(c.cat)}</span>${esc(c.ja)}</h3>
    <ul>${c.items.map(d => `<li><span>${esc(d.name)}${d.note ? `<em class="mnote">${esc(d.note)}</em>` : ""}</span><i></i><b>${d.price ? priceText(d) : (PREVIEW ? flag("要確認") : "—")}</b></li>`).join("")}</ul>
  </div>`).join("");
document.getElementById("drinks").innerHTML = SITE.drinks.map(d => `<div><span class="k">${esc(d.price)}</span><h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p></div>`).join("");
