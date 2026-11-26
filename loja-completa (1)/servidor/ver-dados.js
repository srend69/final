// Mostra o conteúdo do banco em tabelas no terminal: npm run dados
const { pool } = require("./db");
const show = async (titulo, sql) => { console.log("\n=== " + titulo + " ==="); console.table((await pool.query(sql))[0]); };
(async () => {
  await show("USUÁRIOS", "SELECT id, name, email, created_at FROM users");
  await show("PEDIDOS", "SELECT o.id, u.email, o.subtotal, o.discount, o.shipping, o.total, o.coupon, o.method, o.city, o.created_at FROM orders o JOIN users u ON u.id = o.user_id");
  await show("ITENS DOS PEDIDOS", "SELECT order_id, product_id, name, price, qty FROM order_items");
  await show("PRODUTOS", "SELECT id, name, category, price, old_price, rating, reviews FROM products");
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
