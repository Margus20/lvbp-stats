// ============================================
// RENDERIZADO VISUAL
// ============================================

import { POSICIONES } from '../datos/posiciones.js';
import { NOTICIAS } from '../datos/noticias.js';
import { RESULTADOS } from '../datos/resultados.js';
import { CALENDARIO } from '../datos/calendario.js';
import { LIDERES, obtenerMascota } from '../datos/lideres.js';

// ⚠️ IMPORTANTE: Usamos "ppublicidad.js" (con doble P) porque el archivo 
// original "publicidad.js" se corrompió y no se podía editar ni borrar.
// NO ES UN ERROR DE ESCRITURA, ES INTENCIONAL.
import { PUBLICIDAD } from '../datos/ppublicidad.js';

import { CANALES } from '../datos/canales.js';
import { getEquipo, getLogo, getColor, getColorTexto, calcularDIF } from './utils.js';

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
        const tr = document.createElement("tr");
        tr.className = equipo.claseFila;
        tr.innerHTML = `<td>${i + 1}</td><td class="equipo-con-logo"><img src="${equipo.logo}" alt="${equipo.nombre}" class="logo-small"><span>${equipo.nombreCorto}</span></td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>${pct}</td><td>${dif}</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
    });
}

export function renderNoticias() {
    const container = document.getElementById("noticias-container");
    if (!container) return;
    container.innerHTML = '';
    if (NOTICIAS.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No hay noticias publicadas</p>';
        return;
    }
    NOTICIAS.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.style.backgroundImage = `url('${n.imagen}')`;
        card.onclick = () => window.abrirArticulo(n.id);
        card.innerHTML = `<div class="noticia-contenido"><span class="noticia-tag">${n.tag}</span><h3>${n.titulo}</h3><p class="fecha">${n.fecha}</p></div>`;
        container.appendChild(card);
    });
}

export function renderResultados() {
    const container = document.getElementById("resultados-container");
    const section = document.getElementById("resultados");
    const titulo = section ? section.querySelector(".titulo-seccion") : null;
    
    if (!container) return;
    container.innerHTML = '';
    
    if (titulo) {
        if (RESULTADOS.length === 0) {
            titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> SIN RESULTADOS RECIENTES`;
        } else {
            const ultimaFecha = RESULTADOS[RESULTADOS.length - 1].fecha;
            titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> RESULTADOS - ${ultimaFecha.toUpperCase()}`;
        }
    }

    if (RESULTADOS.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Sin resultados recientes</p>';
        return;
    }
    
    RESULTADOS.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
        
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
            ${pitchersHTML}
        `;
        container.appendChild(card);
    });
}

export function renderCalendario() {
    const container = document.getElementById("calendario-container");
    const section = document.getElementById("calendario");
    const titulo = section ? section.querySelector(".titulo-seccion") : null;
    
    if (!container) return;
    container.innerHTML = '';

    if (titulo) {
        if (CALENDARIO.length === 0) {
            titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> SIN JUEGOS PROGRAMADOS`;
        } else {
            const fechasUnicas = [...new Set(CALENDARIO.map(j => j.fecha))];
            const textoFecha = fechasUnicas.length === 1 ? fechasUnicas[0].toUpperCase() : "PRÓXIMOS JUEGOS";
            titulo.innerHTML = `<img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/lvbp.png" class="logo-seccion"> JORNADA - ${textoFecha}`;
        }
    }

    if (CALENDARIO.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Sin juegos programados</p>';
        return;
    }

    CALENDARIO.forEach(j => {
        const logoLocal = getLogo(j.local);
        const logoVisitante = getLogo(j.visitante);
        const colorLocal = getColor(j.local);
        const colorVisitante = getColor(j.visitante);
        const textoLocal = getColorTexto(j.local);
        const textoVisitante = getColorTexto(j.visitante);
        
        const card = document.createElement("div");
        card.className = "juego-card" + (j.enVivo ? " en-vivo" : "") + (j.finalizado ? " finalizado" : "");
        let infoInferior = '';
        
        if (j.finalizado && j.scoreLocal !== null) {
            infoInferior = `<div class="info-juego-cal finalizado-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="finalizado-badge">FINAL</span><span class="inning-numero">${j.innings || 9} Innings</span></div></div>`;
        } else if (j.enVivo && j.scoreLocal !== null) {
            infoInferior = `<div class="info-juego-cal en-vivo-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="en-vivo-badge"> EN VIVO</span><span class="inning-numero">Inning ${j.inning}</span></div></div>`;
        } else {
            const canalesHTML = j.transmision.split('/').map(c => {
                const nombre = c.trim();
                const canal = CANALES.find(cn => cn.nombre.toLowerCase() === nombre.toLowerCase());
                return canal ? `<img src="${canal.logo}" alt="${nombre}" class="logo-canal-cal" title="${nombre}">` : `<span class="canal-texto">${nombre}</span>`;
            }).join(' <span class="separador-canal">+</span> ');
            
            infoInferior = `<div class="info-juego-cal">
                <div class="hora-cal">🕐 ${j.hora}</div>
                <div class="estadio-cal">${j.lugar || 'Estadio por confirmar'}</div>
                <div class="transmision-cal">${canalesHTML}</div>
            </div>`;
        }
        card.innerHTML = `
            <div class="mitades-cal">
                <div class="mitad-cal" style="background-color: ${colorVisitante}"><img src="${logoVisitante}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${textoVisitante}">${j.visitante}</div></div>
                <div class="mitad-cal" style="background-color: ${colorLocal}"><img src="${logoLocal}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${textoLocal}">${j.local}</div></div>
                <div class="vs-central-cal">VS</div>
            </div>${infoInferior}`;
        container.appendChild(card);
    });
}

export function renderLideres() {
    const categoriasAMostrar = {
        'contenedor-jonrones': 'jonrones',
        'contenedor-average': 'average',
        'contenedor-impulsadas': 'impulsadas',
        'contenedor-slugging': 'slugging',
        'contenedor-ops': 'ops',
        'contenedor-hits': 'hits',
        'contenedor-dobles': 'dobles',
        'contenedor-triples': 'triples',
        'contenedor-basesRobadas': 'basesRobadas',
        'contenedor-basesPorBolas': 'basesPorBolas',
        'contenedor-ponchesBateo': 'ponchesBateo',
        'contenedor-efectividad': 'efectividad',
        'contenedor-victorias': 'victorias',
        'contenedor-salvados': 'salvados',
        'contenedor-inningsLanzados': 'inningsLanzados',
        'contenedor-ponches': 'ponchesPitching',
        'contenedor-hold': 'hold',
        'contenedor-whip': 'whip',
        'contenedor-averageContra': 'averageContra'
    };

    for (const [idContenedor, claveCategoria] of Object.entries(categoriasAMostrar)) {
        const contenedor = document.getElementById(idContenedor);
        
        if (!contenedor) {
            console.warn(`No se encontró el contenedor: ${idContenedor}`);
            continue;
        }
        
        const lideres = LIDERES[claveCategoria];
        if (!lideres || lideres.length === 0) {
            contenedor.innerHTML = '<p style="color:#666; font-size:0.8rem; text-align:center;">Sin datos</p>';
            continue;
        }

        contenedor.innerHTML = '';
        lideres.forEach(lider => {
            const rutaMascota = obtenerMascota(lider.equipo);
            
            // 🛠️ CORRECCIÓN AUTOMÁTICA (SANITIZACIÓN):
            // El Bot a veces trae "D. Rodríguez1B (ARA)" o "J. Pérez LF".
            // Esta Expresión Regular busca las posiciones (1B, 2B, 3B, SS, LF, CF, RF, C, DH, P)
            // y las elimina, dejando solo "Nombre (Equipo)" o solo "Nombre".
            let nombreLimpio = lider.nombre
                .replace(/\s*(?:1B|2B|3B|SS|LF|CF|RF|C|DH|P)\s*(?=\(|$)/gi, ' ') // Quita la posición antes del paréntesis o al final
                .replace(/\s+/g, ' ') // Limpia espacios dobles que puedan quedar
                .trim(); // Quita espacios al inicio y final

            const item = document.createElement('div');
            item.className = 'item-lider';
            item.innerHTML = `
                <div class="posicion">#${lider.posicion}</div>
                <img src="${rutaMascota}" alt="Mascota" class="mascota-img" onerror="this.src='mascotas/leo.jpg'">
                <div class="info-jugador">
                    <span class="nombre" title="${nombreLimpio}">${nombreLimpio}</span>
                </div>
                <div class="valor">${lider.valor}</div>
            `;
            contenedor.appendChild(item);
        });
    }
}

export function renderPublicidad() {
    const sidebar = document.getElementById("sidebar-publicidad");
    if (!sidebar) return;
    sidebar.innerHTML = '';
    PUBLICIDAD.forEach(p => {
        const div = document.createElement("div");
        div.className = "espacio-publicidad";
        div.innerHTML = `<img src="${p.imagen}" alt="${p.alt}" class="anuncio-imagen">`;
        sidebar.appendChild(div);
    });
}
