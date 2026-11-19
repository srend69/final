/* ===== Roteamento e eventos ===== */
const go = v => { location.hash = v; };
function route(){
  const v = location.hash.slice(1) || "home";
  (views[v] || views.home)(); updateNav(); window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if(!b) return;
  const id = b.dataset.id, a = b.dataset.act;
  if(a === "add") addToCart(id);
  else if(a === "inc") changeQty(id, 1);
  else if(a === "dec") changeQty(id, -1);
  else if(a === "clear"){ saveCart([]); route(); }
  else if(a === "checkout") go("checkout");
  else if(a === "logout"){ try{ localStorage.removeItem("session"); }catch(x){} updateNav(); toast("Você saiu da conta"); go("home"); }
});
window.addEventListener("hashchange", route);
route();
