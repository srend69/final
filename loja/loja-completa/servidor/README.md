# Servidor da loja Aurora (Node.js + SQLite)

## Rodar
```
cd servidor
npm install
npm start
```
Abra **http://localhost:3000** (o servidor também entrega a loja). O banco `loja.db` é criado sozinho, com os 12 produtos.

## Ver os dados em tabelas
- Terminal: `npm run dados`
- VS Code: instale a extensão **SQLite Viewer** (qwtel.sqlite-viewer) e clique em `servidor/loja.db`.

## Tabelas
`products`, `users`, `orders`, `order_items`

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET | /products | lista de produtos |
| POST | /auth/register | cadastro |
| POST | /auth/login | login (devolve token JWT) |
| GET | /orders | pedidos do usuário (precisa de token) |
| POST | /orders | cria pedido (preços e total calculados no servidor) |

## Antes de publicar de verdade
- Defina `JWT_SECRET` (variável de ambiente) com um valor longo e secreto.
- Use HTTPS e limite de tentativas de login (ex.: `express-rate-limit`).
- Troque `API_BASE` em `loja/js/config.js` pela URL pública do servidor.
