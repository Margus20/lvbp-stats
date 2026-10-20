// ============================================
// LVBP AL DÍA - CÓDIGO PRINCIPAL
// ============================================

let comentarios = [];
const URL_PAGINA = window.location.href;

function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    const pct = (jg / (jg + jp));
    return "." + Math.round(pct * 1000).toString().padStart(3, '0');
}

function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

function getEquipo(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    let equipo = DATOS.equipos.find(eq => eq.nombre.toLowerCase() === nombreLower || eq.nombreCorto.toLowerCase() === nombreLower);
    if (!equipo) {
        equipo = DATOS.equipos.find(eq => nombreLower.includes(eq.nombreCorto.toLowerCase()) || eq.nombreCorto.toLowerCase().includes(nombreLower.split(' ')[0]));
    }
    return equipo;
}

function getCanal(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    return DATOS.canales.find(c => c.nombre.toLowerCase() === nombreLower);
}

function renderizarCanales(transmision) {
    if (!transmision) return '';
    const nombres = transmision.split('/').map(n => n.trim());
    const logos = nombres.map(nombre => {
        const canal = getCanal(nombre);
        if (canal) {
            return `<img src="${canal.logo}" alt="${nombre}" class="logo-canal-cal" title="${nombre}">`;
        }
        return `<span class="canal-texto">${nombre}</span>`;
    });
    return logos.join(' <span class="separador-canal">+</span> ');
}

function getLogo(nombre) { const eq = getEquipo(nombre); return eq ? eq.logo : ''; }
function getColor(nombre) { const eq = getEquipo(nombre); return eq ? eq.color : '#cccccc'; }
function getColorTexto(nombre) { const eq = getEquipo(nombre); return eq ? eq.colorTexto : '#ffffff'; }

function generarTextoSeccion(tipo) {
    let texto = "";
    const url = "\n\n🔗 Ver más: " + URL_PAGINA;
    if (tipo === 'posiciones') {
        texto = "🏆 *TABLA DE POSICIONES LVBP* 🏆\n";
        const lider = DATOS.posiciones[0];
        DATOS.posiciones.forEach((pos, i) => {
            const pct = calcularPCT(pos.jg, pos.jp);
            const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
            texto += `${i + 1}. ${pos.nombre} (${pos.jg}-${pos.jp}) ${pct} (DIF: ${dif})\n`;
        });
    } else if (tipo === 'resultados') {
        texto = "⚾ *RESULTADOS DEL DÍA* ⚾\n";
        DATOS.resultados.forEach(r => { texto += `${r.visitante} ${r.scoreVisitante} - ${r.scoreLocal} ${r.local} (Final)\n`; });
    } else if (tipo === 'calendario') {
        texto = "📅 *PRÓXIMOS JUEGOS* 📅\n";
        DATOS.calendario.forEach(j => {
            const estado = j.finalizado ? "✅ FINAL" : (j.enVivo ? "🔴 EN VIVO" : "🕐 Programado");
            const marcador = (j.enVivo || j.finalizado) ? ` (${j.scoreVisitante}-${j.scoreLocal})` : "";
            texto += `${j.visitante} vs ${j.local} - ${j.hora} ${marcador} [${estado}]\n`;
        });
    } else if (tipo === 'noticia') {
        const noticia = DATOS.noticias.find(n => n.id === 1);
        texto = `📰 *${noticia.titulo}*\n\n${noticia.resumen}`;
    }
    return texto + url;
}

function compartirSeccion(tipo, red) { compartirEnRed(red, 'custom', generarTextoSeccion(tipo)); }

function compartirEnRed(red, tipo, textoCustom = '') {
    const texto = textoCustom || generarTextoSeccion(tipo);
    const textoCodificado = encodeURIComponent(texto);
    const urlCodificada = encodeURIComponent(URL_PAGINA);
    let urlCompartir = "";
    switch(red) {
        case 'whatsapp': urlCompartir = `https://wa.me/?text=${textoCodificado}`; break;
        case 'telegram': urlCompartir = `https://t.me/share/url?url=${urlCodificada}&text=${textoCodificado}`; break;
        case 'twitter': urlCompartir = `https://twitter.com/intent/tweet?text=${textoCodificado}`; break;
        case 'facebook': urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}`; break;
    }
    if (urlCompartir) window.open(urlCompartir, '_blank', 'width=600,height=400');
}

function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    if (!tbody) return;
    const lider = DATOS.posiciones[0];
    DATOS.posiciones.forEach((pos, i) => {
        const equipo = getEquipo(pos.nombre);
        if (!equipo) return;
        const pct = calcularPCT(pos.jg, pos.jp);
        const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
        const tr = document.createElement("tr");
        tr.className = equipo.claseFila;
        tr.innerHTML = `<td>${i + 1}</td><td class="equipo-con-logo"><img src="${equipo.logo}" alt="${equipo.nombre}" class="logo-small"><span>${equipo.nombreCorto}</span></td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>${pct}</td><td>${dif}</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
    });
}

function renderNoticias() {
    const container = document.getElementById("noticias-container");
    if (!container) return;
    container.innerHTML = '';
    DATOS.noticias.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.style.backgroundImage = `url('${n.imagen}')`;
        card.onclick = () => abrirArticulo(n.id);
        card.innerHTML = `<div class="noticia-contenido"><span class="noticia-tag">${n.tag}</span><h3>${n.titulo}</h3><p class="fecha">${n.fecha}</p></div>`;
        container.appendChild(card);
    });
}

function abrirArticulo(id) {
    const noticia = DATOS.noticias.find(n => n.id === id);
    if (!noticia) return;
    document.getElementById("articulo-contenido").innerHTML = `<h1 class="articulo-titulo">${noticia.titulo}</h1><p class="articulo-fecha">${noticia.fecha} | LVBP al Día</p><div class="articulo-texto">${noticia.contenido}</div>`;
    document.getElementById("articulo-completo").style.display = "block";
    document.getElementById("articulo-completo").scrollIntoView({ behavior: "smooth" });
    renderizarComentarios();
}

function cerrarArticulo() {
    document.getElementById("articulo-completo").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderizarComentarios() {
    const container = document.getElementById("lista-comentarios");
    if (!container) return;
    container.innerHTML = comentarios.length === 0 ? '<p style="color: #999; text-align: center; padding: 20px;">Sé el primero en comentar</p>' : '';
    comentarios.forEach(c => {
        const div = document.createElement("div");
        div.className = "comentario-item";
        div.innerHTML = `<div class="comentario-autor">${c.autor}</div><div class="comentario-texto">${c.texto}</div><div class="comentario-fecha">${c.fecha}</div>`;
        container.appendChild(div);
    });
}

function renderResultados() {
    const container = document.getElementById("resultados-container");
    if (!container) return;
    container.innerHTML = '';
    DATOS.resultados.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
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
            <div class="fecha-juego-res">${r.fecha}</div>`;
        container.appendChild(card);
    });
}

function renderCalendario() {
    const container = document.getElementById("calendario-container");
    if (!container) return;
    container.innerHTML = '';

    const juegosPorFecha = {};
    DATOS.calendario.forEach(j => {
        if (!juegosPorFecha[j.fecha]) juegosPorFecha[j.fecha] = [];
        juegosPorFecha[j.fecha].push(j);
    });

    Object.keys(juegosPorFecha).sort().forEach(fecha => {
        const fechaTitulo = document.createElement("h3");
        fechaTitulo.style.color = "#d32f2f";
        fechaTitulo.style.margin = "20px 0 15px 0";
        fechaTitulo.style.fontSize = "1.1rem";
        fechaTitulo.style.borderBottom = "2px solid #ffd700";
        fechaTitulo.style.paddingBottom = "5px";
        
        const fechaObj = new Date(fecha);
        const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
        fechaTitulo.textContent = fechaObj.toLocaleDateString('es-ES', opciones);
        container.appendChild(fechaTitulo);

        juegosPorFecha[fecha].forEach(j => {
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
                infoInferior = `<div class="info-juego-cal en-vivo-info"><div class="marcador-vivo"><span class="carreras-visitante">${j.scoreVisitante}</span><span class="separador-marcador">-</span><span class="carreras-local">${j.scoreLocal}</span></div><div class="inning-info"><span class="en-vivo-badge">🔴 EN VIVO</span><span class="inning-numero">Inning ${j.inning}</span></div></div>`;
            } else {
                const canalesHTML = renderizarCanales(j.transmision);
                infoInferior = `<div class="info-juego-cal"><div class="hora-cal">🕐 ${j.hora}</div><div class="transmision-cal">${canalesHTML}</div></div>`;
            }
            card.innerHTML = `
                <div class="mitades-cal">
                    <div class="mitad-cal" style="background-color: ${colorVisitante}"><img src="${logoVisitante}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${textoVisitante}">${j.visitante}</div></div>
                    <div class="mitad-cal" style="background-color: ${colorLocal}"><img src="${logoLocal}" class="logo-calendario"><div class="nombre-equipo-cal" style="color: ${textoLocal}">${j.local}</div></div>
                    <div class="vs-central-cal">VS</div>
                </div>${infoInferior}`;
            container.appendChild(card);
        });
    });
}

function renderLideres() {
    const crearLista = (id, datos) => {
        const ol = document.getElementById(id);
        if (!ol) return;
        ol.innerHTML = '';
        datos.forEach(d => {
            const li = document.createElement("li");
            li.innerHTML = `${d.nombre} <span class="valor">${d.valor}</span>`;
            ol.appendChild(li);
        });
    };
    crearLista("lideres-carreras", DATOS.lideres.carreras);
    crearLista("lideres-average", DATOS.lideres.average);
    crearLista("lideres-hr", DATOS.lideres.hr);
    crearLista("lideres-era", DATOS.lideres.era);
}

function renderPublicidad() {
    const sidebar = document.getElementById("sidebar-publicidad");
    if (!sidebar) return;
    sidebar.innerHTML = '';
    DATOS.publicidad.forEach(p => {
        const div = document.createElement("div");
        div.className = "espacio-publicidad";
        div.innerHTML = `<img src="${p.imagen}" alt="${p.alt}" class="anuncio-imagen">`;
        sidebar.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("menuBtn").addEventListener("click", () => {
        document.getElementById("navMenu").classList.toggle("activo");
    });
    
    const formulario = document.getElementById("formulario-comentario");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();
            comentarios.push({
                autor: formulario.querySelector(".input-comentario").value,
                texto: formulario.querySelector(".textarea-comentario").value,
                fecha: new Date().toLocaleString("es-VE")
            });
            renderizarComentarios();
            formulario.reset();
        });
    }
    
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
    renderPublicidad();
});
