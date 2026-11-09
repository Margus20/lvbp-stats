// ============================================
// ORQUESTADOR ESPECÍFICO PARA EL ROUND ROBIN
// ============================================

import { FASE_ACTUAL } from '../datos/fase-actual.js';
import { POSICIONES, TOTAL_JUEGOS_FASE } from '../datos/posiciones.js';
import { NOTICIAS } from '../datos/noticias.js';

import { 
    renderNoticias, 
    renderResultados, 
    renderCalendario, 
    renderLideres, 
    renderPublicidad 
} from './render/index.js';

import { compartirEnRed, compartirSeccion, renderizarBotonesCompartir } from './compartir.js';
import { getEquipo, calcularDIF } from './utils.js';

// ============================================
// EXPOSICIÓN GLOBAL PARA EL HTML
// ============================================
window.compartirEnRed = compartirEnRed;
window.compartirSeccion = compartirSeccion;

// ============================================
// 🆕 FUNCIÓN PERSONALIZADA: SOLO TOP 5 (ROUND ROBIN)
// ============================================
function renderPosicionesRoundRobin() {
    const tbody = document.getElementById("round-robin-body");
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // 🎯 Tomamos los primeros 5 índices (del 0 al 4)
    const equiposRoundRobin = POSICIONES.slice(0, 5);
    const lider = POSICIONES[0];

    equiposRoundRobin.forEach((pos) => {
        const equipo = getEquipo(pos.nombre);
        if (!equipo) return;
        const pct = pos.pct || '.000';
        const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
        
        const tr = document.createElement("tr");
        tr.className = equipo.claseFila;
        
        // Calculamos la posición real
        const numeroPosicion = POSICIONES.indexOf(pos) + 1; 
        let posClase = 'pos-clasificacion'; // Se pintará de verde (zona alta)

        tr.innerHTML = `<td><span class="pos-badge ${posClase}">${numeroPosicion}</span></td><td class="equipo-con-logo"><img src="${equipo.logo}" alt="${equipo.nombre}" class="logo-small"><span>${equipo.nombreCorto}</span></td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>${pct}</td><td>${dif}</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
    });
}

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
function inicializarRoundRobin() {
    // 🆕 Cambiamos el texto del badge del header para esta página
    const badgeTitulo = document.getElementById('faseTitulo');
    if (badgeTitulo) {
        badgeTitulo.textContent = "ROUND ROBIN";
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
        renderPosicionesRoundRobin(); // 🎯 Usamos la función personalizada (Top 5)
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
                <div class="menu-flotante-item" data-target="posiciones-rr"><i class="fas fa-trophy"></i> <span>Top 5</span></div>
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
    document.addEventListener("DOMContentLoaded", inicializarRoundRobin);
} else {
    inicializarRoundRobin();
}
