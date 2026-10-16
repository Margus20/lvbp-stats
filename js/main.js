// Datos REALES de equipos de la LVBP - Temporada 2026-2027
// Fuente de logos: Enlaces proporcionados por el usuario (Norma permanente)
const equipos = [
    { 
        nombre: "Caribes de Anzoátegui", 
        abrev: "ANZ", 
        jj: 4, jg: 3, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/0j685n5D/image-search-1791393733450-11zon.webp"
    },
    { 
        nombre: "Tigres de Aragua", 
        abrev: "ARA", 
        jj: 4, jg: 3, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/0QRG0W3n/1791393470300-11zon.jpg"
    },
    { 
        nombre: "Águilas del Zulia", 
        abrev: "ZUL", 
        jj: 4, jg: 3, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/J4wxQnwX/1791392132263-11zon.jpg"
    },
    { 
        nombre: "Bravos de Margarita", 
        abrev: "MAR", 
        jj: 3, jg: 2, jp: 1, racha: "G1",
        logo: "https://i.postimg.cc/PJh5yYdY/1791395148443-11zon.jpg"
    },
    { 
        nombre: "Tiburones de La Guaira", 
        abrev: "LGU", 
        jj: 4, jg: 2, jp: 2, racha: "P1",
        logo: "https://i.postimg.cc/J7Hm024y/image-search-1791382706892.png"
    },
    { 
        nombre: "Cardenales de Lara", 
        abrev: "LAR", 
        jj: 3, jg: 1, jp: 2, racha: "P1",
        logo: "https://i.postimg.cc/HLpzqP32/image-search-1791395610326-11zon.jpg"
    },
    { 
        nombre: "Leones del Caracas", 
        abrev: "CAR", 
        jj: 4, jg: 1, jp: 3, racha: "P1",
        logo: "https://i.postimg.cc/Kjrw7g8p/image-search-1791396859705.jpg"
    },
    { 
        nombre: "Navegantes del Magallanes", 
        abrev: "MAG", 
        jj: 4, jg: 0, jp: 4, racha: "P4",
        logo: "https://i.postimg.cc/ydNH8j6v/1791396497437-11zon.jpg"
    }
];

// Función inteligente para obtener el logo desde el nombre corto o abreviatura
function getLogo(nombreEquipo) {
    const nombreLower = nombreEquipo.toLowerCase();
    const equipo = equipos.find(eq => 
        eq.nombre.toLowerCase().includes(nombreLower) || 
        eq.abrev.toLowerCase() === nombreLower ||
        nombreLower.includes(eq.abrev.toLowerCase())
    );
    return equipo ? equipo.logo : '';
}

// Noticias actualizadas con información real
const noticias = [
    {
        titulo: "¡Cuádruple empate en la cima! Caribes, Tigres, Águilas y Bravos lideran",
        texto: "Tras la jornada del jueves 15 de octubre, cuatro equipos comparten el liderato con marca de 3-1 o mejor. La competencia está más reñida que nunca en esta temporada 2026-2027.",
        fecha: "16 Oct 2026",
        tag: "DESTACADO",
        imagen: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80"
    },
    {
        titulo: "Caribes destrozó a Tiburones 15-5 en una exhibición ofensiva",
        texto: "Los Caribes de Anzoátegui conectaron 15 carreras ante los Tiburones de La Guaira en una demostración de poder ofensivo que los mantiene en la cima de la tabla.",
        fecha: "15 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&q=80"
    },
    {
        titulo: "Tigres apaleó a Navegantes 11-3 y se mantiene en la lucha",
        texto: "Los Tigres de Aragua dominaron de principio a fin a los Navegantes del Magallanes, quienes caen a marca de 0-4 en la temporada.",
        fecha: "15 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80"
    },
    {
        titulo: "Bravos derrotó a Leones 3-1 en juego cerrado",
        texto: "Los Bravos de Margarita se impusieron 3-1 ante los Leones del Caracas en un juego definido por el pitcheo. Caracas cae a 1-3.",
        fecha: "15 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"
    },
    {
        titulo: "Águilas blanqueó a Cardenales 2-0 con gran pitcheo",
        texto: "Los Águilas del Zulia lograron una blanqueada 2-0 sobre los Cardenales de Lara, manteniéndose en el grupo de líderes con marca de 3-1.",
        fecha: "15 Oct 2026",
        tag: "RESULTADOS",
        imagen: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80"
    },
    {
        titulo: "Jornada del viernes: Bravos vs Leones abre la acción a las 2:00 PM",
        texto: "Este viernes 16 de octubre se disputan 4 juegos. Bravos vs Leones a las 2:00 PM, y tres juegos a las 7:00 PM: Tiburones vs Caribes, Tigres vs Navegantes y Cardenales vs Águilas.",
        fecha: "16 Oct 2026",
        tag: "CALENDARIO",
        imagen: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80"
    }
];

// Resultados REALES del Jueves 15 de Octubre
const resultados = [
    { local: "Tiburones", scoreLocal: 5, visitante: "Caribes", scoreVisitante: 15, fecha: "15 Oct" },
    { local: "Bravos", scoreLocal: 3, visitante: "Leones", scoreVisitante: 1, fecha: "15 Oct" },
    { local: "Magallanes", scoreLocal: 3, visitante: "Tigres", scoreVisitante: 11, fecha: "15 Oct" },
    { local: "Cardenales", scoreLocal: 0, visitante: "Águilas", scoreVisitante: 2, fecha: "15 Oct" }
];

// Jornada del Viernes 16 de Octubre
const calendario = [
    { fecha: "16 Oct 2026", local: "Bravos", visitante: "Leones", hora: "2:00 PM", transmision: "📺 BYM Sport" },
    { fecha: "16 Oct 2026", local: "Tiburones", visitante: "Caribes", hora: "7:00 PM", transmision: "📻 Baseball FM / 📺 Meridiano TV" },
    { fecha: "16 Oct 2026", local: "Tigres", visitante: "Navegantes", hora: "7:00 PM", transmision: "📺 BYM Sport" },
    { fecha: "16 Oct 2026", local: "Cardenales", visitante: "Águilas", hora: "7:00 PM", transmision: "📺 V" }
];

// Líderes estadísticos
const lideres = {
    carreras: [
        { nombre: "Jugador (Caribes)", valor: 15 },
        { nombre: "Jugador (Tigres)", valor: 11 },
        { nombre: "Jugador (Bravos)", valor: 8 }
    ],
    average: [
        { nombre: "Jugador (Caribes)", valor: ".400" },
        { nombre: "Jugador (Tigres)", valor: ".375" },
        { nombre: "Jugador (Águilas)", valor: ".350" }
    ],
    hr: [
        { nombre: "Jugador (Caribes)", valor: 3 },
        { nombre: "Jugador (Tigres)", valor: 2 },
        { nombre: "Jugador (Bravos)", valor: 2 }
    ],
    era: [
        { nombre: "Jugador (Águilas)", valor: "0.00" },
        { nombre: "Jugador (Bravos)", valor: "1.50" },
        { nombre: "Jugador (Caribes)", valor: "2.00" }
    ]
};

// Calcular porcentaje de victorias
function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    const pct = (jg / (jg + jp));
    return "." + Math.round(pct * 1000).toString().padStart(3, '0');
}

// Calcular diferencia con el líder
function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

// Renderizar posiciones CON LOGOS
function renderPosiciones() {
    const tbody = document.getElementById("posiciones-body");
    const lider = equipos[0];
    
    equipos.forEach((eq, i) => {
        const pct = calcularPCT(eq.jg, eq.jp);
        const dif = calcularDIF(eq.jg, eq.jp, lider.jg, lider.jp);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="equipo-con-logo">
                <img src="${eq.logo}" alt="${eq.nombre}" class="logo-small">
                <span>${eq.nombre}</span>
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

// Renderizar resultados CON LOGOS (Norma permanente)
function renderResultados() {
    const container = document.getElementById("resultados-container");
    resultados.forEach(r => {
        const logoLocal = getLogo(r.local);
        const logoVisitante = getLogo(r.visitante);
        
        const card = document.createElement("div");
        card.className = "resultado-card";
        card.innerHTML = `
            <div class="equipos">
                <div class="equipo-info">
                    ${logoLocal ? `<img src="${logoLocal}" alt="${r.local}" class="logo-small">` : ''}
                    <div class="equipo-nombre">${r.local}</div>
                </div>
                <div class="score">${r.scoreLocal} - ${r.scoreVisitante}</div>
                <div class="equipo-info">
                    <div class="equipo-nombre">${r.visitante}</div>
                    ${logoVisitante ? `<img src="${logoVisitante}" alt="${r.visitante}" class="logo-small">` : ''}
                </div>
            </div>
            <div class="fecha-juego">${r.fecha}</div>
        `;
        container.appendChild(card);
    });
}

// Renderizar calendario CON LOGOS (Norma permanente)
function renderCalendario() {
    const container = document.getElementById("calendario-container");
    calendario.forEach(j => {
        const logoLocal = getLogo(j.local);
        const logoVisitante = getLogo(j.visitante);
        
        const card = document.createElement("div");
        card.className = "juego-card";
        card.innerHTML = `
            <div class="fecha">${j.fecha}</div>
            <div class="matchup">
                <div class="equipo-info">
                    ${logoLocal ? `<img src="${logoLocal}" alt="${j.local}" class="logo-small">` : ''}
                    <span>${j.local}</span>
                </div>
                <span class="vs">vs</span>
                <div class="equipo-info">
                    <span>${j.visitante}</span>
                    ${logoVisitante ? `<img src="${logoVisitante}" alt="${j.visitante}" class="logo-small">` : ''}
                </div>
            </div>
            <div class="hora-info">
                <div class="hora">${j.hora}</div>
                <div class="transmision">${j.transmision}</div>
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
