/* ===== Roteamento e eventos ===== */
const go = v => { location.hash = v; };
function route(){
  const v = location.hash.slice(1) || "home";
  $("#modal").innerHTML = "";
  (views[v] || views.home)(); updateNav(); window.scrollTo(0, 0);
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
    else{ try{ localStorage.removeItem("coupon"); }catch(x){} toast(v ? "Cupom inválido" : "Cupom removido"); }
    route();
  }
  else if(a === "checkout") go("checkout");
  else if(a === "theme") applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  else if(a === "logout"){ try{ localStorage.removeItem("session"); }catch(x){} toast("Você saiu da conta"); go("home"); route(); }
});

$("#q").addEventListener("input", e => {
  ui.q = e.target.value;
  if((location.hash.slice(1) || "home") === "home" && $("#list") && products.length) drawList(); else go("home");
});
document.addEventListener("change", e => { if(e.target.id === "sort"){ ui.sort = e.target.value; drawList(); } });
document.addEventListener("keydown", e => { if(e.key === "Escape") $("#modal").innerHTML = ""; });
window.addEventListener("hashchange", route);

applyTheme(store.get("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
route();
