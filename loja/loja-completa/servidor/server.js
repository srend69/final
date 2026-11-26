const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "troque-este-segredo-em-producao";
const FREE = 300, SHIPPING = 19.9;
const COUPONS = { AURORA10: 0.1, BEMVINDO: 0.15 };
const METHODS = ["Pix", "Cartão de crédito", "Boleto"];
const money = n => Math.round(n * 100) / 100;

/* ===== Banco de dados ===== */
const db = new Database(path.join(__dirname, "loja.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, old REAL DEFAULT 0,
  rating REAL, reviews INTEGER, description TEXT, image TEXT);
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
  subtotal REAL, discount REAL, shipping REAL, total REAL, coupon TEXT,
  address TEXT, city TEXT, zip TEXT, method TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items(
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id), name TEXT, price REAL, qty INTEGER);
`);
if (db.prepare("SELECT COUNT(*) n FROM products").get().n === 0) {
  const ins = db.prepare("INSERT INTO products(id,name,category,price,old,rating,reviews,description,image) VALUES (?,?,?,?,?,?,?,?,?)");
  db.transaction(list => list.forEach(p => ins.run(p.id, p.name, p.category, p.price, p.old, p.rating, p.reviews, p.desc, p.image)))(require("./products"));
  console.log("Produtos iniciais cadastrados.");
}

/* ===== App ===== */
const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const fail = (res, status, message) => res.status(status).json({ message });
const sign = u => jwt.sign({ id: u.id }, SECRET, { expiresIn: "7d" });
const publicUser = u => ({ name: u.name, email: u.email });

function auth(req, res, next) {
  const t = (req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    const { id } = jwt.verify(t, SECRET);
    req.user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!req.user) throw new Error();
    next();
  } catch { fail(res, 401, "Sessão inválida. Entre novamente."); }
}

app.get("/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY id").all();
  res.json(rows.map(({ description, ...p }) => ({ ...p, desc: description })));
});

app.post("/auth/register", (req, res) => {
  const name = String(req.body.name || "").trim(), email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, "Informe nome e e-mail válidos.");
  if (password.length < 6) return fail(res, 400, "A senha deve ter pelo menos 6 caracteres.");
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return fail(res, 409, "Este e-mail já está cadastrado.");
  const id = db.prepare("INSERT INTO users(name,email,password_hash) VALUES (?,?,?)").run(name, email, bcrypt.hashSync(password, 10)).lastInsertRowid;
  res.status(201).json({ user: { name, email }, token: sign({ id }) });
});

app.post("/auth/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!u || !bcrypt.compareSync(String(req.body.password || ""), u.password_hash)) return fail(res, 401, "E-mail ou senha incorretos.");
  res.json({ user: publicUser(u), token: sign(u) });
});

function formatOrder(o, email) {
  const items = db.prepare(`SELECT oi.product_id id, oi.name, oi.price, oi.qty, p.image
    FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`).all(o.id);
  return { id: String(o.id), customer: email, items, sub: o.subtotal, discount: o.discount, shipping: o.shipping, total: o.total,
    address: o.address, city: o.city, zip: o.zip, method: o.method, date: new Date(o.created_at.replace(" ", "T") + "Z").toISOString() };
}

app.get("/orders", auth, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id").all(req.user.id);
  res.json(rows.map(o => formatOrder(o, req.user.email)));
});

app.post("/orders", auth, (req, res) => {
  const { items, address, city, zip, method, coupon } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 50) return fail(res, 400, "Carrinho vazio ou inválido.");
  if (![address, city].every(v => String(v || "").trim())) return fail(res, 400, "Informe endereço e cidade.");
  if (!/^\d{5}-?\d{3}$/.test(String(zip || ""))) return fail(res, 400, "CEP inválido.");
  if (!METHODS.includes(method)) return fail(res, 400, "Forma de pagamento inválida.");

  // Os preços vêm SEMPRE do banco; o total enviado pelo navegador é ignorado.
  const lines = [];
  for (const i of items) {
    const qty = Number(i.qty), p = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(i.id));
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail(res, 400, "Item inválido no carrinho.");
    lines.push({ p, qty });
  }
  const subtotal = money(lines.reduce((s, l) => s + l.p.price * l.qty, 0));
  const code = String(coupon || "").toUpperCase(), rate = Object.hasOwn(COUPONS, code) ? COUPONS[code] : 0;
  const discount = money(subtotal * rate), shipping = subtotal - discount >= FREE ? 0 : SHIPPING;
  const total = money(subtotal - discount + shipping);

  const orderId = db.transaction(() => {
    const id = db.prepare(`INSERT INTO orders(user_id,subtotal,discount,shipping,total,coupon,address,city,zip,method)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, subtotal, discount, shipping, total, rate ? code : null,
      String(address).trim(), String(city).trim(), zip, method).lastInsertRowid;
    const ins = db.prepare("INSERT INTO order_items(order_id,product_id,name,price,qty) VALUES (?,?,?,?,?)");
    lines.forEach(l => ins.run(id, l.p.id, l.p.name, l.p.price, l.qty));
    return id;
  })();
  res.status(201).json(formatOrder(db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId), req.user.email));
});

// Também serve o front-end: http://localhost:3000
app.use(express.static(path.join(__dirname, "..", "loja")));
app.use((err, req, res, next) => fail(res, 500, "Erro interno do servidor."));

app.listen(PORT, () => console.log(`Aurora rodando em http://localhost:${PORT}`));
