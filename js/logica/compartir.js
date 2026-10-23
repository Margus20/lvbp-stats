// ============================================
// BOTONES DE REDES SOCIALES Y COMPARTIR
// ============================================

import { CONFIG } from '../datos/config.js';
import { POSICIONES } from '../datos/posiciones.js';
import { RESULTADOS } from '../datos/resultados.js';
import { CALENDARIO } from '../datos/calendario.js';
import { NOTICIAS } from '../datos/noticias.js';
import { calcularPCT, calcularDIF } from './utils.js';

function generarTituloResultados() {
    if (RESULTADOS.length === 0) return "SIN RESULTADOS RECIENTES";
    const ultimaFecha = RESULTADOS[RESULTADOS.length - 1].fecha;
    return "RESULTADOS - " + ultimaFecha.toUpperCase();
}

function generarTituloCalendario() {
    if (CALENDARIO.length === 0) return "SIN JUEGOS PROGRAMADOS";
    const fechasUnicas = [...new Set(CALENDARIO.map(j => j.fecha))];
    if (fechasUnicas.length === 1) {
        return "JORNADA - " + fechasUnicas[0].toUpperCase();
    }
    return "PRÓXIMOS JUEGOS";
}

function generarTextoSeccion(tipo) {
    let texto = "";
    const urlBase = CONFIG?.urlPagina || window.location.href;
    const url = "\n\n🔗 Ver más: " + urlBase;
    
    if (tipo === 'posiciones') {
        texto = "🏆 *TABLA DE POSICIONES LVBP* 🏆\n";
        const lider = POSICIONES[0];
        POSICIONES.forEach((pos, i) => {
            const pct = calcularPCT(pos.jg, pos.jp);
            const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
            texto += `${i + 1}. ${pos.nombre} (${pos.jg}-${pos.jp}) ${pct} (DIF: ${dif})\n`;
        });
    } else if (tipo === 'resultados') {
        texto = "⚾ *" + generarTituloResultados() + "*\n";
        RESULTADOS.forEach(r => { texto += `${r.visitante} ${r.scoreVisitante} - ${r.scoreLocal} ${r.local} (Final)\n`; });
    } else if (tipo === 'calendario') {
        texto = "📅 *" + generarTituloCalendario() + "*\n";
        CALENDARIO.forEach(j => {
            const estado = j.finalizado ? "✅ FINAL" : (j.enVivo ? "🔴 EN VIVO" : "🕐 Programado");
            texto += `${j.visitante} vs ${j.local} - ${j.hora} [${estado}]\n`;
        });
    } else if (tipo === 'noticia') {
        const noticia = NOTICIAS.find(n => n.id === 1); // Ajusta el ID si es necesario
        if (noticia) texto = `📰 *${noticia.titulo}*\n\n${noticia.resumen || ''}`;
    } else if (tipo === 'estadisticas') {
        texto = "📊 *LÍDERES ESTADÍSTICOS LVBP*\n\nConsulta los líderes de bateo y pitcheo actualizados en nuestra web.";
    }
    
    return texto + url;
}

export function compartirEnRed(red, tipo, textoCustom = '') {
    const texto = textoCustom || generarTextoSeccion(tipo);
    const textoCodificado = encodeURIComponent(texto);
    const urlCodificada = encodeURIComponent(CONFIG?.urlPagina || window.location.href);
    let urlCompartir = "";
    
    switch(red) {
        case 'whatsapp': urlCompartir = `https://wa.me/?text=${textoCodificado}`; break;
        case 'telegram': urlCompartir = `https://t.me/share/url?url=${urlCodificada}&text=${textoCodificado}`; break;
        case 'twitter': 
        case 'x': urlCompartir = `https://twitter.com/intent/tweet?text=${textoCodificado}&url=${urlCodificada}`; break;
        case 'facebook': urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}`; break;
    }
    
    if (urlCompartir) {
        window.open(urlCompartir, '_blank', 'width=600,height=400,scrollbars=yes');
    }
}

export function compartirSeccion(tipo, red) { 
    compartirEnRed(red, tipo, generarTextoSeccion(tipo)); 
}

// 🆕 FUNCIÓN PARA INYECTAR LOS BOTONES EN EL DOM (Sin usar variables globales)
export function renderizarBotonesCompartir() {
    const secciones = [
        { id: 'noticias', tipo: 'noticia', titulo: 'Últimas Noticias' },
        { id: 'posiciones', tipo: 'posiciones', titulo: 'Tabla de Posiciones' },
        { id: 'resultados', tipo: 'resultados', titulo: 'Resultados Recientes' },
        { id: 'calendario', tipo: 'calendario', titulo: 'Próximos Juegos' },
        { id: 'estadisticas', tipo: 'estadisticas', titulo: 'Líderes Estadísticos' }
    ];

    secciones.forEach(seccion => {
        const contenedor = document.getElementById(seccion.id);
        if (!contenedor) return;

        // Evitar duplicados si ya se renderizó
        if (contenedor.querySelector('.acciones-seccion')) return;

        const accionesDiv = document.createElement('div');
        accionesDiv.className = 'acciones-seccion';
        accionesDiv.innerHTML = `
            <p>Compartir esta sección:</p>
            <div class="botones-compartir-mini">
                <button data-red="whatsapp" data-tipo="${seccion.tipo}" title="Compartir en WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button data-red="telegram" data-tipo="${seccion.tipo}" title="Compartir en Telegram">
                    <i class="fab fa-telegram-plane"></i>
                </button>
                <button data-red="x" data-tipo="${seccion.tipo}" title="Compartir en X">
                    <i class="fab fa-x-twitter"></i>
                </button>
                <button data-red="facebook" data-tipo="${seccion.tipo}" title="Compartir en Facebook">
                    <i class="fab fa-facebook-f"></i>
                </button>
            </div>
        `;
        
        contenedor.appendChild(accionesDiv);

        // Agregar event listeners a los botones creados
        const botones = accionesDiv.querySelectorAll('button');
        botones.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const red = btn.getAttribute('data-red');
                const tipo = btn.getAttribute('data-tipo');
                compartirSeccion(tipo, red);
            });
        });
    });
}
