/* ===== Servidor simulado (imagens geradas como se viessem do servidor) ===== */
const img = (emoji, c1, c2) => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><text x="150" y="190" font-size="120" text-anchor="middle">${emoji}</text></svg>`);
const MOCK = [
  ["Fone Bluetooth","Eletrônicos",249.9,"🎧","#fed7aa","#fb923c"],
  ["Relógio Clássico","Acessórios",399,"⌚","#e7e5e4","#a8a29e"],
  ["Mochila Urbana","Bolsas",179.9,"🎒","#bbf7d0","#4ade80"],
  ["Tênis Corrida","Calçados",329.9,"👟","#bfdbfe","#60a5fa"],
  ["Câmera Instantânea","Eletrônicos",459,"📷","#fecdd3","#fb7185"],
  ["Óculos de Sol","Acessórios",129.9,"🕶️","#fef08a","#facc15"],
  ["Garrafa Térmica","Casa",79.9,"🧴","#ddd6fe","#a78bfa"],
  ["Luminária de Mesa","Casa",149,"💡","#fde68a","#f59e0b"]
].map((p,i) => ({id:i+1, name:p[0], category:p[1], price:p[2], image:img(p[3],p[4],p[5])}));

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
  if(!r.ok) throw new Error(d.message || "Erro no servidor");
  return d;
}
const api = {
  async products(){ if(API_BASE) return http("/products"); await wait(350); return MOCK; },
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
  async order(o, token){
    if(API_BASE) return http("/orders", o, token);
    await wait(500);
    const orders = store.get("orders", []); const rec = {id: Date.now().toString().slice(-8), ...o, date: new Date().toISOString()};
    orders.push(rec); store.set("orders", orders); return rec;
  }
};
