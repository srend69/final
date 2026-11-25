/* ===== Telas ===== */
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const off = p => p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
const priceHtml = p => `<div class="pr"><b>${brl(p.price)}</b>${p.old ? `<s>${brl(p.old)}</s>` : ""}</div>`;
const link = (h, t) => `<a class="btn link" href="#${h}">${t}</a>`;

const card = p => `<article class="card">
  <button class="fav ${isFav(p.id) ? "on" : ""}" data-act="fav" data-id="${p.id}" aria-label="Favoritar">♥</button>
  ${p.old ? `<span class="tag">−${off(p)}%</span>` : ""}
  <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" data-act="open" data-id="${p.id}" role="button" tabindex="0">
  <div class="in"><span class="cat">${esc(p.category)}</span>
  <h3 data-act="open" data-id="${p.id}" role="button" tabindex="0">${esc(p.name)}</h3>
  <div class="stars">${stars(p.rating)} <small>${p.rating.toFixed(1)} (${p.reviews})</small></div>
  ${priceHtml(p)}<button class="btn" data-act="add" data-id="${p.id}">Adicionar</button></div></article>`;

function drawList(){
  const q = ui.q.toLowerCase();
  const l = products.filter(p => (ui.cat === "Todos" || p.category === ui.cat) && (p.name + p.category + p.desc).toLowerCase().includes(q));
  const s = {asc:(a,b) => a.price - b.price, desc:(a,b) => b.price - a.price, rate:(a,b) => b.rating - a.rating, off:(a,b) => off(b) - off(a)}[ui.sort];
  if(s) l.sort(s);
  $("#list").innerHTML = l.length ? l.map(card).join("") : `<p class="muted empty">Nenhum produto encontrado.</p>`;
  $("#count").textContent = l.length + (l.length === 1 ? " produto" : " produtos");
}

function openModal(id){
  const p = products.find(x => x.id == id); if(!p) return;
  $("#modal").innerHTML = `<div class="modal" data-act="close" role="dialog" aria-modal="true" aria-label="${esc(p.name)}"><div class="mbox">
    <button class="x" data-act="close" aria-label="Fechar">✕</button>
    <img src="${esc(p.image)}" alt="${esc(p.name)}">
    <div class="md"><span class="cat">${esc(p.category)}</span><h2>${esc(p.name)}</h2>
    <div class="stars">${stars(p.rating)} <small>${p.rating.toFixed(1)} · ${p.reviews} avaliações</small></div>
    <p class="muted">${esc(p.desc)}</p>${priceHtml(p)}
    <p class="muted small">ou 3× de ${brl(p.price / 3)} sem juros</p>
    <div class="acts"><button class="btn" data-act="add" data-id="${p.id}" data-close="1">Adicionar ao carrinho</button>
    <button class="btn ghost fav2 ${isFav(p.id) ? "on" : ""}" data-act="fav" data-id="${p.id}" aria-label="Favoritar">♥</button></div>
    <ul class="meta"><li>🚚 Entrega em 3 a 7 dias úteis</li><li>↩️ Troca grátis em até 30 dias</li><li>🔒 Pagamento seguro</li></ul></div></div></div>`;
}

const sumLines = t => `<div class="ln"><span>Subtotal</span><span>${brl(t.sub)}</span></div>
  ${t.disc ? `<div class="ln okc"><span>Cupom ${t.cp}</span><span>−${brl(t.disc)}</span></div>` : ""}
  <div class="ln"><span>Frete</span><span>${t.ship ? brl(t.ship) : "Grátis"}</span></div>
  <div class="total"><span>Total</span><span>${brl(t.total)}</span></div>`;

const empty = (i, t, p) => `<div class="box mid"><div class="big">${i}</div><h2>${t}</h2><p class="muted">${p}</p>${link("home", "Ver produtos")}</div>`;
async function load(){ if(!products.length) products = await api.products(); }

const views = {
  async home(id){
    $("#app").innerHTML = `<section class="hero"><div><span class="pill">Coleção primavera</span>
      <h1>Tudo o que você ama, com <em id="maxoff">ofertas especiais</em></h1>
      <p>Frete grátis acima de R$ 300 e cupom <b>AURORA10</b> na primeira compra.</p>
      <button class="btn" data-act="shop">Ver ofertas</button></div><div class="hv">🛍️</div></section>
      <div class="perks"><div>🚚<b>Frete grátis</b><span>acima de R$ 300</span></div><div>🔒<b>Compra segura</b><span>dados protegidos</span></div>
      <div>↩️<b>Troca fácil</b><span>até 30 dias</span></div><div>⚡<b>Pix instantâneo</b><span>aprovação na hora</span></div></div>
      <div id="shop" class="tb"><div class="chips" id="chips"></div>
      <div class="sortbox"><span id="count" class="muted"></span><select id="sort" aria-label="Ordenar">` +
      [["rel","Relevância"],["asc","Menor preço"],["desc","Maior preço"],["rate","Mais bem avaliados"],["off","Maiores descontos"]]
        .map(o => `<option value="${o[0]}"${ui.sort === o[0] ? " selected" : ""}>${o[1]}</option>`).join("") +
      `</select></div></div><div id="list" class="grid">${'<div class="card sk"></div>'.repeat(8)}</div>`;
    try{ await load(); }catch(e){ if(id !== routeId) return; $("#list").innerHTML = `<p class="err">Não foi possível carregar os produtos.</p>`; return; }
    if(id !== routeId) return;
    $("#chips").innerHTML = ["Todos", ...new Set(products.map(p => p.category))]
      .map(c => `<button class="chip${ui.cat === c ? " on" : ""}" data-act="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
    drawList();
    const m = Math.max(0, ...products.map(off)); if(m) $("#maxoff").textContent = "até " + m + "% off";
  },
  async favorites(id){
    $("#app").innerHTML = `<h1>Meus favoritos</h1><div id="list" class="grid"></div>`;
    try{ await load(); }catch(e){ if(id === routeId) $("#app").innerHTML = `<h1>Meus favoritos</h1><p class="err">Não foi possível carregar os produtos.</p>`; return; }
    if(id !== routeId) return;
    const l = products.filter(p => isFav(p.id));
    $("#app").innerHTML = l.length ? `<h1>Meus favoritos</h1><div class="grid">${l.map(card).join("")}</div>`
      : empty("♥", "Nenhum favorito ainda", "Toque no coração dos produtos para salvar aqui.");
  },
  login(){ authView("Entrar", false); },
  register(){ authView("Criar conta", true); },
  cart(){
    const c = cart(); if(!c.length){ $("#app").innerHTML = empty("🛒", "Seu carrinho está vazio", "Adicione produtos para começar."); return; }
    const t = totals(), rest = FREE - (t.sub - t.disc), pct = Math.min(100, (t.sub - t.disc) / FREE * 100);
    $("#app").innerHTML = `<h1>Carrinho <small class="muted">(${count()} itens)</small></h1><div class="split"><div class="box wide">
      <div class="prog"><span>${rest > 0 ? `Faltam <b>${brl(rest)}</b> para frete grátis` : "🎉 Você ganhou frete grátis!"}</span><i><u style="width:${pct}%"></u></i></div>` +
      c.map(i => `<div class="row"><img src="${esc(i.image)}" alt=""><div class="grow"><strong>${esc(i.name)}</strong><div class="muted">${brl(i.price)}</div></div>
        <div class="qty"><button data-act="dec" data-id="${i.id}" aria-label="Diminuir">−</button><span>${i.qty}</span><button data-act="inc" data-id="${i.id}" aria-label="Aumentar">+</button></div>
        <strong class="rt">${brl(i.price * i.qty)}</strong></div>`).join("") +
      `<button class="btn ghost" data-act="clear" style="margin-top:14px">Esvaziar carrinho</button></div>
      <aside class="box wide"><strong>Resumo</strong>
      <div class="cp"><input id="cp" placeholder="Cupom de desconto" value="${t.cp}"><button class="btn ghost" data-act="coupon">Aplicar</button></div>
      <small class="muted">Experimente AURORA10 ou BEMVINDO</small>${sumLines(t)}
      <button class="btn full" data-act="checkout">Finalizar compra</button></aside></div>`;
  },
  checkout(){
    const s = session(), c = cart(); if(!c.length) return go("cart");
    if(!s){ store.set("next", "checkout"); toast("Entre para finalizar a compra"); return go("login"); }
    $("#app").innerHTML = `<h1>Finalizar compra</h1><div class="split">
      <form class="box wide" id="pay"><strong>Entrega e pagamento</strong>
      <label>Endereço</label><input name="address" required placeholder="Rua, número, bairro">
      <div class="two"><div><label>Cidade</label><input name="city" required></div><div><label>CEP</label><input name="zip" required pattern="\\d{5}-?\\d{3}" placeholder="00000-000"></div></div>
      <label>Forma de pagamento</label><select name="method"><option value="Pix">Pix</option><option value="Cartão de crédito">Cartão de crédito</option><option value="Boleto">Boleto</option></select>
      <div class="err" id="msg"></div><button class="btn full" id="payBtn">Confirmar pedido</button></form>
      <aside class="box wide"><strong>Resumo</strong>` +
      c.map(i => `<div class="row"><img src="${esc(i.image)}" alt=""><div class="grow">${i.qty}× ${esc(i.name)}</div><span>${brl(i.qty * i.price)}</span></div>`).join("") +
      sumLines(totals()) + `</aside></div>`;
    $("#pay").onsubmit = async e => {
      e.preventDefault(); const f = new FormData(e.target), b = $("#payBtn"); b.disabled = true; b.textContent = "Processando…";
      try{
        const t = totals();
        const o = await api.order({customer:s.user.email, items:cart(), sub:t.sub, discount:t.disc, shipping:t.ship, total:t.total,
          address:f.get("address"), city:f.get("city"), zip:f.get("zip"), method:f.get("method")}, s.token);
        saveCart([]); store.remove("coupon"); done(o);
      }catch(err){ $("#msg").textContent = err.message; b.disabled = false; b.textContent = "Confirmar pedido"; }
    };
  },
  async orders(id){
    const s = session();
    if(!s){ store.set("next", "orders"); return go("login"); }
    $("#app").innerHTML = `<h1>Meus pedidos</h1><p class="muted">Carregando…</p>`;
    let l = []; try{ l = (await api.orders(s.user.email, s.token)).slice().reverse(); }catch(e){}
    if(id !== routeId) return;
    $("#app").innerHTML = l.length ? `<h1>Meus pedidos</h1>` + l.map(o => `<div class="box wide ord">
      <div class="oh"><div><b>Pedido #${esc(o.id)}</b><div class="muted small">${new Date(o.date).toLocaleDateString("pt-BR")} · ${esc(o.method)}</div></div><span class="pill ok">Em preparo</span></div>
      <div class="thumbs">${o.items.map(i => `<img src="${esc(i.image)}" title="${esc(i.name)}" alt="${esc(i.name)}">`).join("")}</div>
      <div class="ln"><span>${o.items.reduce((n,i) => n + i.qty, 0)} itens · ${esc(o.city)}</span><b>${brl(o.total)}</b></div></div>`).join("")
      : empty("📦", "Nenhum pedido ainda", "Quando você comprar, seus pedidos aparecem aqui.");
  }
};

function done(o){
  $("#app").innerHTML = `<div class="box mid"><div class="okc big">✓</div><h2>Pedido confirmado!</h2>
    <p>Número do pedido: <b>#${esc(o.id)}</b></p><p class="muted">Total: ${brl(o.total)} · ${esc(o.method)}</p>
    <p>${link("orders", "Ver meus pedidos")} ${link("home", "Continuar comprando")}</p></div>`;
}

function authView(title, reg){
  $("#app").innerHTML = `<div class="auth"><div class="aside"><div class="big">🛍️</div><h2>${reg ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
    <p>Salve favoritos, acompanhe pedidos e finalize compras em segundos.</p></div>
    <form class="box" id="auth"><h2>${title}</h2>` +
    (reg ? `<label>Nome</label><input name="name" required autocomplete="name">` : ``) +
    `<label>E-mail</label><input name="email" type="email" required autocomplete="email">
    <label>Senha</label><input name="password" type="password" required minlength="6" autocomplete="${reg ? "new-password" : "current-password"}">
    <div class="err" id="msg"></div><button class="btn full">${title}</button>
    <p class="muted">${reg ? `Já tem conta? <a href="#login">Entrar</a>` : `Novo por aqui? <a href="#register">Criar conta</a>`}</p></form></div>`;
  $("#auth").onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    try{
      const r = await (reg ? api.register(f) : api.login(f));
      store.set("session", r); updateNav(); toast("Bem-vindo(a), " + (r.user.name || "").split(" ")[0] + "!");
      const n = store.get("next", null); store.remove("next");
      go(n || "home");
    }catch(err){ $("#msg").textContent = err.message; }
  };
}
