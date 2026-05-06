document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('serie-form');
    const inputImagen = document.getElementById('imagen');
    const previewContainer = document.getElementById('preview-container');
    let imagenNone = "img/none.jpg";

    inputImagen.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagenNone = e.target.result;
                previewContainer.innerHTML = `
                    <img src="${imagenNone}" style="width: 300px; height: 340px; border-radius: 10px; margin-top: 10px; object-fit: cover;">
                `;
            }
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const g1 = document.getElementById('genero1').value;
        const g2 = document.getElementById('genero2').value;
        const g3 = document.getElementById('genero3').value;
        
        const generosSeleccionados = [g1, g2, g3].filter(g => g !== "");

        const nuevaSerie = {
            titulo: document.getElementById('titulo').value,
            generos: generosSeleccionados,
            imagen: imagenNone
        };

        const seriesUsuario = JSON.parse(localStorage.getItem('series_usuario') || "[]");
        seriesUsuario.push(nuevaSerie);
        localStorage.setItem('series_usuario', JSON.stringify(seriesUsuario));

        alert("¡Serie recomendada con éxito!");
        form.reset();
        previewContainer.innerHTML = "";
        window.location.href = 'recomendados.html';
    });
});