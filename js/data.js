// ============================================
// DATOS DE LA LVBP - TEMPORADA 2026-2027
// ============================================

const DATOS = {
    
    // ===== EQUIPOS (LOGOS DESDE GITHUB) =====
    equipos: [
        { nombre: "Caribes de Anzoátegui", nombreCorto: "Caribes", abrev: "ANZ", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/caribes.png", claseFila: "fila-caribes", color: "#F2F2F2", colorTexto: "#2c2c2c" },
        { nombre: "Tigres de Aragua", nombreCorto: "Tigres", abrev: "ARA", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/tigres.png", claseFila: "fila-tigres", color: "#042959", colorTexto: "#ffffff" },
        { nombre: "Cardenales de Lara", nombreCorto: "Cardenales", abrev: "LAR", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/cardenales.png", claseFila: "fila-cardenales", color: "#D90D1E", colorTexto: "#ffffff" },
        { nombre: "Bravos de Margarita", nombreCorto: "Bravos", abrev: "MAR", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/bravos.png", claseFila: "fila-bravos", color: "#56A6A6", colorTexto: "#ffffff" },
        { nombre: "Águilas del Zulia", nombreCorto: "Águilas", abrev: "ZUL", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/aguilas.png", claseFila: "fila-aguilas", color: "#F24607", colorTexto: "#ffffff" },
        { nombre: "Tiburones de La Guaira", nombreCorto: "Tiburones", abrev: "LGU", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/tiburones.png", claseFila: "fila-tiburones", color: "#2104D9", colorTexto: "#ffffff" },
        { nombre: "Leones del Caracas", nombreCorto: "Leones", abrev: "CAR", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/leones.png", claseFila: "fila-leones", color: "#082040", colorTexto: "#ffffff" },
        { nombre: "Navegantes del Magallanes", nombreCorto: "Magallanes", abrev: "MAG", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/magallanes.png", claseFila: "fila-magallanes", color: "#5BA9D9", colorTexto: "#ffffff" }
    ],

    // ===== CANALES DE TV (LOGOS DESDE GITHUB) =====
    canales: [
        { nombre: "IVC", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/ivctv.png" },
        { nombre: "Televen", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/televentv.png" },
        { nombre: "BYM Sport", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/bymtv.png" },
        { nombre: "Baseball", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/baseballtv.png" },
        { nombre: "Venevisión", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/venevisiontv.png" },
        { nombre: "Venezolana TV", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/venezolanatv.png" },
        { nombre: "Tves", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/tves.png" },
        { nombre: "Meridiano TV", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/meridianotv.png" },
        { nombre: "XApp", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/xapp.png" },
        { nombre: "YouTube", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/youtubetv.png" }
    ],

    // ===== POSICIONES =====
    posiciones: [
        { nombre: "Tigres de Aragua", jj: 6, jg: 5, jp: 1, racha: "G2" },
        { nombre: "Cardenales de Lara", jj: 5, jg: 4, jp: 1, racha: "G2" },
        { nombre: "Bravos de Margarita", jj: 5, jg: 4, jp: 1, racha: "G2" },
        { nombre: "Caribes de Anzoátegui", jj: 6, jg: 4, jp: 2, racha: "P1" },
        { nombre: "Águilas del Zulia", jj: 6, jg: 2, jp: 4, racha: "P2" },
        { nombre: "Leones del Caracas", jj: 6, jg: 2, jp: 4, racha: "G1" },
        { nombre: "Tiburones de La Guaira", jj: 6, jg: 2, jp: 4, racha: "P2" },
        { nombre: "Navegantes del Magallanes", jj: 6, jg: 0, jp: 6, racha: "P6" }
    ],

    // ===== RESULTADOS DEL DOMINGO 18 DE OCTUBRE =====
    resultados: [
        { local: "Tigres", scoreLocal: 5, visitante: "Tiburones", scoreVisitante: 4, fecha: "18 Oct", innings: 9 },
        { local: "Caribes", scoreLocal: 4, visitante: "Leones", scoreVisitante: 8, fecha: "18 Oct", innings: 9 },
        { local: "Águilas", scoreLocal: 2, visitante: "Bravos", scoreVisitante: 8, fecha: "18 Oct", innings: 9 },
        { local: "Cardenales", scoreLocal: 8, visitante: "Magallanes", scoreVisitante: 5, fecha: "18 Oct", innings: 9 }
    ],

    // ===== CALENDARIO (LUNES 19 Y MARTES 20) =====
    calendario: [
        { local: "Cardenales", visitante: "Magallanes", hora: "7:00 PM", transmision: "Baseball", lugar: "Estadio Antonio Herrera Gutiérrez", fecha: "19 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Tiburones", visitante: "Leones", hora: "7:00 PM", transmision: "IVC", lugar: "Estadio Universitario", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Bravos", visitante: "Caribes", hora: "7:00 PM", transmision: "BYM Sport", lugar: "Estadio Nueva Esparta", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Águilas", visitante: "Tigres", hora: "7:00 PM", transmision: "Baseball", lugar: "Estadio Luis Aparicio", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null }
    ],

    // ===== NOTICIAS =====
    noticias: [
        {
            id: 1,
            titulo: "Tigres escala a la cima de la LVBP tras vencer a Tiburones",
            resumen: "Los felinos derrotaron 5-4 a los escualos y tomaron el liderato solitario con récord de 5-1.",
            fecha: "19 Oct 2026",
            tag: "RESULTADOS",
            imagen: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
            contenido: "<p><strong>LARA.-</strong> Tigres de Aragua dio un golpe en la mesa al escalar a la primera posición de la tabla de posiciones tras derrotar 5-4 a Tiburones de La Guaira este domingo 18 de octubre.</p><p>Con esta victoria, los felinos mejoraron su récord a 5-1 (.833) y se colocan medio juego por encima de Cardenales y Bravos.</p><div class=\"articulo-cta\">💬 ¿Crees que Tigres mantendrá el liderato? ¡Déjanos tu opinión!</div>"
        },
        {
            id: 2,
            titulo: "Cardenales y Bravos ganan y siguen presionando a los líderes",
            resumen: "Ambos equipos mejoraron a 4-1 en la tabla mientras Magallanes y Águilas cayeron en casa.",
            fecha: "18 Oct 2026",
            tag: "JORNADA",
            imagen: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
            contenido: "<p><strong>LVBP.-</strong> La jornada del domingo 18 de octubre dejó resultados interesantes en la parte alta de la tabla. Cardenales venció 8-5 a Magallanes y Bravos goleó 8-2 a Águilas.</p><div class=\"articulo-cta\">🔗 Ver todos los resultados en nuestra sección de Juegos.</div>"
        }
    ],

    // ===== PUBLICIDAD =====
    publicidad: [
        { imagen: "https://i.postimg.cc/Ls63NHxv/1000419154.jpg", alt: "Publicidad Slaki Dom" },
        { imagen: "https://i.postimg.cc/gJp0nMtD/1792281708726-11zon.jpg", alt: "Publicidad" }
    ],

    // ===== LÍDERES ESTADÍSTICOS =====
    lideres: {
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
            { nombre: "Rob Hernández (LAR)", valor: "0.00" },
            { nombre: "Gu Rodríguez (LAR)", valor: "0.00" },
            { nombre: "L. Escobar (MAG)", valor: "0.00" }
        ]
    }
};
