// Prévia · Dra. Marília Camargo · Otorrinolaringologia · RK Performance
document.documentElement.classList.add('js');

// abertura cinematográfica: some sozinha; se a animação não rodar, tira à força
const intro = document.querySelector('.intro');
if (intro) {
  intro.addEventListener('animationend', e => { if (e.animationName === 'intro-sai') intro.remove(); });
  setTimeout(() => intro && intro.remove(), 2700);
}

// topo sólido depois da primeira tela
const topo = document.getElementById('topo');
const marcaTopo = () => topo.classList.toggle('solido', scrollY > innerHeight * 0.55 || document.body.classList.contains('pagina'));
addEventListener('scroll', marcaTopo, { passive: true }); marcaTopo();

// revelação ao rolar
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// aviso de demonstração: na prévia, os botões de WhatsApp e telefone não ligam para o consultório.
// No site final, cada botão abre o WhatsApp da Dra. com a mensagem daquela página.
const demo = document.getElementById('demo');
const demoMsg = document.getElementById('demo-msg');
const demoTit = document.getElementById('demo-tit');
const demoTxt = document.getElementById('demo-txt');
document.querySelectorAll('[data-demo]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const tipo = el.dataset.demo;
    if (tipo === 'tel') {
      demoTit.textContent = 'Ligar para o consultório';
      demoTxt.textContent = 'No site final, este botão liga para o telefone do consultório (o número que a Dra. Luara indicar).';
      demoMsg.textContent = '(42) 98871-0130 · WhatsApp da Clínica Respirare (Google e link da bio), a confirmar';
    } else {
      demoTit.textContent = 'Agendar pelo WhatsApp';
      demoTxt.textContent = 'No site final, este botão abre o WhatsApp do consultório com a mensagem já escrita. Assim a secretária sabe que a paciente veio pelo site e qual página ela viu:';
      demoMsg.textContent = el.dataset.msg || 'Olá! Vim pelo site e quero agendar uma consulta com a Dra. Marília.';
    }
    if (typeof demo.showModal === 'function') demo.showModal(); else demo.setAttribute('open', '');
  });
});
demo && demo.querySelectorAll('[data-fecha]').forEach(b => b.addEventListener('click', () => demo.close()));
demo && demo.addEventListener('click', e => { if (e.target === demo) demo.close(); });

// vídeos: mudos, em loop, sem controles; tocam quando aparecem na tela
const videos = [...document.querySelectorAll('.vid video, .ph video')];
videos.forEach(v => { v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true; v.controls = false; });
const tenta = v => { if (v.paused) v.play().catch(() => {}); };
const naTela = v => { const r = v.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
let comSom = null;
function marca(q, ligado) {
  const b = q.querySelector('.som'); if (!b) return;
  b.setAttribute('aria-pressed', ligado ? 'true' : 'false');
  b.querySelector('span').textContent = ligado ? 'Desativar som' : 'Ativar som';
}
function silencia(q) { q.querySelector('video').muted = true; marca(q, false); if (comSom === q) comSom = null; }
function ligaSom(q) {
  if (comSom && comSom !== q) silencia(comSom);
  const v = q.querySelector('video');
  v.muted = false;
  v.play().then(() => { comSom = q; marca(q, true); }).catch(() => { v.muted = true; marca(q, false); });
}
const loops = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; tenta(v); }
  else { v.pause(); const q = v.closest('.vid'); if (q && q === comSom) silencia(q); }
}), { threshold: 0.2 });
videos.forEach(v => loops.observe(v));
document.querySelectorAll('.vid .som').forEach(b => {
  const q = b.closest('.vid');
  b.addEventListener('click', e => { e.stopPropagation(); q.querySelector('video').muted ? ligaSom(q) : silencia(q); });
});
// iPhone em economia de bateria bloqueia autoplay: o primeiro toque libera
const destrava = () => videos.forEach(v => { if (naTela(v)) tenta(v); });
['touchstart', 'touchend', 'click'].forEach(ev => addEventListener(ev, destrava, { passive: true }));

// letreiro: anda por requestAnimationFrame (não depende de @keyframes nem do "reduzir animações")
const faixa = document.getElementById('faixa');
if (faixa) {
  faixa.innerHTML += faixa.innerHTML;
  let x = 0, extra = 0, ultimoY = scrollY, antes = performance.now();
  const BASE = 48;
  addEventListener('scroll', () => { extra = Math.min(extra + Math.abs(scrollY - ultimoY) * 6, 900); ultimoY = scrollY; }, { passive: true });
  (function anda(agora) {
    const dt = Math.max(0, Math.min((agora - antes) / 1000, 0.05)) || 0;
    antes = agora;
    x -= (BASE + extra) * dt;
    extra *= 0.94;
    const meio = faixa.scrollWidth / 2;
    if (meio > 0 && -x >= meio) x += meio;
    faixa.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(anda);
  })(performance.now());
}

// parallax leve nas fotos (só no computador e só sem "reduzir animações")
const px = [...document.querySelectorAll('[data-parallax]')];
if (px.length && matchMedia('(min-width: 901px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pedido = false;
  const move = () => {
    pedido = false;
    px.forEach(el => {
      const r = el.getBoundingClientRect();
      const f = parseFloat(el.dataset.parallax) || 0.05;
      const d = (r.top + r.height / 2 - innerHeight / 2) * f;
      el.style.transform = `translate3d(0,${d.toFixed(1)}px,0)`;
    });
  };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(move); } }, { passive: true });
  move();
}
