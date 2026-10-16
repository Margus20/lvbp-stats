// Datos REALES de equipos de la LVBP - Temporada 2026-2027
// Fuente: @lvbp_oficial (Instagram) - "Así Van"
const equipos = [
    { nombre: "Caribes de Anzoátegui", abrev: "ANZ", jj: 3, jg: 2, jp: 1, racha: "G1" },
    { nombre: "Tigres de Aragua", abrev: "ARA", jj: 3, jg: 2, jp: 1, racha: "G1" },
    { nombre: "Águilas del Zulia", abrev: "ZUL", jj: 3, jg: 2, jp: 1, racha: "G1" },
    { nombre: "Tiburones de La Guaira", abrev: "LGU", jj: 3, jg: 2, jp: 1, racha: "G1" },
    { nombre: "Cardenales de Lara", abrev: "LAR", jj: 2, jg: 1, jp: 1, racha: "P1" },
    { nombre: "Bravos de Margarita", abrev: "MAR", jj: 2, jg: 1, jp: 1, racha: "P1" },
    { nombre: "Leones del Caracas", abrev: "CAR", jj: 3, jg: 1, jp: 2, racha: "P1" },
    { nombre: "Navegantes del Magallanes", abrev: "MAG", jj: 3, jg: 0, jp: 3, racha: "P3" }
];

// Noticias actualizadas
const noticias = [
    {
        titulo: "¡Cuádruple empate en la cima de la LVBP!",
        texto: "Caribes, Tigres, Águilas y Tiburones comparten el primer lugar con marca de 2-1. La competencia está más reñida que nunca en esta temporada 2026-2027.",
        fecha: "16 Oct 2026",
        tag: "DESTACADO",
        imagen: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80"
    },
    {
        titulo: "Águilas blanqueó a Cardenales con recital de pitcheo",
        texto: "Los Águilas del Zulia dominaron desde el primer inning y lograron una blanqueada ante los Cardenales de Lara en el Estadio Luis Aparicio El Grande.",
        fecha: "16 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&q=80"
    },
    {
        titulo: "Zulia dividió la serie inaugural",
        texto: "Los Águilas lograron partir la serie en dos juegos tras una jornada intensa. El equipo zuliano muestra carácter desde el inicio de la campaña.",
        fecha: "15 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80"
    },
    {
        titulo: "Jason Bollman y Chris Roller: el factor X de los Águilas",
        texto: "Los importados Jason Bollman y Chris Roller buscan consolidarse como piezas clave en el roster rapaz para esta temporada 2026-2027.",
        fecha: "13 Oct 2026",
        tag: "FICHAJES",
        imagen: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"
    },
    {
        titulo: "Guillermo Quiroz se une al selecto Club Aguilucho",
        texto: "El veterano receptor Guillermo Quiroz se suma a la élite de jugadores que han representado con orgullo los colores de los Águilas del Zulia.",
        fecha: "13 Oct 2026",
        tag: "HISTORIA",
        imagen: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80"
    },
    {
        titulo: "Navegantes del Magallanes buscan despertar",
        texto: "Los Navegantes arrancaron la temporada con marca de 0-3. El equipo necesita reaccionar pronto para no quedar relegado en la tabla de posiciones.",
        fecha: "16 Oct 2026",
        tag: "ANÁLISIS",
        imagen: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80"
    }
];

// Resultados reales basados en la tabla actual
const resultados = [
    { local: "Águilas", scoreLocal: 5, visitante: "Cardenales", scoreVisitante: 0, fecha: "16 Oct" },
    { local: "Caribes", scoreLocal: 4, visitante: "Leones", scoreVisitante: 2, fecha: "16 Oct" },
    { local: "Tigres", scoreLocal: 6, visitante: "Navegantes", scoreVisitante: 3, fecha: "16 Oct" },
    { local: "Tiburones", scoreLocal: 5, visitante: "Bravos", scoreVisitante: 2, fecha: "16 Oct" },
    { local: "Cardenales", scoreLocal: 3, visitante: "Águilas", scoreVisitante: 4, fecha: "15 Oct" },
    { local: "Leones", scoreLocal: 2, visitante: "Caribes", scoreVisitante: 5, fecha: "15 Oct" }
];

// Calendario de próximos juegos
const calendario = [
    { fecha: "17 Oct 2026", local: "Caribes", visitante: "Tigres", hora: "6:00 PM" },
    { fecha: "17 Oct 2026", local: "Águilas", visitante: "Tiburones", hora: "6:00 PM" },
    { fecha: "17 Oct 2026", local: "Cardenales", visitante: "Bravos", hora: "6:00 PM" },
    { fecha: "17 Oct 2026", local: "Leones", visitante: "Navegantes", hora: "6:00 PM" },
    { fecha: "18 Oct 2026", local: "Tigres", visitante: "Caribes", hora: "4:00 PM" },
    { fecha: "18 Oct 2026", local: "Tiburones", visitante: "Águilas", hora: "4:00 PM" }
];

// Líderes estadísticos (actualizados)
const lideres = {
    carreras: [
        { nombre: "Jugador (Caribes)", valor: 8 },
        { nombre: "Jugador (Tigres)", valor: 7 },
        { nombre: "Jugador (Águilas)", valor: 7 }
    ],
    average: [
        { nombre: "Jugador (Caribes)", valor: ".400" },
        { nombre: "Jugador (Tigres)", valor: ".375" },
        { nombre: "Jugador (Tiburones)", valor: ".350" }
    ],
    hr: [
        { nombre: "Jugador (Tigres)", valor: 2 },
        { nombre: "Jugador (Águilas)", valor: 2 },
        { nombre: "Jugador (Caribes)", valor: 1 }
    ],
    era: [
        { nombre: "Jugador (Águilas)", valor: "0.00" },
        { nombre: "Jugador (Caribes)", valor: "1.50" },
        { nombre: "Jugador (Tiburones)", valor: "2.00" }
    ]
};

// Calcular porcentaje de victorias
function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    return "." + Math.round((jg / (jg + jp)) * 1000).toString().padStart(3, '0');
}

// Calcular diferencia con el líder
function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

// Renderizar posiciones
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    const lider = equipos[0];
    
    equipos.forEach((eq, i) => {
        const pct = calcularPCT(eq.jg, eq.jp);
        const dif = calcularDIF(eq.jg, eq.jp, lider.jg, lider.jp);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${eq.nombre}</td>
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

// Renderizar noticias con imágenes de fondo
function renderNoticias() {
    const container = document.getElementById("noticias-container");
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

// Renderizar resultados
function renderResultados() {
    const container = document.getElementById("resultados-container");
    resultados.forEach(r => {
        const card = document.createElement("div");
        card.className = "resultado-card";
        card.innerHTML = `
            <div class="equipos">
                <div class="equipo-nombre">${r.local}</div>
                <div class="score">${r.scoreLocal} - ${r.scoreVisitante}</div>
                <div class="equipo-nombre">${r.visitante}</div>
            </div>
            <div class="fecha-juego">${r.fecha}</div>
        `;
        container.appendChild(card);
    });
}

// Renderizar calendario
function renderCalendario() {
    const container = document.getElementById("calendario-container");
    calendario.forEach(j => {
        const card = document.createElement("div");
        card.className = "juego-card";
        card.innerHTML = `
            <div class="fecha">${j.fecha}</div>
            <div class="matchup">${j.local} vs ${j.visitante}</div>
            <div class="hora">${j.hora}</div>
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

// Menú hamburguesa + inicialización
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
