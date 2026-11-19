# Mercado Aurora – front-end

Abra a pasta no VS Code e rode `index.html` (extensão **Live Server**) ou dê duplo clique no arquivo.

## Estrutura
- `index.html` – estrutura da página
- `css/style.css` – estilos (tema claro/escuro)
- `js/config.js` – `API_BASE`: URL do seu servidor (vazio = modo demonstração)
- `js/utils.js` – funções auxiliares e acesso ao localStorage
- `js/api.js` – chamadas ao servidor (e servidor simulado)
- `js/state.js` – carrinho (localStorage), sessão, menu e avisos
- `js/views.js` – telas: produtos, login, cadastro, carrinho, checkout
- `js/app.js` – rotas e eventos

## Integrar com o back-end
Defina `API_BASE` em `js/config.js`. Endpoints esperados:
`GET /products` · `POST /auth/register` · `POST /auth/login` · `POST /orders`

Produto esperado: `{ id, name, category, price, image }` (`image` = URL da imagem).
