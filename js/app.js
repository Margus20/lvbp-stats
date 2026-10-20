// ============================================
// LVBP AL DÍA - APP UNIFICADA
// ============================================

// CONFIGURACIÓN
const CONFIG = {
    logoLVBP: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
    urlPagina: window.location.href,
    repositorio: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/"
};

// EQUIPOS
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

// DATOS ACTUALES (EDITA ESTO CADA DÍA)
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

// FUNCIONES AUXILIARES
function getEquipo(nombre) {
    const lower = nombre.toLowerCase();
    if (lower.includes('navegantes') || lower.includes('magallanes')) return EQUIPOS.find(e => e.abrev === 'MAG');
    return EQUIPOS.find(e => e.nombre.toLowerCase() === lower || e.nombreCorto.toLowerCase() === lower);
}

function getLogo(nombre) { const eq = getEquipo(nombre); return eq ? eq.logo : ''; }
function getColor(nombre) { const eq = getEquipo(nombre); return eq ? eq.color : '#ccc'; }
function getColorTexto(nombre) { const eq = getEquipo(nombre); return eq ? eq.colorTexto : '#fff'; }

// RENDERIZADO
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    if (!tbody) return;
    tbody.innerHTML = '';
    POSICIONES.forEach((pos, i) => {
        const eq = getEquipo(pos.nombre);
        if (!eq) return;
        const tr = document.createElement("tr");
        tr.className = eq.claseFila;
        tr.innerHTML = `<td>${i+1}</td><td class="equipo-con-logo"><img src="${eq.logo}" class="logo-small">${eq.nombreCorto}</td><td>${pos.jj}</td><td>${pos.jg}</td><td>${pos.jp}</td><td>.000</td><td>-</td><td>${pos.racha}</td>`;
        tbody.appendChild(tr);
    });
}

function renderResultados() {
    const container = document.getElementById("resultados-container");
    if (!container) return;
    container.innerHTML = '';
    
    // Título dinámico
    const titulo = document.createElement("h2");
    titulo.className = "titulo-seccion";
    titulo.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> RESULTADOS - LUNES 19 DE OCTUBRE`;
    container.appendChild(titulo);

    RESULTADOS.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
        card.innerHTML = `
            <div class="mitades">
                <div class="mitad" style="background:${getColor(r.visitante)}"><img src="${getLogo(r.visitante)}" class="logo-resultado"><div style="color:${getColorTexto(r.visitante)}">${r.visitante}</div></div>
                <div class="mitad" style="background:${getColor(r.local)}"><img src="${getLogo(r.local)}" class="logo-resultado"><div style="color:${getColorTexto(r.local)}">${r.local}</div></div>
                <div class="vs-central">VS</div>
            </div>
            <div class="info-marcador">
                <div class="marcador"><span>${r.scoreVisitante}</span> - <span>${r.scoreLocal}</span></div>
                <div class="innings-info"><span>${r.innings}</span><small>Innings</small></div>
            </div>
            <div class="fecha-juego-res">${r.fecha}</div>`;
        container.appendChild(card);
    });
}

function renderCalendario() {
    const container = document.getElementById("calendario-container");
    if (!container) return;
    container.innerHTML = '';
    
    // Título dinámico
    const titulo = document.createElement("h2");
    titulo.className = "titulo-seccion";
    titulo.innerHTML = `<img src="${CONFIG.logoLVBP}" class="logo-seccion"> JORNADA - MARTES 20 DE OCTUBRE`;
    container.appendChild(titulo);

    CALENDARIO.forEach(j => {
        const card = document.createElement("div");
        card.className = "juego-card";
        card.innerHTML = `
            <div class="mitades-cal">
                <div class="mitad-cal" style="background:${getColor(j.visitante)}"><img src="${getLogo(j.visitante)}" class="logo-calendario"><div style="color:${getColorTexto(j.visitante)}">${j.visitante}</div></div>
                <div class="mitad-cal" style="background:${getColor(j.local)}"><img src="${getLogo(j.local)}" class="logo-calendario"><div style="color:${getColorTexto(j.local)}">${j.local}</div></div>
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
    NOTICIAS.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.style.backgroundImage = `url('${n.imagen}')`;
        card.innerHTML = `<div class="noticia-contenido"><span class="noticia-tag">${n.tag}</span><h3>${n.titulo}</h3><p class="fecha">${n.fecha}</p></div>`;
        container.appendChild(card);
    });
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

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    renderPosiciones();
    renderResultados();
    renderCalendario();
    renderNoticias();
    renderPublicidad();
    console.log("✅ LVBP al Día cargado");
});
