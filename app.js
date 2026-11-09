
const $ = id => document.getElementById(id);
const num = v => v.toLocaleString('es-CO', { maximumFractionDigits: 2 });
const signo = v => (v < 0 ? '− ' : '+ ') + num(Math.abs(v));

const c1 = $('c1'), ctx = c1.getContext('2d');
const c2 = $('c2'), ctx2 = c2.getContext('2d');
let a = -3, b = 40, c = 100, x = 5, X = 50, timer = null, isDrag = false;

const R = t => a * t * t + b * t + c;
const D = t => 2 * a * t + b;
const D2 = () => 2 * a;

function update() {
  a = +$('a').value; b = +$('b').value; c = +$('c').value;

  const xMax = -b / (2 * a), Rmax = R(xMax);

  X = Math.max(10, Math.ceil(2.2 * xMax));
  $('x').max = X;
  if (x > X) x = X;

  $('x').value = x;
  $('acX').textContent = num(x);
  const func = `R(x) = ${num(a)}x² ${signo(b)}x ${signo(c)}`;
  $('funcion').innerHTML = `${func} <br> (a=${num(a)}, b=${num(b)}, c=${num(c)})`;

  $('s1').textContent = num(xMax);
  $('s2').textContent = num(Rmax);
  $('s3').textContent = num(R(x));
  $('s4').textContent = num(D(x));

  
  const m = $('msg'), tol = 0.05 * xMax + 0.25, optimal = Math.abs(x - xMax) <= tol;
  m.style.background = optimal ? '#16a34a' : x < xMax ? '#2563eb' : '#dc2626';
  m.innerHTML = optimal 
    ? '<strong>Red en estado óptimo</strong><br><small>El rendimiento está en su máximo y la derivada es cercana a 0.</small>'
    : x < xMax 
    ? `<strong>Red sin saturar: se pueden agregar usuarios</strong><br><small>R'(x) = +${num(D(x))}: cada usuario adicional suma rendimiento.</small>`
    : `<strong>Red saturada: se debe reducir usuarios</strong><br><small>R'(x) = ${num(D(x))}: el sistema está perdiendo rendimiento.</small>`;

  $('pasos').innerHTML = `
    <li><b>Función:</b> <span>${func}</span></li>
    <li><b>1ª Derivada:</b> <span>R'(x) = ${num(2 * a)}x ${signo(b)}</span></li>
    <li><b>Punto crítico [R'(x)=0]:</b> <span>x* = ${num(xMax)}</span></li>
    <li><b>2ª Derivada:</b> <span>R″(x) = ${num(D2())}</span><!li>
    <li><b>Rendmiento en x=${num(x)}:</b> <span>${num(R(x))}</span></li>`;

  draw(xMax, Rmax);
  drawDerivada(xMax);
}

// Función auxiliar para dibujar cajitas de etiquetas flotantes y evitar repetir código
function drawTag(context, text, x, y, isVertical = true) {
  context.font = 'bold 11px sans-serif';
  const tw = context.measureText(text).width;
  context.fillStyle = '#DCFCE7';
  context.lineWidth = 1;

  if (isVertical) {
    // Etiqueta para el Eje Y (alineada a la izquierda del eje)
    context.fillRect(x - tw - 14, y - 10, tw + 10, 20);
    context.strokeRect(x - tw - 14, y - 10, tw + 10, 20);
    context.fillStyle = '#166534';
    context.textAlign = 'right';
    context.fillText(text, x - 9, y + 4);
  } else {
    // Etiqueta para el Eje X (centrada abajo del eje)
    context.fillRect(x - tw/2 - 6, y + 4, tw + 12, 18);
    context.strokeRect(x - tw/2 - 6, y + 4, tw + 12, 18);
    context.fillStyle = '#166534';
    context.textAlign = 'center';
    context.fillText(text, x, y + 17);
  }
}

function draw(xMax, Rmax) {
  const k = window.devicePixelRatio || 1, w = c1.clientWidth || 100, h = c1.clientHeight || 160;
  c1.width = w * k; c1.height = h * k; ctx.setTransform(k, 0, 0, k, 0, 0);
  const L = 64, Rr = 16, T = 16, B = 45, y0 = Math.min(0, R(X)), y1 = Rmax * 1.15;
  const sx = t => L + (t / X) * (w - L - Rr), sy = v => T + (1 - (v - y0) / (y1 - y0)) * (h - T - B);

  // Grilla y Eje Y
  ctx.font = '12px sans-serif'; ctx.strokeStyle = '#E2E8F0'; ctx.fillStyle = '#64748B'; ctx.lineWidth = 1; ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const v = y0 + ((y1 - y0) * i) / 5, y = sy(v);
    ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(w - Rr, y); ctx.stroke();
    ctx.fillText(num(Math.round(v)), L - 8, y + 4);
  }

  // Eje X
  ctx.textAlign = 'center';
  for (let t = 0; t <= X; t += (X <= 20 ? 2 : X <= 50 ? 5 : 10)) ctx.fillText(t, sx(t), h - 25);
  ctx.fillText('Usuarios simultáneos (x)', L + (w - L - Rr) / 2, h - 8);

  // Curva principal R(x)
  ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = (X * i) / 200; i ? ctx.lineTo(sx(t), sy(R(t))) : ctx.moveTo(sx(t), sy(R(t)));
  }
  ctx.stroke();

  // Recta tangente
  const dl = X * 0.12;
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(sx(x - dl), sy(R(x) - D(x) * dl)); ctx.lineTo(sx(x + dl), sy(R(x) + D(x) * dl)); ctx.stroke();

  // Líneas punteadas hacia X e Y
  const xM = sx(xMax), yM = sy(Rmax), yBase = sy(y0);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = '#16A34A'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(xM, yBase); ctx.lineTo(xM, yM); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L, yM); ctx.lineTo(xM, yM); ctx.stroke();
  ctx.setLineDash([]);

  // Puntos indicadores en los ejes
  ctx.fillStyle = '#16A34A';
  ctx.beginPath(); ctx.arc(L, yM, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(xM, yBase, 4, 0, Math.PI * 2); ctx.fill();

  // Llamada a la función simplificada para las etiquetas
  drawTag(ctx, `R(x*) = ${num(Rmax)}`, L, yM, true);
  drawTag(ctx, `x* = ${num(xMax)}`, xM, yBase, false);

  // Puntos clave sobre la curva y usuario actual
  ctx.beginPath(); ctx.arc(xM, yM, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(sx(x), sy(R(x)), 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke();
}

function drawDerivada(xMax) {
  const k = window.devicePixelRatio || 1, w = c2.clientWidth || 600, h = c2.clientHeight || 160;
  c2.width = w * k; c2.height = h * k; ctx2.setTransform(k, 0, 0, k, 0, 0);
  const L = 64, Rr = 16, T = 16, B = 30, dMin = D(X), dMax = D(0);
  const sx = t => L + (t / X) * (w - L - Rr), sy = v => T + (1 - (v - dMin) / (dMax - dMin)) * (h - T - B);

  const yZero = sy(0);
  ctx2.strokeStyle = '#94A3B8'; ctx2.lineWidth = 1; ctx2.beginPath(); ctx2.moveTo(L, yZero); ctx2.lineTo(w - Rr, yZero); ctx2.stroke();

  ctx2.strokeStyle = '#DC2626'; ctx2.lineWidth = 2.5; ctx2.beginPath();
  ctx2.moveTo(sx(0), sy(D(0))); ctx2.lineTo(sx(X), sy(D(X))); ctx2.stroke();

  ctx2.fillStyle = '#16A34A'; ctx2.beginPath(); ctx2.arc(sx(xMax), yZero, 5, 0, Math.PI * 2); ctx2.fill();
  ctx2.fillStyle = '#0F172A'; ctx2.beginPath(); ctx2.arc(sx(x), sy(D(x)), 7, 0, Math.PI * 2); ctx2.fill();
  ctx2.strokeStyle = '#FFFFFF'; ctx2.lineWidth = 2; ctx2.stroke();

  ctx2.font = '11px sans-serif'; ctx2.fillStyle = '#64748B'; ctx2.textAlign = 'right';
  ctx2.fillText("R'(x)=0", L - 8, yZero + 4);
}

const getX = (e, c1s) => {
  const r = c1s.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  return Math.max(0, Math.min(X, ((clientX - r.left - 64) / (c1s.clientWidth - 80)) * X));
};

const stopSim = () => { if (timer) { clearInterval(timer); timer = null; $('bs').textContent = '▶ Simular aumento de usuarios'; } };

[c1, c2].forEach(c1s => {
  ['mousedown', 'touchstart'].forEach(evt => c1s.addEventListener(evt, e => {
    isDrag = true; x = getX(e, c1s); stopSim(); update();
  }, {passive: true}));
});

window.addEventListener('mousemove', e => { if (isDrag) { x = getX(e, c1); update(); } });
window.addEventListener('touchmove', e => { if (isDrag && e.touches[0]) { x = getX(e.touches[0], c1); update(); } }, {passive: true});
window.addEventListener('mouseup', () => isDrag = false);
window.addEventListener('touchend', () => isDrag = false);

$('bs').onclick = () => {
  if (timer) return stopSim();
  timer = setInterval(() => {
    if ((x += X / 150) >= X) { x = X; stopSim(); }
    update();
  }, 40);
};

['a', 'b', 'c'].forEach(id => $(id).addEventListener('input', update));
$('x').addEventListener('input', e => { x = +e.target.value; stopSim(); update(); });
window.addEventListener('resize', update);
update();