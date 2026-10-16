// Datos de equipos de la LVBP
const equipos = [
    { nombre: "Navegantes del Magallanes", abrev: "MAG", jj: 10, jg: 7, jp: 3, racha: "G3" },
    { nombre: "Leones del Caracas", abrev: "CAR", jj: 10, jg: 6, jp: 4, racha: "G1" },
    { nombre: "Tiburones de La Guaira", abrev: "LGU", jj: 10, jg: 6, jp: 4, racha: "P1" },
    { nombre: "Águilas del Zulia", abrev: "ZUL", jj: 10, jg: 5, jp: 5, racha: "G2" },
    { nombre: "Tigres de Aragua", abrev: "ARA", jj: 10, jg: 5, jp: 5, racha: "P2" },
    { nombre: "Cardenales de Lara", abrev: "LAR", jj: 10, jg: 4, jp: 6, racha: "G1" },
    { nombre: "Bravos de Margarita", abrev: "MAR", jj: 10, jg: 4, jp: 6, racha: "P1" },
    { nombre: "Caribes de Anzoátegui", abrev: "ANZ", jj: 10, jg: 3, jp: 7, racha: "P3" }
];

// Noticias de ejemplo
const noticias = [
    {
        titulo: "Magallanes toma la punta de la tabla",
        texto: "Los Navegantes del Magallanes se consolidan en el primer lugar tras ganar tres juegos consecutivos. El pitcheo abridor ha sido clave en esta racha ganadora.",
        fecha: "17 Oct 2026",
        tag: "Destacado"
    },
    {
        titulo: "Leones del Caracas anuncian nuevo refuerzo",
        texto: "El equipo capitalino incorpora un nuevo lanzador foráneo para fortalecer el bullpen de cara a la segunda mitad de la temporada regular.",
        fecha: "16 Oct 2026",
        tag: "Fichajes"
    },
    {
        titulo: "Tiburones de La Guaira empatan en el segundo lugar",
        texto: "Con victoria apretada 4-3 en entradas extras, La Guaira se mantiene en la pelea por el primer lugar de la división.",
        fecha: "16 Oct 2026",
        tag: "Resultados"
    },
    {
        titulo: "Águilas del Zulia sorprenden con barrida",
        texto: "Los Águilas barrieron la serie contra los Bravos de Margarita con actuaciones destacadas de su lineup ofensivo.",
        fecha: "15 Oct 2026",
        tag: "Resultados"
    },
    {
        titulo: "Líderes de bateo: competencia reñida",
        texto: "Tres jugadores se disputan el título de bateo con averages superiores a .350. La competencia se intensifica semana a semana.",
        fecha: "15 Oct 2026",
        tag: "Estadísticas"
    },
    {
        titulo: "Calendario de la semana: juegos clave",
        texto: "Esta semana se disputarán enfrentamientos directos entre los primeros lugares de la tabla. No te los pierdas.",
        fecha: "14 Oct 2026",
        tag: "Calendario"
    }
];

// Resultados recientes
const resultados = [
    { local: "Magallanes", scoreLocal: 5, visitante: "Caracas", scoreVisitante: 3, fecha: "16 Oct" },
    { local: "La Guaira", scoreLocal: 4, visitante: "Aragua", scoreVisitante: 3, fecha: "16 Oct" },
    { local: "Zulia", scoreLocal: 7, visitante: "Margarita", scoreVisitante: 2, fecha: "16 Oct" },
    { local: "Lara", scoreLocal: 3, visitante: "Anzoátegui", scoreVisitante: 5, fecha: "16 Oct" },
    { local: "Caracas", scoreLocal: 6, visitante: "Zulia", scoreVisitante: 4, fecha: "15 Oct" },
    { local: "Aragua", scoreLocal: 2, visitante: "Magallanes", scoreVisitante: 8, fecha: "15 Oct" }
];

// Calendario de juegos
const calendario = [
    { fecha: "18 Oct 2026", local: "Caracas", visitante: "Magallanes", hora: "6:00 PM" },
    { fecha: "18 Oct 2026", local: "La Guaira", visitante: "Zulia", hora: "6:00 PM" },
    { fecha: "18 Oct 2026", local: "Aragua", visitante: "Lara", hora: "6:00 PM" },
    { fecha: "18 Oct 2026", local: "Margarita", visitante: "Anzoátegui", hora: "4:00 PM" },
    { fecha: "19 Oct 2026", local: "Magallanes", visitante: "La Guaira", hora: "4:00 PM" },
    { fecha: "19 Oct 2026", local: "Zulia", visitante: "Caracas", hora: "4:00 PM" }
];

// Líderes estadísticos
const lideres = {
    carreras: [
        { nombre: "José Ramírez (MAG)", valor: 12 },
        { nombre: "Miguel Cabrera (CAR)", valor: 10 },
        { nombre: "Ronald Acuña (LGU)", valor: 9 }
    ],
    average: [
        { nombre: "Luis Arráez (MAG)", valor: ".385" },
        { nombre: "José Altuve (CAR)", valor: ".370" },
        { nombre: "Miguel Cabrera (CAR)", valor: ".355" }
    ],
    hr: [
        { nombre: "Ronald Acuña (LGU)", valor: 5 },
        { nombre: "José Ramírez (MAG)", valor: 4 },
        { nombre: "Miguel Cabrera (CAR)", valor: 3 }
    ],
    era: [
        { nombre: "Martín Pérez (MAG)", valor: "1.85" },
        { nombre: "Félix Hernández (CAR)", valor: "2.10" },
        { nombre: "Carlos Carrasco (LGU)", valor: "2.45" }
    ]
};

// Función para calcular porcentaje de victorias
function calcularPCT(jg, jp) {
    return (jg / (jg + jp)).toFixed(3);
}

// Función para calcular diferencia
function calcularDIF(jg, jp, primerJG, primerJP) {
    const diff = ((primerJG - jg) + (jp - primerJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

// Renderizar posiciones
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    const primerEquipo = equipos[0];
    
    equipos.forEach((eq, i) => {
        const pct = calcularPCT(eq.jg, eq.jp);
        const dif = calcularDIF(eq.jg, eq.jp, primerEquipo.jg, primerEquipo.jp);
        
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

// Renderizar noticias
function renderNoticias() {
    const container = document.getElementById("noticias-container");
    noticias.forEach(n => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.innerHTML = `
            <div class="fecha">${n.fecha}</div>
            <h3>${n.titulo}</h3>
            <p>${n.texto}</p>
            <span class="tag">${n.tag}</span>
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
                <div class="equipo">
                    <div class="equipo-nombre">${r.local}</div>
                </div>
                <div class="score">${r.scoreLocal} - ${r.scoreVisitante}</div>
                <div class="equipo">
                    <div class="equipo-nombre">${r.visitante}</div>
                </div>
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

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
});
