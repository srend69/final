/* ===== Roteamento e eventos ===== */
const go = v => { location.hash = v; };
let routeId = 0; // evita que telas assíncronas antigas sobrescrevam a tela atual
function route(keepScroll){
  const v = location.hash.slice(1) || "home";
  $("#modal").innerHTML = "";
  (Object.hasOwn(views, v) ? views[v] : views.home)(++routeId); updateNav();
  if(!keepScroll) window.scrollTo(0, 0);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if(!b) return;
  const a = b.dataset.act, id = b.dataset.id;
  if(a === "close"){ if(e.target === b) $("#modal").innerHTML = ""; return; }
  if(a === "add"){ addToCart(id); if(b.dataset.close) $("#modal").innerHTML = ""; }
  else if(a === "open") openModal(id);
  else if(a === "fav"){
    toggleFav(id);
    if(location.hash === "#favorites") route();
    else document.querySelectorAll(`[data-act="fav"][data-id="${id}"]`).forEach(x => x.classList.toggle("on", isFav(id)));
  }
  else if(a === "chip"){ ui.cat = b.dataset.cat; document.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b)); drawList(); }
  else if(a === "shop") $("#shop").scrollIntoView({behavior:"smooth"});
  else if(a === "inc") changeQty(id, 1);
  else if(a === "dec") changeQty(id, -1);
  else if(a === "clear"){ saveCart([]); route(); }
  else if(a === "coupon"){
    const v = $("#cp").value.trim().toUpperCase();
    if(COUPONS[v]){ store.set("coupon", v); toast("Cupom " + v + " aplicado!"); }
    else{ store.remove("coupon"); toast(v ? "Cupom inválido" : "Cupom removido"); }
    route();
  }
  else if(a === "checkout") go("checkout");
  else if(a === "theme") applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  else if(a === "logout"){ store.remove("session"); toast("Você saiu da conta"); const h = location.hash.slice(1); h && h !== "home" ? go("home") : route(); }
});

$("#q").addEventListener("input", e => {
  ui.q = e.target.value;
  if((location.hash.slice(1) || "home") === "home" && $("#list") && products.length) drawList(); else go("home");
});
document.addEventListener("change", e => { if(e.target.id === "sort"){ ui.sort = e.target.value; drawList(); } });
document.addEventListener("keydown", e => {
  if(e.key === "Escape") $("#modal").innerHTML = "";
  if(e.key === "Enter" && e.target.matches('[role="button"][data-act]')) e.target.click();
});
// imagem quebrada -> placeholder (uma única tentativa para não entrar em loop)
document.addEventListener("error", e => {
  const t = e.target; if(t.tagName === "IMG" && !t.dataset.fb){ t.dataset.fb = 1; t.src = PLACEHOLDER; }
}, true);
window.addEventListener("hashchange", () => route());

applyTheme(store.get("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
route();
