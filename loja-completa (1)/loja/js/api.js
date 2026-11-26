/* ===== Servidor simulado (imagens geradas como se viessem do servidor) ===== */
const img = (e, c1, c2) => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="320" cy="80" r="110" fill="#fff" opacity=".25"/><circle cx="60" cy="350" r="90" fill="#fff" opacity=".2"/><text x="200" y="250" font-size="160" text-anchor="middle">${e}</text></svg>`);
const PLACEHOLDER = img("🛍️", "#e7e5e4", "#a8a29e");
// [nome, categoria, preço, preço antigo, nota, avaliações, descrição, emoji, cor1, cor2]
const MOCK = [
  ["Fone Bluetooth","Eletrônicos",249.9,329.9,4.7,812,"Cancelamento de ruído, 30 h de bateria e microfone com isolamento de voz.","🎧","#fed7aa","#fb923c"],
  ["Relógio Clássico","Acessórios",399,0,4.5,264,"Caixa em aço, vidro de safira e pulseira de couro legítimo.","⌚","#e7e5e4","#a8a29e"],
  ["Mochila Urbana","Bolsas",179.9,229.9,4.6,531,"Impermeável, compartimento para notebook de 15” e porta USB externa.","🎒","#bbf7d0","#4ade80"],
  ["Tênis Corrida","Calçados",329.9,429.9,4.8,1290,"Amortecimento responsivo e cabedal respirável para longas distâncias.","👟","#bfdbfe","#60a5fa"],
  ["Câmera Instantânea","Eletrônicos",459,0,4.4,198,"Fotos reveladas na hora, flash automático e lente de selfie.","📷","#fecdd3","#fb7185"],
  ["Óculos de Sol","Acessórios",129.9,169.9,4.3,402,"Proteção UV400 com lentes polarizadas e armação leve.","🕶️","#fef08a","#facc15"],
  ["Garrafa Térmica","Casa",79.9,0,4.9,2210,"Mantém bebidas geladas por 24 h ou quentes por 12 h.","🧴","#ddd6fe","#a78bfa"],
  ["Luminária de Mesa","Casa",149,189,4.5,347,"LED com 3 temperaturas de cor, dimmer e carregador sem fio.","💡","#fde68a","#f59e0b"],
  ["Teclado Mecânico","Eletrônicos",289,359,4.7,676,"Switches táteis, iluminação RGB e layout ABNT2.","⌨️","#c7d2fe","#818cf8"],
  ["Vestido Floral","Moda",199.9,259.9,4.6,310,"Tecido leve em viscose, caimento fluido e comprimento midi.","👗","#fbcfe8","#f472b6"],
  ["Caneca Cerâmica","Casa",39.9,0,4.8,945,"Esmaltada à mão, 350 ml, segura em micro-ondas e lava-louças.","☕","#fed7aa","#f97316"],
  ["Carteira de Couro","Acessórios",119,149,4.5,223,"Bloqueio RFID, 8 compartimentos de cartão e bolso para moedas.","👛","#d6d3d1","#78716c"]
].map((p, i) => ({id:i+1, name:p[0], category:p[1], price:p[2], old:p[3], rating:p[4], reviews:p[5], desc:p[6], image:img(p[7],p[8],p[9])}));

// Garante que dados vindos do servidor nunca quebrem a interface
const normalize = p => ({id:p.id, name:String(p.name || "Produto"), category:String(p.category || "Outros"),
  price:+p.price || 0, old:+p.old || 0, rating:Math.min(5, Math.max(0, +p.rating || 0)), reviews:+p.reviews || 0,
  desc:String(p.desc || ""), image:p.image || PLACEHOLDER});

// Demonstração apenas: sem HTTPS o SHA-256 não existe e o fallback NÃO é seguro. Use um servidor real em produção.
async function hash(t){
  try{ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join(""); }
  catch(e){ return btoa(t); }
}
async function http(path, body, token){
  const r = await fetch(API_BASE + path, {method: body ? "POST" : "GET",
    headers: {"Content-Type":"application/json", ...(token ? {Authorization:"Bearer " + token} : {})},
    body: body ? JSON.stringify(body) : undefined});
  const d = await r.json().catch(() => ({}));
  if(!r.ok){
    if(r.status === 401 && token){ store.remove("session"); updateNav(); throw new Error("Sessão expirada. Entre novamente."); }
    throw new Error(d.message || "Erro no servidor");
  }
  return d;
}
const api = {
  async products(){ if(API_BASE){ const l = await http("/products"); return Array.isArray(l) ? l.map(normalize) : []; } await wait(350); return MOCK; },
  async register(u){
    if(API_BASE) return http("/auth/register", u);
    const users = store.get("users", []);
    if(users.some(x => x.email === u.email)) throw new Error("Este e-mail já está cadastrado.");
    users.push({name:u.name, email:u.email, pass: await hash(u.password)}); store.set("users", users);
    return {user:{name:u.name, email:u.email}, token:"demo"};
  },
  async login(u){
    if(API_BASE) return http("/auth/login", u);
    const h = await hash(u.password);
    const f = store.get("users", []).find(x => x.email === u.email && x.pass === h);
    if(!f) throw new Error("E-mail ou senha incorretos.");
    return {user:{name:f.name, email:f.email}, token:"demo"};
  },
  async orders(email, token){
    if(API_BASE) return http("/orders", null, token);
    await wait(200); return store.get("orders", []).filter(o => o.customer === email);
  },
  async order(o, token){
    if(API_BASE) return http("/orders", o, token);
    await wait(500);
    const orders = store.get("orders", []); const rec = {id: Date.now().toString().slice(-8), ...o, date: new Date().toISOString()};
    orders.push(rec); store.set("orders", orders); return rec;
  }
};
