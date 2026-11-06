import { RESULTADOS } from '../../datos/resultados.js';
import { getColor, getLogo, getColorTexto } from '../utils.js';

export function renderResultados() {
    const container = document.getElementById("resultados-container");
    const section = document.getElementById("resultados");
    const titulo = section ? section.querySelector(".titulo-seccion") : null;
    if (!container) return;
    container.innerHTML = '';

    if (titulo && RESULTADOS.length > 0) {
        titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> RESULTADOS - ${RESULTADOS[RESULTADOS.length - 1].fecha.toUpperCase()}`;
    }

    RESULTADOS.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
        const estado = r.estado || (r.finalizado ? "finalizado" : "pendiente");

        if (estado === "pospuesto") {
            card.innerHTML = `
                <div class="mitades" style="opacity: 0.7;">
                    <div class="mitad" style="background-color: ${getColor(r.visitante)}"><img src="${getLogo(r.visitante)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.visitante)}">${r.visitante}</div></div>
                    <div class="mitad" style="background-color: ${getColor(r.local)}"><img src="${getLogo(r.local)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.local)}">${r.local}</div></div>
                    <div class="vs-central" style="background: #666; color: #fff; font-size: 0.85rem; padding: 6px 10px; line-height: 1.1;">POS<br>PUESTO</div>
                </div>
                <div class="info-marcador" style="background: #2a2a2a;">
                    <div style="color: #ffd700; font-weight: 700; font-size: 1rem; text-align: center; padding: 10px;">${r.razon || 'Motivo no especificado'}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-align: center; padding-bottom: 8px;">Juego reprogramado</div>
                </div>
                <div class="fecha-juego-res">${r.fecha}</div>`;
        } else if (estado === "suspendido") {
            card.innerHTML = `
                <div class="mitades" style="opacity: 0.85;">
                    <div class="mitad" style="background-color: ${getColor(r.visitante)}"><img src="${getLogo(r.visitante)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.visitante)}">${r.visitante}</div></div>
                    <div class="mitad" style="background-color: ${getColor(r.local)}"><img src="${getLogo(r.local)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.local)}">${r.local}</div></div>
                    <div class="vs-central" style="background: #ff6b00; color: #fff; font-size: 0.85rem; padding: 6px 10px; line-height: 1.1;">SUS<br>PENDIDO</div>
                </div>
                <div class="info-marcador">
                    <div class="marcador"><span class="carreras-visitante">${r.scoreVisitante || '0'}</span><span class="separador-marcador">-</span><span class="carreras-local">${r.scoreLocal || '0'}</span></div>
                    <div class="innings-info"><span class="innings-numero">${r.innings || '0'}</span><span class="innings-label">Innings</span></div>
                </div>
                <div class="fecha-juego-res">${r.fecha}</div>
                <div style="padding: 8px 12px; font-size: 0.75rem; color: #ff9800; background: #1a1a1a; border-top: 1px solid #333; text-align: center; border-radius: 0 0 8px 8px;">
                    Suspendido: ${r.razon || 'Motivo no especificado'}
                    ${r.lanzadoresProbables ? `<br>Reanudacion: ${r.lanzadoresProbables}` : ''}
                </div>`;
        } else {
            const pitchersHTML = (r.pitcherGanador || r.pitcherPerdedor || r.pitcherSalvador) ? `
                <div style="padding: 8px 12px; font-size: 0.75rem; color: #cccccc; background: #1a1a1a; border-top: 1px solid #333; text-align: center; border-radius: 0 0 8px 8px;">
                    ${r.pitcherGanador ? `<span style="color: #4ade80; font-weight: bold;">G: ${r.pitcherGanador}</span>` : ''}
                    ${r.pitcherGanador && r.pitcherPerdedor ? ' &nbsp;|&nbsp; ' : ''}
                    ${r.pitcherPerdedor ? `<span style="color: #f87171; font-weight: bold;">P: ${r.pitcherPerdedor}</span>` : ''}
                    ${r.pitcherSalvador ? ` &nbsp;|&nbsp; <span style="color: #60a5fa; font-weight: bold;">S: ${r.pitcherSalvador}</span>` : ''}
                </div>` : '';

            card.innerHTML = `
                <div class="mitades">
                    <div class="mitad" style="background-color: ${getColor(r.visitante)}"><img src="${getLogo(r.visitante)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.visitante)}">${r.visitante}</div></div>
                    <div class="mitad" style="background-color: ${getColor(r.local)}"><img src="${getLogo(r.local)}" class="logo-resultado"><div class="nombre-equipo-res" style="color: ${getColorTexto(r.local)}">${r.local}</div></div>
                    <div class="vs-central">VS</div>
                </div>
                <div class="info-marcador">
                    <div class="marcador"><span class="carreras-visitante">${r.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${r.scoreLocal}</span></div>
                    <div class="innings-info"><span class="innings-numero">${r.innings}</span><span class="innings-label">Innings</span></div>
                </div>
                <div class="fecha-juego-res">${r.fecha}</div>
                ${pitchersHTML}`;
        }
        container.appendChild(card);
    });
}
