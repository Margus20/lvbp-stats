// ============================================
// LVBP AL DÍA - CÓDIGO PRINCIPAL
// ============================================
// NO MODIFICAR ESTE ARCHIVO
// Los datos se editan en data.js
// ============================================

let comentarios = [];

// Funciones de cálculo
function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    const pct = (jg / (jg + jp));
    return "." + Math.round(pct * 1000).toString().padStart(3, '0');
}

function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

// Función para obtener equipo sin confundir nombres
function getEquipo(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    
    // Primero busca coincidencia exacta por nombre completo o nombre corto
    let equipo = DATOS.equipos.find(eq => 
        eq.nombre.toLowerCase() === nombreLower ||
        eq.nombreCorto.toLowerCase() === nombreLower
    );
    
    // Si no encuentra, busca por inclusión del nombre corto
    if (!equipo) {
        equipo = DATOS.equipos.find(eq => 
            nombreLower.includes(eq.nombreCorto.toLowerCase()) ||
            eq.nombreCorto.toLowerCase().includes(nombreLower.split(' ')[0])
        );
    }
    
    return equipo;
}

function getLogo(nombre) {
    const eq = getEquipo(nombre);
    return eq ? eq.logo : '';
}

function getColor(nombre) {
    const eq = getEquipo(nombre);
    return eq ? eq.color : '#cccccc';
}

function getColorTexto(nombre) {
    const eq = getEquipo(nombre);
    return eq ? eq.colorTexto : '#ffffff';
}

// Renderizar posiciones
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
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="equipo-con-logo">
                <img src="${equipo.logo}" alt="${equipo.nombre}" class="logo-small">
                <span>${equipo.nombreCorto}</span>
            </td>
            <td>${pos.jj}</td>
            <td>${pos.jg}</td>
            <td>${pos.jp}</td>
            <td>${pct}</td>
            <td>${dif}</td>
            <td>${pos.racha}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar noticias
function renderNoticias() {
    const container = document.getElementById("noticias-container");
    if (!container) return;
    
    container.innerHTML = '';
    
    DATOS.noticias.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.style.backgroundImage = `url('${n.imagen}')`;
        card.onclick = () => abrirArticulo(n.id);
        card.innerHTML = `
            <div class="noticia-contenido">
                <span class="noticia-tag">${n.tag}</span>
                <h3>${n.titulo}</h3>
                <p class="fecha">${n.fecha}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Abrir artículo
function abrirArticulo(id) {
    const noticia = DATOS.noticias.find(n => n.id === id);
    if (!noticia) return;
    
    const articuloSeccion = document.getElementById("articulo-completo");
    const articuloContenido = document.getElementById("articulo-contenido");
    
    articuloContenido.innerHTML = `
        <h1 class="articulo-titulo">${noticia.titulo}</h1>
        <p class="articulo-fecha">${noticia.fecha} | LVBP al Día</p>
        <div class="articulo-texto">${noticia.contenido}</div>
    `;
    
    articuloSeccion.style.display = "block";
    articuloSeccion.scrollIntoView({ behavior: "smooth" });
    
    actualizarBotonesCompartir(noticia);
    renderizarComentarios();
}

function cerrarArticulo() {
    const articuloSeccion = document.getElementById("articulo-completo");
    articuloSeccion.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarBotonesCompartir(noticia) {
    const url = window.location.href;
    const texto = `${noticia.titulo} - LVBP al Día`;
    
    document.getElementById("compartir-whatsapp").href = `https://wa.me/?text=${encodeURIComponent(texto + ' ' + url)}`;
    document.getElementById("compartir-telegram").href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`;
    document.getElementById("compartir-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById("compartir-twitter").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`;
}

function renderizarComentarios() {
    const container = document.getElementById("lista-comentarios");
    if (!container) return;
    
    container.innerHTML = '';
    
    if (comentarios.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Sé el primero en comentar</p>';
        return;
    }
    
    comentarios.forEach(c => {
        const div = document.createElement("div");
        div.className = "comentario-item";
        div.innerHTML = `
            <div class="comentario-autor">${c.autor}</div>
            <div class="comentario-texto">${c.texto}</div>
            <div class="comentario-fecha">${c.fecha}</div>
        `;
        container.appendChild(div);
    });
}

// Renderizar resultados (Visitante IZQUIERDA, Local DERECHA)
function renderResultados() {
    const container = document.getElementById("resultados-container");
    if (!container) return;
    
    container.innerHTML = '';
    
    DATOS.resultados.forEach(r => {
        const logoLocal = getLogo(r.local);
        const logoVisitante = getLogo(r.visitante);
        const colorLocal = getColor(r.local);
        const colorVisitante = getColor(r.visitante);
        const textoLocal = getColorTexto(r.local);
        const textoVisitante = getColorTexto(r.visitante);
        
        const card = document.createElement("div");
        card.className = "resultado-card";
        card.innerHTML = `
            <div class="mitades">
                <div class="mitad" style="background-color: ${colorVisitante};">
                    <img src="${logoVisitante}" alt="${r.visitante}" class="logo-resultado">
                    <div class="nombre-equipo-res" style="color: ${textoVisitante};">${r.visitante}</div>
                </div>
                <div class="mitad" style="background-color: ${colorLocal};">
                    <img src="${logoLocal}" alt="${r.local}" class="logo-resultado">
                    <div class="nombre-equipo-res" style="color: ${textoLocal};">${r.local}</div>
                </div>
                <div class="vs-central">VS</div>
            </div>
            <div class="info-marcador">
                <div class="marcador">
                    <span class="carreras-visitante">${r.scoreVisitante}</span>
                    <span class="separador-marcador">-</span>
                    <span class="carreras-local">${r.scoreLocal}</span>
                </div>
                <div class="innings-info">
                    <span class="innings-numero">${r.innings}</span>
                    <span class="innings-label">Innings</span>
                </div>
            </div>
            <div class="fecha-juego-res">${r.fecha}</div>
        `;
        container.appendChild(card);
    });
}

// Renderizar calendario (Visitante IZQUIERDA, Local DERECHA)
// Con soporte para juegos EN VIVO
function renderCalendario() {
    const container = document.getElementById("calendario-container");
    if (!container) return;
    
    container.innerHTML = '';
    
    DATOS.calendario.forEach(j => {
        const logoLocal = getLogo(j.local);
        const logoVisitante = getLogo(j.visitante);
        const colorLocal = getColor(j.local);
        const colorVisitante = getColor(j.visitante);
        const textoLocal = getColorTexto(j.local);
        const textoVisitante = getColorTexto(j.visitante);
        
        const card = document.createElement("div");
        card.className = "juego-card";
        
        // Si el juego está en vivo, agregar clase especial
        if (j.enVivo) {
            card.classList.add("en-vivo");
        }
        
        // Determinar qué mostrar en la barra inferior
        let infoInferior = '';
        if (j.enVivo && j.scoreLocal !== null) {
            // Mostrar marcador en vivo
            infoInferior = `
                <div class="info-juego-cal en-vivo-info">
                    <div class="marcador-vivo">
                        <span class="carreras-visitante">${j.scoreVisitante}</span>
                        <span class="separador-marcador">-</span>
                        <span class="carreras-local">${j.scoreLocal}</span>
                    </div>
                    <div class="inning-info">
                        <span class="en-vivo-badge">🔴 EN VIVO</span>
                        <span class="inning-numero">Inning ${j.inning}</span>
                    </div>
                </div>
            `;
        } else {
            // Mostrar hora y transmisión (juego por comenzar)
            infoInferior = `
                <div class="info-juego-cal">
                    <div class="hora-cal">🕐 ${j.hora}</div>
                    <div class="transmision-cal">${j.transmision}</div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="mitades-cal">
                <div class="mitad-cal" style="background-color: ${colorVisitante};">
                    <img src="${logoVisitante}" alt="${j.visitante}" class="logo-calendario">
                    <div class="nombre-equipo-cal" style="color: ${textoVisitante};">${j.visitante}</div>
                </div>
                <div class="mitad-cal" style="background-color: ${colorLocal};">
                    <img src="${logoLocal}" alt="${j.local}" class="logo-calendario">
                    <div class="nombre-equipo-cal" style="color: ${textoLocal};">${j.local}</div>
                </div>
                <div class="vs-central-cal">VS</div>
            </div>
            ${infoInferior}
        `;
        container.appendChild(card);
    });
}

// Renderizar líderes
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

// Renderizar publicidad
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

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");
    
    menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("activo");
    });
    
    const formulario = document.getElementById("formulario-comentario");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();
            const autor = formulario.querySelector(".input-comentario").value;
            const texto = formulario.querySelector(".textarea-comentario").value;
            const fecha = new Date().toLocaleString("es-VE");
            
            comentarios.push({ autor, texto, fecha });
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
