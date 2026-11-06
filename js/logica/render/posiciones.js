import { POSICIONES, TOTAL_JUEGOS_FASE } from '../../datos/posiciones.js';
import { getEquipo, calcularDIF } from '../utils.js';

export function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    if (!tbody) return;
    const lider = POSICIONES[0];
    tbody.innerHTML = '';

    POSICIONES.forEach((pos, i) => {
        const equipo = getEquipo(pos.nombre);
        if (!equipo) return;
        const pct = pos.pct || '.000';
        const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
        const jr = TOTAL_JUEGOS_FASE - parseInt(pos.jj);

        const tr = document.createElement("tr");
        tr.className = equipo.claseFila;

        let posClase = i < 4 ? 'pos-clasificacion' : (i < 6 ? 'pos-comodin' : 'pos-eliminado');

        tr.innerHTML = `<td><span class="pos-badge ${posClase}">${i + 1}</span></td><td class="equipo-con-logo"><img src="${equipo.logo}" alt="${equipo.nombre}" class="logo-small"><span>${equipo.nombreCorto}</span></td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>${pct}</td><td>${dif}</td><td>${jr}</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
    });
}
