// ============================================
// RENDERIZADO VISUAL
// ============================================

let comentarios = [];

function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    if (!tbody) return;
    const lider = POSICIONES[0];
    tbody.innerHTML = '';
    POSICIONES.forEach((pos, i) => {
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
    if (NOTICIAS.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No hay noticias publicadas</p>';
        return;
    }
    NOTICIAS.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.style.backgroundImage = `url('${n.imagen}')`;
        card.onclick = () => abrirArticulo(n.id);
        card.innerHTML = `<div class="noticia-contenido"><span class="noticia-tag">${n.tag}</span><h3>${n.titulo}</h3><p class="fecha">${n.fecha}</p></div>`;
        container.appendChild(card);
    });
}

function abrirArticulo(id) {
    const noticia = NOTICIAS.find(n => n.id === id);
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
    
    if (RESULTADOS.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Sin resultados recientes</p>';
        return;
    }
    
    const titulo = document.createElement("h3");
    titulo.className = "titulo-seccion";
    titulo.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> ${generarTituloResultados()}`;
    container.appendChild(titulo);

    RESULTADOS.forEach(r => {
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

    if (CALENDARIO.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Sin juegos programados</p>';
        return;
    }

    const tituloJornada = document.createElement("h3");
    tituloJornada.className = "titulo-seccion";
    tituloJornada.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> ${generarTituloCalendario()}`;
    container.appendChild(tituloJornada);

    const juegosPorFecha = {};
    CALENDARIO.forEach(j => {
        if (!juegosPorFecha[j.fecha]) juegosPorFecha[j.fecha] = [];
        juegosPorFecha[j.fecha].push(j);
    });

    Object.keys(juegosPorFecha).sort().forEach(fecha => {
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
    crearLista("lideres-carreras", LIDERES.carreras);
    crearLista("lideres-average", LIDERES.average);
    crearLista("lideres-hr", LIDERES.hr);
    crearLista("lideres-era", LIDERES.era);
}

function renderPublicidad() {
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
