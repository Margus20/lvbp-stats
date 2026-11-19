// ============================================
// ORQUESTADOR ESPECÍFICO PARA LA SERIE DE LAS AMÉRICAS
// ============================================

import { 
    renderNoticias, 
    renderResultados, 
    renderCalendario, 
    renderLideres, 
    renderPublicidad,
    renderGruposSerieAmericas // 🆕 NUEVO: Importamos la función de los grupos
} from './render/index.js';

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
    
    document.getElementById("articulo-contenido").innerHTML = `
        <div class="articulo-imagen-principal" style="margin-bottom: 25px; border-radius: 12px; overflow: hidden;">
            <img src="${noticia.imagen}" alt="${noticia.titulo}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; display: block;">
        </div>
        <h1 class="articulo-titulo">${noticia.titulo}</h1>
        <p class="articulo-fecha">${noticia.fecha} | LVBP al Día</p>
        <div class="articulo-texto">${noticia.contenido}</div>
    `;
    
    document.getElementById("articulo-completo").style.display = "block";
    document.getElementById("articulo-completo").scrollIntoView({ behavior: "smooth" });
};

window.cerrarArticulo = function() {
    document.getElementById("articulo-completo").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// ============================================
// FUNCIÓN DE INICIALIZACIÓN PRINCIPAL
// ============================================
function inicializarSerieAmericas() {
    // 🆕 Cambiamos el texto del badge del header para esta página
    const badgeTitulo = document.getElementById('faseTitulo');
    if (badgeTitulo) {
        badgeTitulo.textContent = "SERIE DE LAS AMÉRICAS";
    }
    
    // 1. Menú hamburguesa
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("navMenu").classList.toggle("activo");
        });
    }
    
    // 2. Renderizar todas las secciones
    try {
        renderGruposSerieAmericas(); // 🎯 Dibuja las dos tablas de grupos
        renderNoticias();
        renderResultados();
        renderCalendario();
        renderLideres();
        renderPublicidad();
    } catch (error) {
        console.error("Error al renderizar secciones:", error);
    }
    
    // 3. Botones de compartir
    try {
        renderizarBotonesCompartir();
    } catch (error) {
        console.error("Error en botones compartir:", error);
    }

    // 4. Crear el botón flotante de navegación
    try {
        if (!document.querySelector('.boton-flotante-nav')) {
            const contenedor = document.createElement('div');
            contenedor.className = 'boton-flotante-nav';
            
            const menu = document.createElement('div');
            menu.className = 'menu-flotante';
            menu.innerHTML = `
                <div class="menu-flotante-item" data-target="noticias"><i class="fas fa-newspaper"></i> <span>Noticias</span></div>
                <div class="menu-flotante-item" data-target="grupos-serie-americas"><i class="fas fa-globe-americas"></i> <span>Grupos</span></div>
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
            
            boton.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                toggleMenu(); 
            });
            
            menu.querySelectorAll('.menu-flotante-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navegarASeccion(item.getAttribute('data-target'));
                });
            });
            
            document.addEventListener('click', (e) => {
                if (menuAbierto && !contenedor.contains(e.target)) {
                    toggleMenu();
                }
            });
        }
    } catch (error) {
        console.error("Error creando botón flotante:", error);
    }
}

// ============================================
// EJECUCIÓN GARANTIZADA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", inicializarSerieAmericas);
} else {
    inicializarSerieAmericas();
}
