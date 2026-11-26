// Cria o banco (se não existir), as tabelas e os produtos iniciais: npm run setup
require("dotenv").config();
const fs = require("fs"), path = require("path"), mysql = require("mysql2/promise");

(async () => {
  const name = process.env.DB_DATABASE;
  if (!name || !/^[\w$]+$/.test(name)) throw new Error("Defina DB_DATABASE no arquivo .env (apenas letras, números e _).");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, multipleStatements: true,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4`);
  await conn.query(`USE \`${name}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM products");
  if (n === 0) {
    const rows = require("./products").map(p => [p.id, p.name, p.category, p.price, p.old, p.rating, p.reviews, p.desc, p.image]);
    await conn.query("INSERT INTO products(id,name,category,price,old_price,rating,reviews,description,image) VALUES ?", [rows]);
    console.log(`${rows.length} produtos cadastrados.`);
  }
  console.log(`Banco "${name}" pronto.`);
  await conn.end();
})().catch(e => { console.error("Falha no setup:", e.message); process.exit(1); });
