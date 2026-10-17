// Datos REALES de equipos de la LVBP - Temporada 2026-2027
const equipos = [
    { 
        nombre: "Caribes de Anzoátegui", 
        nombreCorto: "Caribes",
        abrev: "ANZ", 
        jj: 4, jg: 3, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/0j685n5D/image-search-1791393733450-11zon.webp",
        claseFila: "fila-caribes",
        color: "#F2F2F2",
        colorTexto: "#2c2c2c"
    },
    { 
        nombre: "Tigres de Aragua", 
        nombreCorto: "Tigres",
        abrev: "ARA", 
        jj: 4, jg: 3, jp: 1, racha: "G2",
        logo: "https://i.postimg.cc/0QRG0W3n/1791393470300-11zon.jpg",
        claseFila: "fila-tigres",
        color: "#042959",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Cardenales de Lara", 
        nombreCorto: "Cardenales",
        abrev: "LAR", 
        jj: 3, jg: 2, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/HLpzqP32/image-search-1791395610326-11zon.jpg",
        claseFila: "fila-cardenales",
        color: "#D90D1E",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Bravos de Margarita", 
        nombreCorto: "Bravos",
        abrev: "MAR", 
        jj: 3, jg: 2, jp: 1, racha: "G2",
        logo: "https://i.postimg.cc/PJh5yYdY/1791395148443-11zon.jpg",
        claseFila: "fila-bravos",
        color: "#56A6A6",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Águilas del Zulia", 
        nombreCorto: "Águilas",
        abrev: "ZUL", 
        jj: 4, jg: 2, jp: 2, racha: "P1",
        logo: "https://i.postimg.cc/J4wxQnwX/1791392132263-11zon.jpg",
        claseFila: "fila-aguilas",
        color: "#F24607",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Tiburones de La Guaira", 
        nombreCorto: "Tiburones",
        abrev: "LGU", 
        jj: 4, jg: 2, jp: 2, racha: "P2",
        logo: "https://i.postimg.cc/J7Hm024y/image-search-1791382706892.png",
        claseFila: "fila-tiburones",
        color: "#2104D9",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Leones del Caracas", 
        nombreCorto: "Leones",
        abrev: "CAR", 
        jj: 4, jg: 1, jp: 3, racha: "P2",
        logo: "https://i.postimg.cc/Kjrw7g8p/image-search-1791396859705.jpg",
        claseFila: "fila-leones",
        color: "#082040",
        colorTexto: "#ffffff"
    },
    { 
        nombre: "Navegantes del Magallanes", 
        nombreCorto: "Magallanes",
        abrev: "MAG", 
        jj: 4, jg: 0, jp: 4, racha: "P4",
        logo: "https://i.postimg.cc/ydNH8j6v/1791396497437-11zon.jpg",
        claseFila: "fila-magallanes",
        color: "#5BA9D9",
        colorTexto: "#ffffff"
    }
];

// Función para obtener datos del equipo
function getEquipo(nombreEquipo) {
    const nombreLower = nombreEquipo.toLowerCase();
    return equipos.find(eq => 
        eq.nombre.toLowerCase().includes(nombreLower) || 
        eq.abrev.toLowerCase() === nombreLower ||
        nombreLower.includes(eq.abrev.toLowerCase())
    );
}

function getLogo(nombreEquipo) {
    const eq = getEquipo(nombreEquipo);
    return eq ? eq.logo : '';
}

function getColor(nombreEquipo) {
    const eq = getEquipo(nombreEquipo);
    return eq ? eq.color : '#cccccc';
}

function getColorTexto(nombreEquipo) {
    const eq = getEquipo(nombreEquipo);
    return eq ? eq.colorTexto : '#ffffff';
}

// Noticias (vacías hasta que tú las proporciones)
const noticias = [];

// Resultados REALES del Viernes 16 de Octubre
const resultados = [
    { local: "Bravos", scoreLocal: 9, visitante: "Leones", scoreVisitante: 2, fecha: "16 Oct", innings: 9 },
    { local: "Tiburones", scoreLocal: 4, visitante: "Caribes", scoreVisitante: 7, fecha: "16 Oct", innings: 9 },
    { local: "Tigres", scoreLocal: 8, visitante: "Magallanes", scoreVisitante: 7, fecha: "16 Oct", innings: 9 },
    { local: "Cardenales", scoreLocal: 8, visitante: "Águilas", scoreVisitante: 5, fecha: "16 Oct", innings: 9 }
];

// Jornada del Sábado 17 de Octubre (ACTUALIZADA)
const calendario = [
    { 
        fecha: "17 Oct 2026", 
        local: "Magallanes", 
        visitante: "Cardenales", 
        hora: "4:00 PM", 
        transmision: " IVC",
        lugar: "Estadio José Bernardo Pérez"
    },
    { 
        fecha: "17 Oct 2026", 
        local: "Tigres", 
        visitante: "Tiburones", 
        hora: "6:00 PM", 
        transmision: "📻 Baseball FM",
        lugar: "Estadio José Pérez Colmenares"
    },
    { 
        fecha: "17 Oct 2026", 
        local: "Leones", 
        visitante: "Caribes", 
        hora: "6:00 PM", 
        transmision: "📺 Televen",
        lugar: "Estadio Universitario de Caracas"
    },
    { 
        fecha: "17 Oct 2026", 
        local: "Bravos", 
        visitante: "Águilas", 
        hora: "8:00 PM", 
        transmision: "📺 BYM Sport",
        lugar: "Estadio Nueva Esparta"
    }
];

// Líderes estadísticos
const lideres = {
    carreras: [
        { nombre: "Carlos Pérez (MAR)", valor: 4 },
        { nombre: "David Peralta (MAR)", valor: 4 },
        { nombre: "Diosbel Arias (MAR)", valor: 3 }
    ],
    average: [
        { nombre: "Diosbel Arias (MAR)", valor: ".538" },
        { nombre: "Leandro Cedeño (CAR)", valor: ".400" },
        { nombre: "Alexi Amarista (MAR)", valor: ".308" }
    ],
    hr: [
        { nombre: "Por definir", valor: 0 },
        { nombre: "Por definir", valor: 0 },
        { nombre: "Por definir", valor: 0 }
    ],
    era: [
        { nombre: "L. Escobar (MAR)", valor: "0.00" },
        { nombre: "Por definir", valor: 0.00 },
        { nombre: "Por definir", valor: 0.00 }
    ]
};

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

// Renderizar posiciones (con nombres cortos)
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    const lider = equipos[0];
    
    equipos.forEach((eq, i) => {
        const pct = calcularPCT(eq.jg, eq.jp);
        const dif = calcularDIF(eq.jg, eq.jp, lider.jg, lider.jp);
        
        const tr = document.createElement("tr");
        tr.className = eq.claseFila;
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="equipo-con-logo">
                <img src="${eq.logo}" alt="${eq.nombre}" class="logo-small">
                <span>${eq.nombreCorto}</span>
            </td>
            <td>${eq.jj}</td>
            <td>${eq.jg}</td>
            <td>${eq.jp}</td>
            <td>${pct}</td>
            <td>${dif}</td>
            <td>${eq.racha}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar noticias
function renderNoticias() {
    const container = document.getElementById("noticias-container");
    
    if (noticias.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #f5f0e8; border-radius: 8px; border: 2px dashed #d32f2f;">
                <h3 style="color: #d32f2f; margin-bottom: 15px;">📰 Sección de Noticias</h3>
                <p style="color: #666; font-size: 1.1rem;">Próximamente: Noticias y fotos oficiales de LVBP al Día</p>
                <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">Mantente atento a nuestras próximas publicaciones</p>
            </div>
        `;
    } else {
        noticias.forEach(n => {
            const card = document.createElement("div");
            card.className = "noticia-card";
            card.style.backgroundImage = `url('${n.imagen}')`;
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
}

// Renderizar resultados
function renderResultados() {
    const container = document.getElementById("resultados-container");
    resultados.forEach(r => {
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

// Renderizar calendario
function renderCalendario() {
    const container = document.getElementById("calendario-container");
    calendario.forEach(j => {
        const logoLocal = getLogo(j.local);
        const logoVisitante = getLogo(j.visitante);
        const colorLocal = getColor(j.local);
        const colorVisitante = getColor(j.visitante);
        const textoLocal = getColorTexto(j.local);
        const textoVisitante = getColorTexto(j.visitante);
        
        const card = document.createElement("div");
        card.className = "juego-card";
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
            <div class="info-juego-cal">
                <div class="hora-cal">🕐 ${j.hora}</div>
                <div class="transmision-cal">${j.transmision}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Renderizar líderes estadísticos
function renderLideres() {
    const crearLista = (id, datos) => {
        const ol = document.getElementById(id);
        datos.forEach(d => {
            const li = document.createElement("li");
            li.innerHTML = `${d.nombre} <span class="valor">${d.valor}</span>`;
            ol.appendChild(li);
        });
    };
    
    crearLista("lideres-carreras", lideres.carreras);
    crearLista("lideres-average", lideres.average);
    crearLista("lideres-hr", lideres.hr);
    crearLista("lideres-era", lideres.era);
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");
    
    menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("activo");
    });
    
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
});
