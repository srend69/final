const img = (e, c1, c2) => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="320" cy="80" r="110" fill="#fff" opacity=".25"/><circle cx="60" cy="350" r="90" fill="#fff" opacity=".2"/><text x="200" y="250" font-size="160" text-anchor="middle">${e}</text></svg>`);
const MOCK = [
  ["Fone Bluetooth","Eletrônicos",249.9,329.9,4.7,812,"Cancelamento de ruído, 30 h de bateria e microfone com isolamento de voz.","🎧","#fed7aa","#fb923c"],
  ["Relógio Clássico","Acessórios",399,0,4.5,264,"Caixa em aço, vidro de safira e pulseira de couro legítimo.","⌚","#e7e5e4","#a8a29e"],
  ["Mochila Urbana","Bolsas",179.9,229.9,4.6,531,"Impermeável, compartimento para notebook de 15” e porta USB externa.","🎒","#bbf7d0","#4ade80"],
  ["Tênis Corrida","Calçados",329.9,429.9,4.8,1290,"Amortecimento responsivo e cabedal respirável para longas distâncias.","👟","#bfdbfe","#60a5fa"],
  ["Câmera Instantânea","Eletrônicos",459,0,4.4,198,"Fotos reveladas na hora, flash automático e lente de selfie.","📷","#fecdd3","#fb7185"],
  ["Óculos de Sol","Acessórios",129.9,169.9,4.3,402,"Proteção UV400 com lentes polarizadas e armação leve.","🕶️","#fef08a","#facc15"],
  ["Garrafa Térmica","Casa",79.9,0,4.9,2210,"Mantém bebidas geladas por 24 h ou quentes por 12 h.","🧴","#ddd6fe","#a78bfa"],
  ["Luminária de Mesa","Casa",149,189,4.5,347,"LED com 3 temperaturas de cor, dimmer e carregador sem fio.","💡","#fde68a","#f59e0b"],
  ["Teclado Mecânico","Eletrônicos",289,359,4.7,676,"Switches táteis, iluminação RGB e layout ABNT2.","⌨️","#c7d2fe","#818cf8"],
  ["Vestido Floral","Moda",199.9,259.9,4.6,310,"Tecido leve em viscose, caimento fluido e comprimento midi.","👗","#fbcfe8","#f472b6"],
  ["Caneca Cerâmica","Casa",39.9,0,4.8,945,"Esmaltada à mão, 350 ml, segura em micro-ondas e lava-louças.","☕","#fed7aa","#f97316"],
  ["Carteira de Couro","Acessórios",119,149,4.5,223,"Bloqueio RFID, 8 compartimentos de cartão e bolso para moedas.","👛","#d6d3d1","#78716c"]
].map((p, i) => ({id:i+1, name:p[0], category:p[1], price:p[2], old:p[3], rating:p[4], reviews:p[5], desc:p[6], image:img(p[7],p[8],p[9])}));
module.exports = MOCK;
