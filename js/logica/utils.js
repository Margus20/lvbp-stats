// ============================================
// FUNCIONES AUXILIARES (UTILIDADES)
// ============================================

import { EQUIPOS } from '../datos/equipos.js';

export function getEquipo(nombre) {
    const lower = nombre.toLowerCase().trim();
    if (lower.includes('navegantes') || lower.includes('magallanes')) return EQUIPOS.find(e => e.abrev === 'MAG');
    return EQUIPOS.find(e => e.nombre.toLowerCase() === lower || e.nombreCorto.toLowerCase() === lower || lower.includes(e.nombreCorto.toLowerCase()));
}

export function getLogo(nombre) { 
    const eq = getEquipo(nombre); 
    return eq ? eq.logo : ''; 
}

export function getColor(nombre) { 
    const eq = getEquipo(nombre); 
    return eq ? eq.color : '#cccccc'; 
}

export function getColorTexto(nombre) { 
    const eq = getEquipo(nombre); 
    return eq ? eq.colorTexto : '#ffffff'; 
}

export function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    return "." + Math.round((jg / (jg + jp)) * 1000).toString().padStart(3, '0');
}

export function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}
