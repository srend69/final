/* ===== Estado ===== */
let products = [];
const ui = {q:"", cat:"Todos", sort:"rel"};
const FREE = 300, COUPONS = {AURORA10:.1, BEMVINDO:.15};

const session = () => store.get("session", null);
const cart = () => store.get("cart", memCart);
const saveCart = c => { memCart = c; store.set("cart", c); updateNav(); };
const count = () => cart().reduce((s,i) => s + i.qty, 0);

function totals(){
  const sub = money(cart().reduce((s,i) => s + i.qty * i.price, 0)), cp = store.get("coupon", "");
  const rate = Object.hasOwn(COUPONS, cp) ? COUPONS[cp] : 0;
  const disc = money(sub * rate), ship = sub === 0 || sub - disc >= FREE ? 0 : 19.9;
  return {sub, cp: rate ? cp : "", disc, ship, total: money(sub - disc + ship)};
}
const total = () => totals().total;

const favs = () => store.get("favs", []);
const isFav = id => favs().includes(+id);
function toggleFav(id){
  id = +id; const f = favs();
  store.set("favs", f.includes(id) ? f.filter(x => x !== id) : [...f, id]); updateNav();
}

function toast(m){ const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2200); }

function addToCart(id){
  const p = products.find(x => x.id == id); if(!p) return;
  const c = cart(), f = c.find(x => x.id == id);
  f ? f.qty++ : c.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:1});
  saveCart(c); toast("✓ " + p.name + " no carrinho");
}
function changeQty(id, d){
  let c = cart(); const f = c.find(x => x.id == id); if(!f) return;
  f.qty += d; if(f.qty <= 0) c = c.filter(x => x.id != id);
  saveCart(c); route(true);
}

function applyTheme(t){ document.documentElement.dataset.theme = t; store.set("theme", t); updateNav(); }

function updateNav(){
  const s = session(), h = location.hash.slice(1) || "home", fc = favs().length, cc = count();
  const a = v => h === v ? ' class="on"' : "";
  $("#nav").innerHTML = `<a${a("home")} href="#home">Início</a>
    <a${a("favorites")} href="#favorites">♥ Favoritos${fc ? `<span class="badge">${fc}</span>` : ""}</a>
    <a${a("orders")} href="#orders">Pedidos</a>
    <a${a("cart")} href="#cart">🛒 Carrinho${cc ? `<span class="badge">${cc}</span>` : ""}</a>` +
    (s ? `<span class="user">Olá, ${esc((s.user.name || s.user.email || "").split(" ")[0])}</span><button data-act="logout">Sair</button>`
       : `<a href="#login">Entrar</a><a class="cta" href="#register">Cadastrar</a>`) +
    `<button class="ib" data-act="theme" aria-label="Alternar tema">${document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙"}</button>`;
}
