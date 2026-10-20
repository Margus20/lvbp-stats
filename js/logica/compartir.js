// ============================================
// BOTONES DE REDES SOCIALES
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
    const url = "\n\n🔗 Ver más: " + CONFIG.urlPagina;
    
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
        const noticia = NOTICIAS.find(n => n.id === 1);
        if (noticia) texto = `📰 *${noticia.titulo}*\n\n${noticia.resumen}`;
    }
    return texto + url;
}

export function compartirEnRed(red, tipo, textoCustom = '') {
    const texto = textoCustom || generarTextoSeccion(tipo);
    const textoCodificado = encodeURIComponent(texto);
    const urlCodificada = encodeURIComponent(CONFIG.urlPagina);
    let urlCompartir = "";
    switch(red) {
        case 'whatsapp': urlCompartir = `https://wa.me/?text=${textoCodificado}`; break;
        case 'telegram': urlCompartir = `https://t.me/share/url?url=${urlCodificada}&text=${textoCodificado}`; break;
        case 'twitter': urlCompartir = `https://twitter.com/intent/tweet?text=${textoCodificado}`; break;
        case 'facebook': urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}`; break;
    }
    if (urlCompartir) window.open(urlCompartir, '_blank', 'width=600,height=400');
}

export function compartirSeccion(tipo, red) { 
    compartirEnRed(red, 'custom', generarTextoSeccion(tipo)); 
}
