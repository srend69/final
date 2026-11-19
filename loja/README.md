# Aurora – front-end de e-commerce

Abra a pasta no VS Code e rode `index.html` (extensão **Live Server**) ou dê duplo clique.

## Estrutura
- `index.html` – estrutura da página
- `css/style.css` – estilos (tema claro/escuro, responsivo)
- `js/config.js` – `API_BASE`: URL do seu servidor (vazio = modo demonstração)
- `js/utils.js` – utilitários e localStorage
- `js/api.js` – chamadas ao servidor (e servidor simulado)
- `js/state.js` – carrinho, cupons, favoritos, tema e menu
- `js/views.js` – telas
- `js/app.js` – rotas e eventos

## Back-end
Endpoints: `GET /products` · `POST /auth/register` · `POST /auth/login` · `GET/POST /orders`
Produto: `{ id, name, category, price, old, rating, reviews, desc, image }` (`image` = URL).
Cupons de teste: `AURORA10` (10%) e `BEMVINDO` (15%).
