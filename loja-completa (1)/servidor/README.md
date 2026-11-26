# Servidor da loja Aurora (Node.js + MySQL)

## Antes de começar
- MySQL 8 (ou MariaDB) instalado e rodando localmente.
- Node.js 18 ou superior.

## Rodar
1. Copie `.env.example` para `.env` e preencha, principalmente `DB_PASSWORD`:
   ```
   API_PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha_do_mysql
   DB_DATABASE=teste3dsc
   JWT_SECRET=uma_frase_longa_e_secreta
   ```
2. No terminal:
   ```
   cd servidor
   npm install
   npm run setup     # cria o banco, as tabelas e os 12 produtos (pode rodar de novo sem problema)
   npm start
   ```
3. Abra **http://localhost:3000** (o servidor também entrega a loja).

## Ver os dados
- Terminal: `npm run dados`
- MySQL Workbench / DBeaver / extensão MySQL do VS Code: conecte em `127.0.0.1:3306` e abra o banco `teste3dsc`.

## Arquivos
- `db.js`: pool de conexões mysql2 (lê o `.env`)
- `schema.sql`: tabelas `products`, `users`, `orders`, `order_items` (pode rodar manualmente no Workbench)
- `setup.js`: cria banco, tabelas e produtos iniciais
- `server.js`: API Express
- `ver-dados.js`: mostra as tabelas no terminal

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET | /products | lista de produtos |
| POST | /auth/register | cadastro |
| POST | /auth/login | login (devolve token JWT) |
| GET | /orders | pedidos do usuário (precisa de token) |
| POST | /orders | cria pedido (preços e total calculados no servidor) |

## Problemas comuns
- `ER_ACCESS_DENIED_ERROR`: usuário ou senha do `.env` estão errados.
- `ECONNREFUSED`: o MySQL não está rodando ou a porta é outra.
- `ER_NOT_SUPPORTED_AUTH_MODE`: no MySQL 8 use mysql2 atualizado (já incluído) ou crie um usuário próprio em vez do root.
