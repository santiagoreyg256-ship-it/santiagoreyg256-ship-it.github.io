// Función abreviada para obtener elementos del DOM por su ID (atajo para document.getElementById)
// Cada vez que se llame a la constante $ va a buscar el elemendo con la id dada
const $ = id => document.getElementById(id);

// Función para formatear números al estándar de Colombia ('es-CO') limitando a máximo 2 decimales
const num = v => v.toLocaleString('es-CO', { maximumFractionDigits: 2 });

// Función para formatear el signo algebraico (+ o -) según si el valor es menor a cero y aplicar el formato numérico
const signo = v => (v < 0 ? '− ' : '+ ') + num(Math.abs(v));

// Busca el elemento que tiene la id "c1" en el html para guardarla como una constante y usarla, y indica que sera en 2 dimensiones
const c1 = $('c1'), ctx = c1.getContext('2d');

// Busca el elemento que tiene la id "c2" en el html para guardarla como una constante y usarla, y indica que sera en 2 dimensiones
const c2 = $('c2'), ctx2 = c2.getContext('2d');

// Declaración de variables: coeficientes de la parábola (a, b, c), usuario actual (x), límite máximo (X), temporizador y estado de arrastre (isDrag)
let a = -3, b = 40, c = 100, x = 5, X = 50, timer = null, isDrag = false;

// Función cuadrática principal que modela el rendimiento R(t) = a*t^2 + b*t + c
const R = t => a * t * t + b * t + c;

// Primera derivada de la función de rendimiento: R'(t) = 2*a*t + b (indica la tasa de cambio)
const D = t => 2 * a * t + b;

// Segunda derivada constante de la función: R''(t) = 2*a (indica la concavidad de la parábola)
const D2 = () => 2 * a;

// Función principal que actualiza toda la interfaz, cálculos matemáticos, estados y redibuja los gráficos
function update() {
    // Lee y convierte a número los valores actuales de los inputs 'a', 'b' y 'c' del DOM
    a = +$('a').value; b = +$('b').value; c = +$('c').value;

    // Calcula el vértice de la parábola (punto óptimo xMax) y su rendimiento máximo (Rmax)
    const xMax = -b / (2 * a), Rmax = R(xMax);

    // Ajusta dinámicamente el límite del eje X basándose en el punto óptimo encontrado
    X = Math.max((2*xMax), Math.ceil(2 * xMax));
    $('x').max = X;

    // Sincroniza el valor del input del control deslizante con la variable 'x' actual
    $('x').value = x;
    $('acX').textContent = num(x);
    
    // Construye la cadena de texto de la función matemática para mostrarla formateada en pantalla
    const func = `R(x) = ${num(a)}x² ${signo(b)}x ${signo(c)}`;
    $('funcion').innerHTML = `${func} <br> (a=${num(a)}, b=${num(b)}, c=${num(c)})`;

    // Actualiza los textos informativos de las estadísticas en el DOM con los valores calculados
    $('s1').textContent = num(xMax);
    $('s2').textContent = num(Rmax);
    $('s3').textContent = num(R(x));
    $('s4').textContent = num(D(x));

    // Determina el estado del sistema (óptimo, sin saturar o saturado) usando una tolerancia cercana al óptimo
    const m = $('msg'), tol = 0.05 * xMax + 0.1, optimal = Math.abs(x - xMax) <= tol;
    
    // Cambia dinámicamente el color de fondo del contenedor de mensajes según el estado de la red
    m.style.background = optimal ? '#16a34a' : x < xMax ? '#2563eb' : '#dc2626';
    
    // Rellena el mensaje descriptivo y analítico para el usuario de acuerdo a la posición actual de 'x'
    m.innerHTML = optimal 
        ? '<strong>Red en estado óptimo</strong><br><small>El rendimiento está en su máximo y la derivada es cercana a 0.</small>'
        : x < xMax 
        ? `<strong>Red sin saturar: se pueden agregar usuarios</strong><br><small>R'(x) = +${num(D(x))}: cada usuario adicional suma rendimiento.</small>`
        : `<strong>Red saturada: se debe reducir usuarios</strong><br><small>R'(x) = ${num(D(x))}: el sistema está perdido rendimiento.</small>`;

    // Actualiza la lista detallada de pasos analíticos y cálculos matemáticos en el DOM
    $('pasos').innerHTML = `
        <li><b>Función:</b> <span>${func}</span></li>
        <li><b>1ª Derivada:</b> <span>R'(x) = ${num(2*a)}x ${signo(b)}</span></li>
        <li><b>Punto crítico [R'(x)=0]:</b> <span>x* = ${num(xMax)}</span></li>
        <li><b>2ª Derivada:</b> <span>R″(x) = ${num(D2())}</span></li>
        <li><b>Rendmiento en x=${num(x)}:</b> <span>${num(R(x))}</span></li>`;

    // Ejecuta las funciones de renderizado gráfico de la función principal y de la derivada
    draw(xMax, Rmax);
    drawDerivada(xMax);
}

// Función auxiliar para dibujar cajitas de etiquetas flotantes y evitar repetir código en el canvas
function drawTag(context, text, x, y, isVertical) {
    context.font = 'bold 11px sans-serif';
    const tw = context.measureText(text).width; // Mide el ancho en píxeles del texto a renderizar
    context.fillStyle = '#DCFCE7';
    context.lineWidth = 1;


    if (isVertical) {
        // Dibuja la etiqueta orientada al Eje Y (alineada a la izquierda del punto de referencia)
        context.fillRect(x - tw - 2.5, y - 10, tw + 10, 20);
        context.strokeRect(x - tw - 2.5, y - 10, tw + 10, 20);
        context.fillStyle = '#166534';
        context.textAlign = 'right';
        context.fillText(text, x + 3, y + 4);
    } else {
        // Dibuja la etiqueta orientada al Eje X (centrada horizontalmente bajo el eje)
        context.fillRect(x - tw/2 - 6, y + 4, tw + 12, 18);
        context.strokeRect(x - tw / 2 - 6, y + 4, tw + 12, 18);
        context.fillStyle = '#166534';
        context.textAlign = 'center';
        context.fillText(text, x, y + 17);
    }
}

// Función encargada de dibujar la gráfica de la parábola principal en el primer lienzo (c1)
function draw(xMax, Rmax) {
    // Obtiene la resolución de pantalla (para pantallas Retina) y las dimensiones actuales del canvas
    const k = window.devicePixelRatio || 1, w = c1.clientWidth || 100, h = c1.clientHeight || 160;
    c1.width = w * k; c1.height = h * k; ctx.setTransform(k, 0, 0, k, 0, 0);
    
    // Define los márgenes y los límites numéricos mínimos y máximos para escalar las coordenadas cartesianas
    const L = 78, Rr = 16, T = 16, B = 45, y0 = Math.min(0, R(X)), y1 = Rmax * 1.2;
    
    // Funciones de mapeo (escala) de valores matemáticos a coordenadas en píxeles de la pantalla
    const sx = t => L + (t / X) * (w - L - Rr), sy = v => T + (1 - (v - y0) / (y1 - y0)) * (h - T - B);

    // Dibuja la cuadrícula de fondo y las marcas numéricas del Eje Y
    ctx.font = '12px sans-serif'; 
    ctx.strokeStyle = '#E2E8F0'; 
    ctx.fillStyle = '#64748B'; 
    ctx.lineWidth = 1; 
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const v = y0 + ((y1 - y0) * i) / 5, y = sy(v);
        ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(w - Rr, y); ctx.stroke();
        ctx.fillText(num(Math.round(v)), L - 8, y + 4);
    }

    // Dibuja las etiquetas numéricas del Eje X y el título del eje inferior
    ctx.textAlign = 'center';
    for (let t = 0; t <= X; t += (X <= 20 ? 2 : X <= 50 ? 5 : 10)) ctx.fillText(t, sx(t), h - 25);
    ctx.fillText('Usuarios simultáneos (x)', L + (w - L - Rr) / 2, h - 8);

    // Dibuja la curva continua de la función cuadrática principal R(x) usando un bucle de puntos unidos
    ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
        const t = (X * i) / 200; i ? ctx.lineTo(sx(t), sy(R(t))) : ctx.moveTo(sx(t), sy(R(t)));
    }
    ctx.stroke();

    // Dibuja la línea recta tangente a la curva en la posición actual del usuario 'x'
    const dl = X * 0.12;
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(sx(x - dl), sy(R(x) - D(x) * dl)); ctx.lineTo(sx(x + dl), sy(R(x) + D(x) * dl)); ctx.stroke();

    // Dibuja líneas guías punteadas desde el punto óptimo (xMax, Rmax) hacia los ejes coordenados
    const xM = sx(xMax), yM = sy(Rmax), yBase = sy(y0);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#16A34A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xM, yBase); ctx.lineTo(xM, yM); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L, yM); ctx.lineTo(xM, yM); ctx.stroke();
    ctx.setLineDash([]); // Restablece el trazo de línea a sólido

    // Dibuja pequeños círculos indicadores en los ejes para señalar el punto óptimo
    ctx.fillStyle = '#16A34A';
    ctx.beginPath(); ctx.arc(L, yM, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(xM, yBase, 4, 0, Math.PI * 2); ctx.fill();

    // Llama a la función reutilizable para renderizar las etiquetas flotantes de los puntos clave
    drawTag(ctx, `R(x*) = ${num(Rmax)}`, L, yM, true);
    drawTag(ctx, `x* = ${num(xMax)}`, xM, yBase, false);

    // Dibuja el punto máximo exacto sobre la curva y el punto correspondiente a la posición del usuario actual
    ctx.beginPath(); ctx.arc(xM, yM, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(sx(x), sy(R(x)), 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke();
}

// Función encargada de dibujar la gráfica de la función derivada R'(x) en el segundo lienzo (c2)
function drawDerivada(xMax) {
    // Configura la resolución y dimensiones del segundo canvas (c2)
    const k = window.devicePixelRatio || 1, w = c2.clientWidth || 600, h = c2.clientHeight || 160;
    c2.width = w * k; c2.height = h * k; ctx2.setTransform(k, 0, 0, k, 0, 0);
    
    // Define los márgenes y calcula los rangos mínimo y máximo para la derivada
    const L = 64, Rr = 16, T = 16, B = 30, dMin = D(X), dMax = D(0);
    const sx = t => L + (t / X) * (w - L - Rr), sy = v => T + (1 - (v - dMin) / (dMax - dMin)) * (h - T - B);

    // Dibuja la línea horizontal de referencia donde la derivada es igual a cero (Y = 0)
    const yZero = sy(0);
    ctx2.strokeStyle = '#94A3B8'; ctx2.lineWidth = 1; ctx2.beginPath(); ctx2.moveTo(L, yZero); ctx2.lineTo(w - Rr, yZero); ctx2.stroke();

    // Dibuja la línea recta de la derivada R'(x) que cruza el plano
    ctx2.strokeStyle = '#DC2626'; ctx2.lineWidth = 2.5; ctx2.beginPath();
    ctx2.moveTo(sx(0), sy(D(0))); ctx2.lineTo(sx(X), sy(D(X))); ctx2.stroke();

    // Dibuja puntos en la gráfica de la derivada para indicar la raíz (donde R'(x)=0) y la posición del usuario actual
    ctx2.fillStyle = '#16A34A'; ctx2.beginPath(); ctx2.arc(sx(xMax), yZero, 5, 0, Math.PI * 2); ctx2.fill();
    ctx2.fillStyle = '#0F172A'; ctx2.beginPath(); ctx2.arc(sx(x), sy(D(x)), 7, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = '#FFFFFF'; ctx2.lineWidth = 2; ctx2.stroke();

    // Añade la etiqueta de texto indicando el punto donde la derivada es cero
    ctx2.font = '11px sans-serif'; ctx2.fillStyle = '#64748B'; ctx2.textAlign = 'right';
    ctx2.fillText("R'(x)=0", L - 8, yZero + 4);
}

// Función matemática que traduce la posición en píxeles de un evento de clic o toque en el canvas a un valor numérico 'x'
const getX = (e, c1s) => {
    const r = c1s.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(X, ((clientX - r.left - 64) / (c1s.clientWidth - 80)) * X));
};

// Función para detener la simulación automática por temporizador y restablecer el texto del botón
const stopSim = () => { 
    if (timer) { 
        clearInterval(timer); 
        timer = null; 
        $('bs').textContent = '▶ Simular aumento de usuarios'; 
    } 
};

// Asocia eventos de interacción táctil y de ratón (clic/toque inicial) a ambos lienzos para permitir mover el punto directamente
[c1, c2].forEach(c1s => {
    ['mousedown', 'touchstart'].forEach(evt => c1s.addEventListener(evt, e => {
        isDrag = true; x = getX(e, c1s); stopSim(); update();
    }, {passive: true}));
});

// Evento global de movimiento del ratón para arrastrar el punto interactivo en tiempo real
window.addEventListener('mousemove', e => { if (isDrag) { x = getX(e, c1); update(); } });

// Evento global de movimiento táctil para dispositivos móviles al arrastrar el punto
window.addEventListener('touchmove', e => { if (isDrag && e.touches[0]) { x = getX(e.touches[0], c1); update(); } }, {passive: true});

// Eventos globales para finalizar el arrastre al soltar el botón del ratón o levantar el dedo de la pantalla
window.addEventListener('mouseup', () => isDrag = false);
window.addEventListener('touchend', () => isDrag = false);

// Controla la acción del botón de simulación automática (inicia o detiene un bucle de incremento progresivo de usuarios)
$('bs').onclick = () => {
    if (timer) return stopSim();
    timer = setInterval(() => {
        if ((x += 1) >= X) { x = X; stopSim(); }
        update();
        
    }, 150, x=0);
};

// Escucha cambios manuales en los inputs de coeficientes (a, b, c) para redibujar automáticamente
['a', 'b', 'c'].forEach(id => $(id).addEventListener('input', update));

// Escucha cambios en el control deslizante (slider) del número de usuarios 'x'
$('x').addEventListener('input', e => { x = +e.target.value; stopSim(); update(); });

// Escucha eventos de cambio de tamaño de la ventana del navegador para redimensionar y recalcular los gráficos
window.addEventListener('resize', update);

// Ejecución inicial para renderizar la aplicación por primera vez al cargar el script
update();
