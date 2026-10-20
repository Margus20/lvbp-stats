// ============================================
// LVBP AL DÍA - APP UNIFICADA
// ============================================
// Este archivo es el cerebro de la página.
// Aquí están los datos y la lógica.
// Para actualizar la página, solo edita las secciones de datos.

// ===== CONFIGURACIÓN =====
const CONFIG = {
    logoLVBP: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
    urlPagina: window.location.href,
    repositorio: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/"
};

// ===== EQUIPOS =====
const EQUIPOS = [
    { nombre: "Caribes de Anzoátegui", nombreCorto: "Caribes", abrev: "ANZ", logo: CONFIG.repositorio + "caribes.png", claseFila: "fila-caribes", color: "#F2F2F2", colorTexto: "#2c2c2c" },
    { nombre: "Tigres de Aragua", nombreCorto: "Tigres", abrev: "ARA", logo: CONFIG.repositorio + "tigres.png", claseFila: "fila-tigres", color: "#042959", colorTexto: "#ffffff" },
    { nombre: "Cardenales de Lara", nombreCorto: "Cardenales", abrev: "LAR", logo: CONFIG.repositorio + "cardenales.png", claseFila: "fila-cardenales", color: "#D90D1E", colorTexto: "#ffffff" },
    { nombre: "Bravos de Margarita", nombreCorto: "Bravos", abrev: "MAR", logo: CONFIG.repositorio + "bravos.png", claseFila: "fila-bravos", color: "#56A6A6", colorTexto: "#ffffff" },
    { nombre: "Águilas del Zulia", nombreCorto: "Águilas", abrev: "ZUL", logo: CONFIG.repositorio + "aguilas.png", claseFila: "fila-aguilas", color: "#F24607", colorTexto: "#ffffff" },
    { nombre: "Tiburones de La Guaira", nombreCorto: "Tiburones", abrev: "LGU", logo: CONFIG.repositorio + "tiburones.png", claseFila: "fila-tiburones", color: "#2104D9", colorTexto: "#ffffff" },
    { nombre: "Leones del Caracas", nombreCorto: "Leones", abrev: "CAR", logo: CONFIG.repositorio + "leones.png", claseFila: "fila-leones", color: "#082040", colorTexto: "#ffffff" },
    { nombre: "Navegantes del Magallanes", nombreCorto: "Magallanes", abrev: "MAG", logo: CONFIG.repositorio + "magallanes.png", claseFila: "fila-magallanes", color: "#5BA9D9", colorTexto: "#ffffff" }
];

// ===== DATOS ACTUALES (EDITA ESTO CADA DÍA) =====
const POSICIONES = [
    { nombre: "Tigres de Aragua", jj: 6, jg: 5, jp: 1, racha: "G4" },
    { nombre: "Bravos de Margarita", jj: 5, jg: 4, jp: 1, racha: "G4" },
    { nombre: "Caribes de Anzoátegui", jj: 6, jg: 4, jp: 2, racha: "P1" },
    { nombre: "Cardenales de Lara", jj: 6, jg: 4, jp: 2, racha: "P1" },
    { nombre: "Águilas del Zulia", jj: 6, jg: 2, jp: 4, racha: "P3" },
    { nombre: "Leones del Caracas", jj: 6, jg: 2, jp: 4, racha: "G1" },
    { nombre: "Tiburones de La Guaira", jj: 6, jg: 2, jp: 4, racha: "P4" },
    { nombre: "Navegantes del Magallanes", jj: 7, jg: 1, jp: 6, racha: "G1" }
];

const RESULTADOS = [
    { local: "Cardenales", scoreLocal: 7, visitante: "Magallanes", scoreVisitante: 11, fecha: "19 Oct 2026", innings: 9 }
];

const CALENDARIO = [
    { local: "Tiburones", visitante: "Leones", hora: "7:00 PM", transmision: "IVC / TVES", lugar: "Estadio Universitario", fecha: "20 Oct 2026", enVivo: false, finalizado: false },
    { local: "Bravos", visitante: "Caribes", hora: "7:00 PM", transmision: "BYM Sport", lugar: "Estadio Nueva Esparta", fecha: "20 Oct 2026", enVivo: false, finalizado: false },
    { local: "Águilas", visitante: "Tigres", hora: "7:00 PM", transmision: "Baseball", lugar: "Estadio Luis Aparicio", fecha: "20 Oct 2026", enVivo: false, finalizado: false }
];

const NOTICIAS = [
    {
        id: 1,
        titulo: "Magallanes derrota a Cardenales 11-7",
        resumen: "Los navegantes consiguieron su primera victoria al vencer 11-7 a los cardenales.",
        fecha: "19 Oct 2026",
        tag: "RESULTADOS",
        imagen: CONFIG.logoLVBP,
        contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria al derrotar 11-7 a Cardenales de Lara.</p>"
    }
];

const PUBLICIDAD = [
    { imagen: "https://i.postimg.cc/Ls63NHxv/1000419154.jpg", alt: "Publicidad" }
];

const LIDERES = {
    carreras: [{ nombre: "Por definir", valor: 0 }],
    average: [{ nombre: "Por definir", valor: ".000" }],
    hr: [{ nombre: "Por definir", valor: 0 }],
    era: [{ nombre: "Por definir", valor: "0.00" }]
};

// ===== FUNCIONES AUXILIARES =====
let comentarios = [];

function getEquipo(nombre) {
    const lower = nombre.toLowerCase();
    if (lower.includes('navegantes') || lower.includes('magallanes')) return EQUIPOS.find(e => e.abrev === 'MAG');
    return EQUIPOS.find(e => e.nombre.toLowerCase() === lower || e.nombreCorto.toLowerCase() === lower);
}

function getLogo(nombre) { const eq = getEquipo(nombre); return eq ? eq.logo : ''; }
function getColor(nombre) { const eq = getEquipo(nombre); return eq ? eq.color : '#ccc'; }
function getColorTexto(nombre) { const eq = getEquipo(nombre); return eq ? eq.colorTexto : '#fff'; }

function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    return "." + Math.round((jg / (jg + jp)) * 1000).toString().padStart(3, '0');
}

function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

// ===== RENDERIZADO =====
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    if (!tbody) return;
    tbody.innerHTML = '';
    const lider = POSICIONES[0];
    POSICIONES.forEach((pos, i) => {
        const eq = getEquipo(pos.nombre);
        if (!eq) return;
        const pct = calcularPCT(pos.jg, pos.jp);
        const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
        const tr = document.createElement("tr");
        tr.className = eq.claseFila;
        tr.innerHTML = `<td>${i+1}</td><td class="equipo-con-logo"><img src="${eq.logo}" class="logo-small" alt="${eq.nombre}"><span>${eq.nombreCorto}</span></td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>${pct}</td><td>${dif}</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
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
    
    const ultimaFecha = RESULTADOS[RESULTADOS.length - 1].fecha;
    const titulo = document.createElement("h2");
    titulo.className = "titulo-seccion";
    titulo.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> RESULTADOS - ${ultimaFecha.toUpperCase()}`;
    container.appendChild(titulo);

    RESULTADOS.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
        card.innerHTML = `
            <div class="mitades">
                <div class="mitad" style="background:${getColor(r.visitante)}"><img src="${getLogo(r.visitante)}" class="logo-resultado"><div class="nombre-equipo-res" style="color:${getColorTexto(r.visitante)}">${r.visitante}</div></div>
                <div class="mitad" style="background:${getColor(r.local)}"><img src="${getLogo(r.local)}" class="logo-resultado"><div class="nombre-equipo-res" style="color:${getColorTexto(r.local)}">${r.local}</div></div>
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
    
    const fechasUnicas = [...new Set(CALENDARIO.map(j => j.fecha))];
    const tituloTexto = fechasUnicas.length === 1 ? "JORNADA - " + fechasUnicas[0].toUpperCase() : "PRÓXIMOS JUEGOS";
    
    const titulo = document.createElement("h2");
    titulo.className = "titulo-seccion";
    titulo.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> ${tituloTexto}`;
    container.appendChild(titulo);

    CALENDARIO.forEach(j => {
        const card = document.createElement("div");
        card.className = "juego-card";
        card.innerHTML = `
            <div class="mitades-cal">
                <div class="mitad-cal" style="background:${getColor(j.visitante)}"><img src="${getLogo(j.visitante)}" class="logo-calendario"><div class="nombre-equipo-cal" style="color:${getColorTexto(j.visitante)}">${j.visitante}</div></div>
                <div class="mitad-cal" style="background:${getColor(j.local)}"><img src="${getLogo(j.local)}" class="logo-calendario"><div class="nombre-equipo-cal" style="color:${getColorTexto(j.local)}">${j.local}</div></div>
                <div class="vs-central-cal">VS</div>
            </div>
            <div class="info-juego-cal">
                <div class="hora-cal">🕐 ${j.hora}</div>
                <div class="transmision-cal">${j.transmision}</div>
            </div>`;
        container.appendChild(card);
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

function abrirArticulo(id) {
    const noticia = NOTICIAS.find(n => n.id === id);
    if (!noticia) return;
    document.getElementById("articulo-contenido").innerHTML = `<h1 class="articulo-titulo">${noticia.titulo}</h1><p class="articulo-fecha">${noticia.fecha} | LVBP al Día</p><div class="articulo-texto">${noticia.contenido}</div>`;
    document.getElementById("articulo-completo").style.display = "block";
    document.getElementById("articulo-completo").scrollIntoView({ behavior: "smooth" });
}

function cerrarArticulo() {
    document.getElementById("articulo-completo").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function generarTextoSeccion(tipo) {
    let texto = "";
    const url = "\n\n Ver más: " + CONFIG.urlPagina;
    if (tipo === 'posiciones') {
        texto = "🏆 *TABLA DE POSICIONES LVBP*\n";
        const lider = POSICIONES[0];
        POSICIONES.forEach((pos, i) => {
            const pct = calcularPCT(pos.jg, pos.jp);
            const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
            texto += `${i + 1}. ${pos.nombre} (${pos.jg}-${pos.jp}) ${pct} (DIF: ${dif})\n`;
        });
    } else if (tipo === 'resultados') {
        texto = "⚾ *RESULTADOS*\n";
        RESULTADOS.forEach(r => { texto += `${r.visitante} ${r.scoreVisitante} - ${r.scoreLocal} ${r.local} (Final)\n`; });
    } else if (tipo === 'calendario') {
        texto = "📅 *PRÓXIMOS JUEGOS*\n";
        CALENDARIO.forEach(j => { texto += `${j.visitante} vs ${j.local} - ${j.hora}\n`; });
    } else if (tipo === 'noticia') {
        const noticia = NOTICIAS.find(n => n.id === 1);
        if (noticia) texto = `📰 *${noticia.titulo}*\n\n${noticia.resumen}`;
    }
    return texto + url;
}

function compartirEnRed(red, tipo, textoCustom = '') {
    const texto = textoCustom || generarTextoSeccion(tipo);
    const textoCodificado = encodeURIComponent(texto);
    const urlCodificada = encodeURIComponent(CONFIG.urlPagina);
    let urlCompartir = "";
    switch(red) {
        case 'whatsapp': urlCompartir = `https://wa.me/?text=${textoCodificado}`; break;
        case 'telegram': urlCompartir = `https://t.me/share/url?url=${urlCodificada}&text=${textoCodificado}`; break;
        case 'twitter': urlCompartir = `https://twitter.com/intent/tweet?text=${textoCodificado}`; break;
        case 'facebook': urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}`; break;
    }
    if (urlCompartir) window.open(urlCompartir, '_blank', 'width=600,height=400');
}

function compartirSeccion(tipo, red) { compartirEnRed(red, tipo, generarTextoSeccion(tipo)); }

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("navMenu").classList.toggle("activo");
        });
    }
    
    const formulario = document.getElementById("formulario-comentario");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();
            comentarios.push({
                autor: formulario.querySelector(".input-comentario").value,
                texto: formulario.querySelector(".textarea-comentario").value,
                fecha: new Date().toLocaleString("es-VE")
            });
            const container = document.getElementById("lista-comentarios");
            container.innerHTML = comentarios.map(c => `<div class="comentario-item"><div class="comentario-autor">${c.autor}</div><div class="comentario-texto">${c.texto}</div><div class="comentario-fecha">${c.fecha}</div></div>`).join('');
            formulario.reset();
        });
    }
    
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
    renderPublicidad();
    
    console.log("✅ LVBP al Día cargado correctamente");
});
