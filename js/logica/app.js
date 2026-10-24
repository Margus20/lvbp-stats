// ============================================
// ORQUESTADOR PRINCIPAL (app.js)
// ============================================
console.log("🟢 app.js: Archivo cargado e iniciado.");

import { 
    renderPosiciones, 
    renderNoticias, 
    renderResultados, 
    renderCalendario, 
    renderLideres, 
    renderPublicidad 
} from './render.js';

console.log("🟢 app.js: Imports de render.js exitosos.");

import { compartirEnRed, compartirSeccion, renderizarBotonesCompartir } from './compartir.js';
import { NOTICIAS } from '../datos/noticias.js';

console.log("🟢 app.js: Todos los imports completados.");

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
// FUNCIÓN DE INICIALIZACIÓN PRINCIPAL
// ============================================
function inicializarTodo() {
    console.log("🚀 Iniciando LVBP al Día...");

    try {
        console.log("🔄 Ejecutando renderPosiciones...");
        renderPosiciones();
        console.log("🔄 Ejecutando renderNoticias...");
        renderNoticias();
        console.log("🔄 Ejecutando renderResultados...");
        renderResultados();
        console.log("🔄 Ejecutando renderCalendario...");
        renderCalendario();
        console.log("🔄 Ejecutando renderLideres...");
        renderLideres();
        console.log("🔄 Ejecutando renderPublicidad...");
        renderPublicidad();
        console.log("✅ Todas las funciones de render ejecutadas sin errores.");
    } catch (error) {
        console.error("❌ ERROR CRÍTICO AL RENDERIZAR:", error);
    }
    
    try {
        renderizarBotonesCompartir();
    } catch (error) {
        console.error("❌ Error en botones compartir:", error);
    }

    try {
        if (!document.querySelector('.boton-flotante-nav')) {
            const contenedor = document.createElement('div');
            contenedor.className = 'boton-flotante-nav';
            const menu = document.createElement('div');
            menu.className = 'menu-flotante';
            menu.innerHTML = `
                <div class="menu-flotante-item" data-target="noticias"><i class="fas fa-newspaper"></i> <span>Noticias</span></div>
                <div class="menu-flotante-item" data-target="posiciones"><i class="fas fa-trophy"></i> <span>Posiciones</span></div>
                <div class="menu-flotante-item" data-target="resultados"><i class="fas fa-baseball-ball"></i> <span>Resultados</span></div>
                <div class="menu-flotante-item" data-target="calendario"><i class="fas fa-calendar-alt"></i> <span>Calendario</span></div>
                <div class="menu-flotante-item" data-target="estadisticas"><i class="fas fa-chart-bar"></i> <span>Estadísticas</span></div>
                <div class="menu-flotante-separador"></div>
                <div class="menu-flotante-item" data-target="inicio"><i class="fas fa-arrow-up"></i> <span>Ir al inicio</span></div>
            `;
            const boton = document.createElement('button');
            boton.className = 'btn-flotante-principal';
            boton.innerHTML = '<i class="fas fa-bars"></i>';
            contenedor.appendChild(menu);
            contenedor.appendChild(boton);
            document.body.appendChild(contenedor);
            
            let menuAbierto = false;
            function toggleMenu() {
                menuAbierto = !menuAbierto;
                boton.innerHTML = menuAbierto ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
                menu.classList.toggle('visible', menuAbierto);
                boton.classList.toggle('activo', menuAbierto);
            }
            function navegarASeccion(targetId) {
                toggleMenu();
                if (targetId === 'inicio') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                const seccion = document.getElementById(targetId);
                if (seccion) {
                    window.scrollTo({ top: seccion.getBoundingClientRect().top + window.pageYOffset - 20, behavior: 'smooth' });
                }
            }
            boton.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
            menu.querySelectorAll('.menu-flotante-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navegarASeccion(item.getAttribute('data-target'));
                });
            });
            document.addEventListener('click', (e) => {
                if (menuAbierto && !contenedor.contains(e.target)) toggleMenu();
            });
        }
    } catch (error) {
        console.error("❌ Error creando botón flotante:", error);
    }
    
    console.log("✅ LVBP al Día cargado correctamente al 100%");
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", inicializarTodo);
} else {
    inicializarTodo();
}
