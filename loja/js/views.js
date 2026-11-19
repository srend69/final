/* ===== Telas ===== */
const views = {
  async home(){
    $("#app").innerHTML = `<h1>Destaques</h1><p class="muted">Carregando produtos…</p>`;
    try{ if(!products.length) products = await api.products(); }
    catch(e){ $("#app").innerHTML = `<h1>Destaques</h1><p class="err">Não foi possível carregar os produtos.</p>`; return; }
    $("#app").innerHTML = `<h1>Destaques</h1><div class="grid">` + products.map(p => `
      <article class="card"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
      <div class="in"><span class="cat">${esc(p.category)}</span><h3>${esc(p.name)}</h3>
      <span class="price">${brl(p.price)}</span>
      <button class="btn" data-act="add" data-id="${p.id}">Adicionar</button></div></article>`).join("") + `</div>`;
  },
  login(){ authView("Entrar", false); },
  register(){ authView("Criar conta", true); },
  cart(){
    const c = cart();
    if(!c.length){ $("#app").innerHTML = `<h1>Carrinho</h1><p class="muted">Seu carrinho está vazio.</p><a class="btn" style="text-decoration:none;display:inline-block" href="#home">Ver produtos</a>`; return; }
    $("#app").innerHTML = `<h1>Carrinho</h1><div class="box wide">` + c.map(i => `
      <div class="row"><img src="${esc(i.image)}" alt=""><div class="grow"><strong>${esc(i.name)}</strong><div class="muted">${brl(i.price)}</div></div>
      <div class="qty"><button data-act="dec" data-id="${i.id}" aria-label="Diminuir">−</button><span>${i.qty}</span><button data-act="inc" data-id="${i.id}" aria-label="Aumentar">+</button></div>
      <strong>${brl(i.price * i.qty)}</strong></div>`).join("") +
      `<div class="total"><span>Total</span><span>${brl(total())}</span></div>
      <button class="btn" data-act="checkout">Finalizar compra</button>
      <button class="btn ghost" data-act="clear">Esvaziar</button></div>`;
  },
  checkout(){
    const s = session(), c = cart();
    if(!c.length) return go("cart");
    if(!s){ store.set("next", "checkout"); toast("Entre para finalizar a compra"); return go("login"); }
    $("#app").innerHTML = `<h1>Finalizar compra</h1><div class="split">
      <form class="box wide" id="pay"><strong>Entrega e pagamento</strong>
      <label>Endereço</label><input name="address" required placeholder="Rua, número, bairro">
      <label>Cidade</label><input name="city" required>
      <label>CEP</label><input name="zip" required pattern="\\d{5}-?\\d{3}" placeholder="00000-000">
      <label>Forma de pagamento</label><select name="method"><option value="pix">Pix</option><option value="card">Cartão de crédito</option><option value="boleto">Boleto</option></select>
      <div class="err" id="msg"></div><button class="btn" id="go" style="width:100%;margin-top:12px">Confirmar pedido</button></form>
      <div class="box wide"><strong>Resumo</strong>` + c.map(i => `<div class="row"><div class="grow">${i.qty}× ${esc(i.name)}</div><span>${brl(i.qty * i.price)}</span></div>`).join("") +
      `<div class="total"><span>Total</span><span>${brl(total())}</span></div></div></div>`;
    $("#pay").onsubmit = async e => {
      e.preventDefault(); const f = new FormData(e.target), b = $("#go"); b.disabled = true; b.textContent = "Processando…";
      try{
        const o = await api.order({customer:s.user.email, items:cart(), total:total(), address:f.get("address"), city:f.get("city"), zip:f.get("zip"), method:f.get("method")}, s.token);
        saveCart([]); done(o);
      }catch(err){ $("#msg").textContent = err.message; b.disabled = false; b.textContent = "Confirmar pedido"; }
    };
  }
};
function done(o){
  $("#app").innerHTML = `<div class="box" style="text-align:center"><div class="ok">✓</div><h1>Pedido confirmado!</h1>
    <p>Número do pedido: <strong>#${esc(o.id)}</strong></p><p class="muted">Total: ${brl(o.total)}</p><a class="btn" style="text-decoration:none;display:inline-block" href="#home">Continuar comprando</a></div>`;
}
function authView(title, reg){
  $("#app").innerHTML = `<h1>${title}</h1><form class="box" id="auth">` +
    (reg ? `<label>Nome</label><input name="name" required autocomplete="name">` : ``) +
    `<label>E-mail</label><input name="email" type="email" required autocomplete="email">
    <label>Senha</label><input name="password" type="password" required minlength="6" autocomplete="${reg ? "new-password" : "current-password"}">
    <div class="err" id="msg"></div><button class="btn" style="width:100%;margin-top:8px">${title}</button>
    <p class="muted">${reg ? `Já tem conta? <a href="#login">Entrar</a>` : `Novo por aqui? <a href="#register">Criar conta</a>`}</p></form>`;
  $("#auth").onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    try{
      const r = await (reg ? api.register(f) : api.login(f));
      store.set("session", r); updateNav(); toast("Bem-vindo(a), " + r.user.name.split(" ")[0] + "!");
      const n = store.get("next", null); try{ localStorage.removeItem("next"); }catch(x){}
      go(n || "home");
    }catch(err){ $("#msg").textContent = err.message; }
  };
}
