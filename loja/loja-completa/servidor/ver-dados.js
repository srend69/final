// Mostra o conteúdo do banco em tabelas no terminal: npm run dados
const Database = require("better-sqlite3");
const db = new Database(require("path").join(__dirname, "loja.db"), { readonly: true });
const show = (titulo, sql) => { console.log("\n=== " + titulo + " ==="); console.table(db.prepare(sql).all()); };
show("USUÁRIOS", "SELECT id, name, email, created_at FROM users");
show("PEDIDOS", "SELECT o.id, u.email, o.subtotal, o.discount, o.shipping, o.total, o.coupon, o.method, o.city, o.created_at FROM orders o JOIN users u ON u.id = o.user_id");
show("ITENS DOS PEDIDOS", "SELECT order_id, product_id, name, price, qty FROM order_items");
show("PRODUTOS", "SELECT id, name, category, price, old, rating, reviews FROM products");
