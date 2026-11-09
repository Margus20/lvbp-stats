// ============================================
// ORQUESTADOR ESPECÍFICO PARA LA SERIE DEL COMODÍN
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
// 🆕 FUNCIÓN PERSONALIZADA: SOLO 5TO Y 6TO LUGAR
// ============================================
function renderPosicionesComodin() {
    const tbody = document.getElementById("comodin-body");
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Tomamos solo los índices 4 y 5 (que son el 5to y 6to lugar)
    const equiposComodin = POSICIONES.slice(4, 6);
    const lider = POSICIONES[0];

    equiposComodin.forEach((pos) => {
        const equipo = getEquipo(pos.nombre);
        if (!equipo) return;
        const pct = pos.pct || '.000';
        const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
        
        const tr = document.createElement("tr");
        tr.className = equipo.claseFila;
        
        // Calculamos la posición real (índice + 1)
        const numeroPosicion = POSICIONES.indexOf(pos) + 1; 
        let posClase = 'pos-comodin'; // Siempre se pintará de amarillo (zona comodín)

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
function inicializarComodin() {
    // 🆕 Cambiamos el texto del badge del header para esta página
    const badgeTitulo = document.getElementById('faseTitulo');
    if (badgeTitulo) {
        badgeTitulo.textContent = "SERIE DEL COMODÍN";
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
        renderPosicionesComodin(); // 🎯 Usamos la función personalizada
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
}

// ============================================
// EJECUCIÓN GARANTIZADA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", inicializarComodin);
} else {
    inicializarComodin();
}
