-- Tabelas da loja Aurora (MySQL 8+ / MariaDB 10+).
-- Para rodar manualmente no Workbench: selecione o banco (ex.: USE teste3dsc;) e execute.
-- Ou simplesmente rode: npm run setup

CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED NOT NULL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  old_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating      DECIMAL(2,1)  NOT NULL DEFAULT 0,
  reviews     INT UNSIGNED  NOT NULL DEFAULT 0,
  description TEXT,
  image       MEDIUMTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  subtotal   DECIMAL(10,2) NOT NULL,
  discount   DECIMAL(10,2) NOT NULL,
  shipping   DECIMAL(10,2) NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  coupon     VARCHAR(30) NULL,
  address    VARCHAR(200) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  zip        VARCHAR(9)   NOT NULL,
  method     VARCHAR(30)  NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id   INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  qty        INT UNSIGNED NOT NULL,
  CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
