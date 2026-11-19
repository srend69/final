/* ===== Estado ===== */
let products = [];
const session = () => store.get("session", null);
const cart = () => store.get("cart", memCart);
const saveCart = c => { memCart = c; store.set("cart", c); updateNav(); };
const count = () => cart().reduce((s,i) => s + i.qty, 0);
const total = () => cart().reduce((s,i) => s + i.qty * i.price, 0);

function toast(m){ const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2000); }

function addToCart(id){
  const p = products.find(x => x.id == id); if(!p) return;
  const c = cart(); const f = c.find(x => x.id == id);
  f ? f.qty++ : c.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:1});
  saveCart(c); toast("Adicionado ao carrinho");
}
function changeQty(id, d){
  let c = cart(); const f = c.find(x => x.id == id); if(!f) return;
  f.qty += d; if(f.qty <= 0) c = c.filter(x => x.id != id);
  saveCart(c); route();
}

function updateNav(){
  const s = session();
  $("#nav").innerHTML = `<a href="#home">Produtos</a><a href="#cart">Carrinho<span class="badge">${count()}</span></a>` +
    (s ? `<span class="muted">Olá, ${esc(s.user.name.split(" ")[0])}</span><button data-act="logout">Sair</button>`
       : `<a href="#login">Entrar</a><a href="#register">Cadastrar</a>`);
}
