const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const brl = n => n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
const wait = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
store.remove = k => { try{ localStorage.removeItem(k); }catch(e){} };
const money = n => Math.round(n * 100) / 100;
let memCart = [];
