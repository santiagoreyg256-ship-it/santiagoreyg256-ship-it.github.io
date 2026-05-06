document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-recomendados');
    const btnReiniciar = document.getElementById('btn-reiniciar');

    function cargarRecomendaciones() {
        const modo = localStorage.getItem('filtro_modo');
        const likes = JSON.parse(localStorage.getItem('filtro_likes') || "[]");
        const dislikes = JSON.parse(localStorage.getItem('filtro_dislikes') || "[]");
        
        const seriesUsuario = JSON.parse(localStorage.getItem('series_usuario') || "[]");
        const catalogoCompleto = [...series, ...seriesUsuario];

        let lista = [];

        if (!modo) {
            lista = catalogoCompleto; 
        } else if (modo === 'genero') {
            const nombresGenerosLikes = likes.map(g => g.titulo);
            const nombresGenerosDislikes = dislikes.map(g => g.titulo);

            lista = catalogoCompleto.filter(s => {
                const tieneDescartado = s.generos.some(g => nombresGenerosDislikes.includes(g));
                if (tieneDescartado) return false;
                return s.generos.some(g => nombresGenerosLikes.includes(g));
            });
        } else if (modo === 'serie') {
            lista = calcularSimilitudCoseno(likes, dislikes, catalogoCompleto);
        }

        mostrarLista(lista);
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            localStorage.removeItem('filtro_modo');
            localStorage.removeItem('filtro_likes');
            localStorage.removeItem('filtro_dislikes');
            cargarRecomendaciones();
        });
    }

    cargarRecomendaciones();
});

function calcularSimilitudCoseno(likes, dislikes, catalogo) {
    const todosLosGeneros = [...new Set(catalogo.flatMap(s => s.generos))];

    const vectorUsuario = todosLosGeneros.map(genero => {
        let puntuacion = 0;
        likes.forEach(s => { if (s.generos.includes(genero)) puntuacion += 1; });
        dislikes.forEach(s => { if (s.generos.includes(genero)) puntuacion -= 1; });
        return puntuacion;
    });

    const idsVotados = [...likes, ...dislikes].map(s => s.titulo);

    const mapeoSimilitud = catalogo
        .filter(s => !idsVotados.includes(s.titulo))
        .map(serie => {
            const vectorSerie = todosLosGeneros.map(g => serie.generos.includes(g) ? 1 : 0);
            const score = similitudCoseno(vectorUsuario, vectorSerie);
            return { ...serie, score };
        })
        .filter(serie => serie.score >= 0); 
 
    return mapeoSimilitud.sort((a, b) => b.score - a.score);
}

function similitudCoseno(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function mostrarLista(lista) {
    const contenedor = document.getElementById('contenedor-recomendados');
    if (!contenedor) return;
    
    contenedor.innerHTML = ""; 

    lista.forEach(serie => {
        const section = document.createElement('section');
        section.className = 'card';
        section.innerHTML = `
            <img src="${serie.imagen}" alt="${serie.titulo}" onerror="this.src='img/none.jpg'">
            <div>
                <h4>${serie.titulo}</h4>
                <p>${serie.generos.join(", ")}</p>
            </div>
        `;
        contenedor.appendChild(section);
    });
}