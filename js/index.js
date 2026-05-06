document.addEventListener('DOMContentLoaded', () => {
    let modoSeleccionado = null; 
    let indice = 0;
    let seriesItem = []; 
    let recomendados = []; 
    let descartados = [];      

    const tarjeta = document.querySelector('.card');
    const btnSi = document.getElementById('btn-si');
    const btnNo = document.getElementById('btn-no');
    const botones = document.querySelector('.buttons-container'); 

    function gestionarBotones() {
        if (!botones) return;
    }

    function mostrar() {
        if (!tarjeta) return;
        gestionarBotones();

        if (!modoSeleccionado) {
            tarjeta.innerHTML = `
                <div style="padding: 20px; text-align: center; justify-content: center; display: flex; flex-direction: column; gap: 10px; height: 100%">
                    <h4 style="font-size:20px;">Escoge el tipo de filtrado:</h4>
                    <button onclick="window.setModo('genero')" style="padding:12px; background:rgb(252, 30, 30); color:white; border:none; cursor:pointer; font-size:18px;">Por generos</button>
                    <button onclick="window.setModo('serie')" style="padding:12px; background:rgb(60, 60, 255); color:white; border:none; cursor:pointer; font-size:18px;">Por series</button>
                </div>
            `;
            return;
        }

        if (indice < seriesItem.length) {
            const item = seriesItem[indice];    
            tarjeta.innerHTML = `
                <img src="${item.imagen}" alt="${item.titulo}" onerror="this.src='img/none.jpg'">
                <div class="info-card">
                    <h4>${modoSeleccionado === 'genero' ? '¿Te gusta ' + item.titulo + '?' : item.titulo}</h4>
                    <p>${modoSeleccionado === 'serie' ? item.generos.join(" • ") : ' ← Elige según tu gusto →'}</p>
                </div>
            `;
        } else {
            localStorage.setItem('filtro_modo', modoSeleccionado);
            localStorage.setItem('filtro_likes', JSON.stringify(recomendados));
            localStorage.setItem('filtro_dislikes', JSON.stringify(descartados));

            tarjeta.innerHTML = `
                <div class="pantalla-final" style="padding: 20px; text-align: center; height:100%;">
                    <h4 style="color: #ffffff;">Completado!</h4>
                    <p style="font-size:18px;">A continuación encontraras series que podrian gustarte.</p>
                    <a href="recomendados.html" id="btn-final" style="margin:5px; margin-top:20px; padding:10px 25px; background:rgba(138, 255, 138); color:black; border:none; border-radius:20px; cursor:pointer; font-weight:bold; font-size:20px; text-decoration:none;">
                        Recomendados
                    </button>
                </div>
            `;
        }
    }

    window.setModo = (modo) => {
        modoSeleccionado = modo;
        indice = 0;
        recomendados = [];
        descartados = [];

        if (modo === 'serie') {
            seriesItem = [...series]
                .sort(() => 0.5 - Math.random()) 
                .slice(0, 5);
        } else {
            seriesItem = generos;
        }
        mostrar();
    };

    btnSi.addEventListener('click', () => {
        if (modoSeleccionado && indice < seriesItem.length) {
            recomendados.push(seriesItem[indice]);
            indice++;
            mostrar();
        }
    });

    btnNo.addEventListener('click', () => {
        if (modoSeleccionado && indice < seriesItem.length) {
            descartados.push(seriesItem[indice]);
            indice++;
            mostrar();
        }
    });

    mostrar();
});


// Menu
const menuBtn = document.getElementById('mobile-menu');
const navList = document.getElementById('nav-list');
menuBtn.addEventListener('click', () => {
    navList.classList.toggle('active');
});