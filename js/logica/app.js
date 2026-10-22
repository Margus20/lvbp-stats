// ============================================
// ORQUESTADOR PRINCIPAL (app.js)
// Versión final corregida para carga dinámica de componentes
// ============================================

import { 
    renderPosiciones, 
    renderNoticias, 
    renderResultados, 
    renderCalendario, 
    renderLideres, 
    renderPublicidad 
} from './render.js';

import { compartirEnRed, compartirSeccion } from './compartir.js';
import { NOTICIAS } from '../datos/noticias.js';

// ============================================
// EXPOSICIÓN GLOBAL PARA EL HTML
// ============================================
window.compartirEnRed = compartirEnRed;
window.compartirSeccion = compartirSeccion;

// ============================================
// MANEJO DE COMENTARIOS Y ARTÍCULOS
// ============================================
let comentarios = [];

window.abrirArticulo = function(id) {
    const noticia = NOTICIAS.find(n => n.id === id);
    if (!noticia) return;
    document.getElementById("articulo-contenido").innerHTML = `<h1 class="articulo-titulo">${noticia.titulo}</h1><p class="articulo-fecha">${noticia.fecha} | LVBP al Día</p><div class="articulo-texto">${noticia.contenido}</div>`;
    document.getElementById("articulo-completo").style.display = "block";
    document.getElementById("articulo-completo").scrollIntoView({ behavior: "smooth" });
    renderizarComentarios();
};

window.cerrarArticulo = function() {
    document.getElementById("articulo-completo").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

function renderizarComentarios() {
    const container = document.getElementById("lista-comentarios");
    if (!container) return;
    container.innerHTML = comentarios.length === 0 ? '<p style="color: #999; text-align: center; padding: 20px;">Sé el primero en comentar</p>' : '';
    comentarios.forEach(c => {
        const div = document.createElement("div");
        div.className = "comentario-item";
        div.innerHTML = `<div class="comentario-autor">${c.autor}</div><div class="comentario-texto">${c.texto}</div><div class="comentario-fecha">${c.fecha}</div>`;
        container.appendChild(div);
    });
}

// ============================================
// FUNCIÓN DE INICIALIZACIÓN
// ============================================
function inicializarApp() {
    // 1. Menú hamburguesa
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("navMenu").classList.toggle("activo");
        });
    }
    
    // 2. Formulario de comentarios
    const formulario = document.getElementById("formulario-comentario");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();
            comentarios.push({
                autor: formulario.querySelector(".input-comentario").value,
                texto: formulario.querySelector(".textarea-comentario").value,
                fecha: new Date().toLocaleString("es-VE")
            });
            renderizarComentarios();
            formulario.reset();
        });
    }
    
    // 3. Renderizar todas las secciones de la página
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
    renderPublicidad();
    
    console.log("✅ LVBP al Día cargado correctamente (Estructura Modular)");
}

// ============================================
// EJECUCIÓN INTELIGENTE
// Si el DOM ya está listo, ejecuta inmediatamente. Si no, espera.
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", inicializarApp);
} else {
    inicializarApp();
}
