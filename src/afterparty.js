const ap = SITE.courses.find(c => c.id === "afterparty");
const DECF = SITE.season.priceFocus === "dec";
const apNow = coursesFor(DECF && ap.dec ? "dec" : "normal").find(c => c.id === "afterparty");
document.querySelectorAll("[data-bind=apPrice]").forEach(n => n.innerHTML = "¥" + yen(apNow.price));
document.getElementById("ap-course").innerHTML = courseListCard(apNow, { loc: "after-course" });
document.getElementById("ap-hours").innerHTML = SITE.hours.map(h => `<tr><th scope="row">${esc(h.day)}</th><td>${esc(h.time)}<small>${esc(h.note)}</small></td></tr>`).join("");
document.getElementById("ap-charges").innerHTML = SITE.charges.filter(c => c.verified !== false).map(c => `<div><b>${esc(c.name)}</b><span class="yen">${esc(c.yen)}</span><p>${esc(c.note)}</p></div>`).join("");
