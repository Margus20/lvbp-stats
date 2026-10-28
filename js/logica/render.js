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

// ============================================
// RENDERIZAR NOTICIAS (CON DIAGNÓSTICO COMPLETO)
// ============================================
export function renderNoticias() {
    console.log("🔍 [DIAGNÓSTICO] 1. Iniciando renderNoticias()...");
    
    const heroContainer = document.getElementById("hero-noticia-container");
    const containerSecundarias = document.getElementById("noticias-secundarias-container");
    
    if (!heroContainer || !containerSecundarias) {
        console.error("❌ [DIAGNÓSTICO] ERROR: No se encontraron los contenedores del DOM. Revisa el HTML.");
        return;
    }
    console.log("✅ [DIAGNÓSTICO] 2. Contenedores del DOM encontrados correctamente.");

    // ✅ IMAGEN DE RESPALDO (backup)
    const imagenRespaldo = "/lvbp-stats/img/noticias/lvbp-noticia.jpg";
    console.log("🖼️ [DIAGNÓSTICO] 3. Imagen de respaldo configurada:", imagenRespaldo);
    
    try {
        // Si no hay noticias, mostrar un hero de respaldo
        if (!NOTICIAS || NOTICIAS.length === 0) {
            console.warn("⚠️ [DIAGNÓSTICO] 4. El array NOTICIAS está vacío o no se importó correctamente.");
            heroContainer.innerHTML = `
                <div class="hero-imagen" style="position: relative;">
                    <img src="${imagenRespaldo}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 0;" alt="Respaldo">
                    <div class="hero-overlay" style="position: relative; z-index: 1;"></div>
                    <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua" style="position: relative; z-index: 1; pointer-events: none;">
                    <div class="hero-contenido" style="position: relative; z-index: 1;">
                        <h1 class="hero-titulo">Bienvenido a LVBP al Día</h1>
                        <p class="hero-fecha">Temporada 2026-2027</p>
                    </div>
                </div>`;
            containerSecundarias.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No hay noticias publicadas</p>';
            return;
        }
        
        console.log("✅ [DIAGNÓSTICO] 4. Array NOTICIAS cargado exitosamente con", NOTICIAS.length, "elementos.");
        
        // 1. Encontrar la noticia PRINCIPAL (la grande)
        const noticiaPrincipal = NOTICIAS.find(n => n.esPrincipal) || NOTICIAS[0];
        console.log("🌟 [DIAGNÓSTICO] 5. Noticia principal seleccionada:", noticiaPrincipal.titulo);
        console.log("🔗 [DIAGNÓSTICO] 6. URL de la imagen principal que intentará cargar:", noticiaPrincipal.imagen);
        
        // 2. Renderizar el HERO dinámicamente con <img> para que onerror SÍ funcione
        heroContainer.innerHTML = `
            <div class="hero-imagen" style="position: relative; cursor: pointer;" onclick="window.abrirArticulo(${noticiaPrincipal.id})">
                <img src="${noticiaPrincipal.imagen}" 
                     onerror="console.error('❌ [DIAGNÓSTICO] 7. FALLÓ LA CARGA DE IMAGEN PRINCIPAL. URL:', this.src); this.src='${imagenRespaldo}'; console.log('🔄 [DIAGNÓSTICO] 8. Imagen de respaldo activada.');" 
                     style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 0;" 
                     alt="${noticiaPrincipal.titulo}">
                <div class="hero-overlay" style="position: relative; z-index: 1; pointer-events: none;"></div>
                <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua" style="position: relative; z-index: 1; pointer-events: none;">
                <div class="hero-contenido" style="position: relative; z-index: 1;">
                    <h1 class="hero-titulo">${noticiaPrincipal.titulo}</h1>
                    <p class="hero-fecha">${noticiaPrincipal.fecha}</p>
                </div>
            </div>
        `;
        
        // 3. Renderizar las noticias secundarias
        containerSecundarias.innerHTML = '';
        const noticiasSecundarias = NOTICIAS.filter(n => n.id !== noticiaPrincipal.id).slice(0, 4);
        console.log("📰 [DIAGNÓSTICO] 9. Noticias secundarias a renderizar:", noticiasSecundarias.length);
        
        if (noticiasSecundarias.length === 0) {
            containerSecundarias.innerHTML = '<p style="text-align:center; color:#999; padding:20px; grid-column: 1/-1;">No hay más noticias para mostrar</p>';
        } else {
            noticiasSecundarias.forEach(noticia => {
                const card = document.createElement("div");
                card.className = "noticia-secundaria-card";
                card.onclick = () => window.abrirArticulo(noticia.id);
                
                // ✅ Tarjetas secundarias: onerror con diagnóstico
                card.innerHTML = `
                    <img src="${noticia.imagen}" 
                         alt="${noticia.titulo}" 
                         onerror="console.error('❌ [DIAGNÓSTICO] FALLÓ LA CARGA DE IMAGEN SECUNDARIA. URL:', this.src); this.src='${imagenRespaldo}';"
                         style="pointer-events: none; width: 100%; height: 100%; object-fit: cover;">
                    <div class="noticia-secundaria-overlay" style="pointer-events: none;">
                        <h4>${noticia.titulo}</h4>
                        <div class="fecha">${noticia.fecha}</div>
                    </div>
                `;
                containerSecundarias.appendChild(card);
            });
        }
        console.log("✅ [DIAGNÓSTICO] 10. renderNoticias() completado exitosamente sin errores.");
        
    } catch (error) {
        console.error("💥 [DIAGNÓSTICO] ERROR CRÍTICO en renderNoticias():", error);
    }
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
        
        if (j.finalizado && j.scoreLocal !== "") {
            infoInferior = `<div class="info-juego-cal finalizado-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="finalizado-badge">FINAL</span><span class="inning-numero">${j.innings || 9} Innings</span></div></div>`;
        } else if (j.enVivo && j.scoreLocal !== "") {
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
            let nombreLimpio = lider.nombre
                .replace(/\s*(?:1B|2B|3B|SS|LF|CF|RF|C|DH|P)\s*(?=\(|$)/gi, ' ')
                .replace(/\s+/g, ' ')
                .trim();

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
