// ============================================
// ORQUESTADOR PRINCIPAL (app.js)
// ============================================

import { 
    renderPosiciones, 
    renderNoticias, 
    renderResultados, 
    renderCalendario, 
    renderLideres, 
    renderPublicidad 
} from './render.js';

import { compartirEnRed, compartirSeccion, renderizarBotonesCompartir } from './compartir.js';
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
// FUNCIÓN DE INICIALIZACIÓN PRINCIPAL
// ============================================
function inicializarTodo() {
    console.log("🚀 Iniciando LVBP al Día...");

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
    
    // 3. Renderizar todas las secciones
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
    renderPublicidad();
    
    // 4. Inyectar botones de compartir
    renderizarBotonesCompartir();

    // 5. 🆕 CREAR EL BOTÓN FLOTANTE (Garantizado)
    if (!document.querySelector('.boton-flotante-nav')) {
        console.log("✅ Creando botón flotante...");
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
        boton.setAttribute('aria-label', 'Menú de navegación');
        boton.setAttribute('title', 'Navegación rápida');
        
        contenedor.appendChild(menu);
        contenedor.appendChild(boton);
        document.body.appendChild(contenedor);
        
        let menuAbierto = false;
        function toggleMenu() {
            menuAbierto = !menuAbierto;
            if (menuAbierto) {
                menu.classList.add('visible');
                boton.classList.add('activo');
                boton.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menu.classList.remove('visible');
                boton.classList.remove('activo');
                boton.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
        
        function navegarASeccion(targetId) {
            toggleMenu();
            if (targetId === 'inicio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const seccion = document.getElementById(targetId);
            if (seccion) {
                const posicion = seccion.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: posicion - 20, behavior: 'smooth' });
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
    
    console.log("✅ LVBP al Día cargado correctamente al 100%");
}

// ============================================
// EJECUCIÓN GARANTIZADA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", inicializarTodo);
} else {
    inicializarTodo();
}
