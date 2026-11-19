// ============================================
// RENDER: GRUPOS DE LA SERIE DE LAS AMÉRICAS
// ============================================
// Dibuja DOS tablas (Grupo A y Grupo B) a partir de los
// datos oficiales del sorteo. Recalcula PCT y DIF solos.

import { GRUPO_A, GRUPO_B } from '../../datos/grupos-serie-americas.js';
import { calcularDIF } from '../utils.js';

// Función auxiliar: dibuja un grupo en su tbody
function dibujarGrupo(equipos, tbodyId, colorEncabezado) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';

    // El líder del grupo es el primero (índice 0) para calcular DIF
    const lider = equipos[0];

    equipos.forEach((eq) => {
        // PCT: guion si no hay juegos, calculado si ya jugaron
        const pct = (eq.jj === 0) ? '-' : calcularPCT(eq.jg, eq.jp);
        // DIF: guion si no hay juegos o es el líder
        const dif = (eq.jj === 0) ? '-' : calcularDIF(eq.jg, eq.jp, lider.jg, lider.jp);

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><span class="pos-badge">${eq.pos}</span></td>
            <td class="pais-con-bandera">
                <span class="bandera-emoji">${eq.bandera}</span>
                <span class="nombre-pais">${eq.pais}</span>
            </td>
            <td><span class="org-tag">${eq.org}</span></td>
            <td class="nota-celda">${eq.nota ? `<span class="nota-tag">${eq.nota}</span>` : '-'}</td>
            <td>${eq.jj}</td>
            <td>${eq.jg}</td>
            <td>${eq.jp}</td>
            <td>${pct}</td>
            <td>${dif}</td>
            <td>${eq.racha || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Función auxiliar: calcula el porcentaje (igual que la liga)
function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return '.000';
    return '.' + Math.round((jg / (jg + jp)) * 1000).toString().padStart(3, '0');
}

// Función principal que exporta el módulo
export function renderGruposSerieAmericas() {
    dibujarGrupo(GRUPO_A, 'grupo-a-body', '#d32f2f');
    dibujarGrupo(GRUPO_B, 'grupo-b-body', '#f9a825');
}
