import { CALENDARIO } from '../../datos/calendario.js';
import { CANALES } from '../../datos/canales.js';
import { getLogo, getColor, getColorTexto } from '../utils.js';

export function renderCalendario() {
    const container = document.getElementById("calendario-container");
    const section = document.getElementById("calendario");
    const titulo = section ? section.querySelector(".titulo-seccion") : null;
    if (!container) return;
    container.innerHTML = '';

    if (titulo && CALENDARIO.length > 0) {
        const fechasUnicas = [...new Set(CALENDARIO.map(j => j.fecha))];
        const textoFecha = fechasUnicas.length === 1 ? fechasUnicas[0].toUpperCase() : "PRÓXIMOS JUEGOS";
        titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> JORNADA - ${textoFecha}`;
    }

    CALENDARIO.forEach(j => {
        const card = document.createElement("div");
        card.className = "juego-card" + (j.enVivo ? " en-vivo" : "") + (j.finalizado ? " finalizado" : "");
        
        // Etiqueta de Doble Jornada (se activa si pones "dobleJornada": true en los datos)
        const badgeDoble = j.dobleJornada ? `<div style="background: #d32f2f; color: #fff; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-bottom: 5px; display: inline-block; text-align: center; width: 100%;">DOBLE JORNADA - JUEGO ${j.numeroJuego || '1'}</div>` : '';

        let infoInferior = '';
        if (j.finalizado && j.scoreLocal !== "") {
            infoInferior = `<div class="info-juego-cal finalizado-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="finalizado-badge">FINAL</span><span class="inning-numero">${j.innings || 9} Innings</span></div></div>`;
        } else if (j.enVivo && j.scoreLocal !== "") {
            infoInferior = `<div class="info-juego-cal en-vivo-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="en-vivo-badge"> EN VIVO</span><span class="inning-numero">Inning ${j.inning}</span></div></div>`;
        } else {
            const canalesHTML = j.transmision.split('/').map(c => {
                const canal = CANALES.find(cn => cn.nombre.toLowerCase() === c.trim().toLowerCase());
                return canal ? `<img src="${canal.logo}" alt="${c.trim()}" class="logo-canal-cal" title="${c.trim()}">` : `<span class="canal-texto">${c.trim()}</span>`;
            }).join(' <span class="separador-canal">+</span> ');
            infoInferior = `<div class="info-juego-cal"><div class="hora-cal">🕐 ${j.hora}</div><div class="estadio-cal">${j.lugar || 'Estadio por confirmar'}</div><div class="transmision-cal">${canalesHTML}</div></div>`;
        }
        
        card.innerHTML = `
            <div class="mitades-cal">
                ${badgeDoble}
                <div class="mitad-cal" style="background-color: ${getColor(j.visitante)}"><img src="${getLogo(j.visitante)}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${getColorTexto(j.visitante)}">${j.visitante}</div></div>
                <div class="mitad-cal" style="background-color: ${getColor(j.local)}"><img src="${getLogo(j.local)}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${getColorTexto(j.local)}">${j.local}</div></div>
                <div class="vs-central-cal">VS</div>
            </div>${infoInferior}`;
        container.appendChild(card);
    });
}
