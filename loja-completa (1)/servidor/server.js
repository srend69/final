require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const PORT = process.env.API_PORT || 3000;
const SECRET = process.env.JWT_SECRET;
if (!SECRET) { console.error("Defina JWT_SECRET no arquivo .env"); process.exit(1); }
const FREE = 300, SHIPPING = 19.9;
const COUPONS = { AURORA10: 0.1, BEMVINDO: 0.15 };
const METHODS = ["Pix", "Cartão de crédito", "Boleto"];
const money = n => Math.round(n * 100) / 100;
const num = n => Number(n); // o MySQL devolve DECIMAL como texto

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
const fail = (res, status, message) => res.status(status).json({ message });
const sign = id => jwt.sign({ id }, SECRET, { expiresIn: "7d" });

const auth = wrap(async (req, res, next) => {
  try {
    const { id } = jwt.verify((req.headers.authorization || "").replace(/^Bearer /, ""), SECRET);
    const [[user]] = await pool.execute("SELECT id, name, email FROM users WHERE id = ?", [id]);
    if (!user) throw new Error();
    req.user = user; next();
  } catch (e) { fail(res, 401, "Sessão inválida. Entre novamente."); }
});

app.get("/products", wrap(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY id");
  res.json(rows.map(p => ({ id: p.id, name: p.name, category: p.category, price: num(p.price), old: num(p.old_price),
    rating: num(p.rating), reviews: p.reviews, desc: p.description, image: p.image })));
}));

app.post("/auth/register", wrap(async (req, res) => {
  const name = String(req.body.name || "").trim(), email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, "Informe nome e e-mail válidos.");
  if (password.length < 6) return fail(res, 400, "A senha deve ter pelo menos 6 caracteres.");
  try {
    const [r] = await pool.execute("INSERT INTO users(name,email,password_hash) VALUES (?,?,?)", [name, email, bcrypt.hashSync(password, 10)]);
    res.status(201).json({ user: { name, email }, token: sign(r.insertId) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return fail(res, 409, "Este e-mail já está cadastrado.");
    throw e;
  }
}));

app.post("/auth/login", wrap(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const [[u]] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  if (!u || !bcrypt.compareSync(String(req.body.password || ""), u.password_hash)) return fail(res, 401, "E-mail ou senha incorretos.");
  res.json({ user: { name: u.name, email: u.email }, token: sign(u.id) });
}));

async function loadOrders(user, where, params) {
  const [orders] = await pool.query(`SELECT * FROM orders WHERE ${where} ORDER BY id`, params);
  if (!orders.length) return [];
  const [items] = await pool.query(`SELECT oi.order_id, oi.product_id AS id, oi.name, oi.price, oi.qty, p.image
    FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (?)`, [orders.map(o => o.id)]);
  return orders.map(o => ({ id: String(o.id), customer: user.email,
    items: items.filter(i => i.order_id === o.id).map(i => ({ id: i.id, name: i.name, price: num(i.price), qty: i.qty, image: i.image })),
    sub: num(o.subtotal), discount: num(o.discount), shipping: num(o.shipping), total: num(o.total),
    address: o.address, city: o.city, zip: o.zip, method: o.method, date: new Date(o.created_at).toISOString() }));
}

app.get("/orders", auth, wrap(async (req, res) => res.json(await loadOrders(req.user, "user_id = ?", [req.user.id]))));

app.post("/orders", auth, wrap(async (req, res) => {
  const { items, address, city, zip, method, coupon } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 50) return fail(res, 400, "Carrinho vazio ou inválido.");
  if (![address, city].every(v => String(v || "").trim())) return fail(res, 400, "Informe endereço e cidade.");
  if (!/^\d{5}-?\d{3}$/.test(String(zip || ""))) return fail(res, 400, "CEP inválido.");
  if (!METHODS.includes(method)) return fail(res, 400, "Forma de pagamento inválida.");

  // Os preços vêm SEMPRE do banco; o total enviado pelo navegador é ignorado.
  const ids = [...new Set(items.map(i => Number(i.id)))];
  const [prods] = await pool.query("SELECT id, name, price FROM products WHERE id IN (?)", [ids.length ? ids : [0]]);
  const byId = new Map(prods.map(p => [p.id, p]));
  const lines = [];
  for (const i of items) {
    const qty = Number(i.qty), p = byId.get(Number(i.id));
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail(res, 400, "Item inválido no carrinho.");
    lines.push({ p, qty });
  }
  const subtotal = money(lines.reduce((s, l) => s + num(l.p.price) * l.qty, 0));
  const code = String(coupon || "").toUpperCase(), rate = Object.hasOwn(COUPONS, code) ? COUPONS[code] : 0;
  const discount = money(subtotal * rate), shipping = subtotal - discount >= FREE ? 0 : SHIPPING;
  const total = money(subtotal - discount + shipping);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(`INSERT INTO orders(user_id,subtotal,discount,shipping,total,coupon,address,city,zip,method)
      VALUES (?,?,?,?,?,?,?,?,?,?)`, [req.user.id, subtotal, discount, shipping, total, rate ? code : null,
      String(address).trim(), String(city).trim(), zip, method]);
    await conn.query("INSERT INTO order_items(order_id,product_id,name,price,qty) VALUES ?",
      [lines.map(l => [r.insertId, l.p.id, l.p.name, l.p.price, l.qty])]);
    await conn.commit();
    res.status(201).json((await loadOrders(req.user, "id = ?", [r.insertId]))[0]);
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

// Também serve o front-end: http://localhost:3000
app.use(express.static(path.join(__dirname, "..", "loja")));
app.use((err, req, res, next) => { console.error(err); fail(res, 500, "Erro interno do servidor."); });

pool.query("SELECT 1").then(() => app.listen(PORT, () => console.log(`Aurora rodando em http://localhost:${PORT}`)))
  .catch(e => { console.error(`Não foi possível conectar ao MySQL (${e.code || e.message}).\nConfira o .env e rode "npm run setup" antes de iniciar.`); process.exit(1); });
