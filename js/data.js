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
        { nombre: "YouTube", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/youtubetv.png" },
        { nombre: "X", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/x-logo.png", esIcono: true }
    ],

    // ===== POSICIONES ACTUALIZADAS =====
    posiciones: [
        { nombre: "Tigres de Aragua", jj: 6, jg: 5, jp: 1, ave: ".833", dif: "0", racha: "G4", ult10: "5-1", casa: "2-0", ruta: "3-1", ca: 39, cp: 33, caCp: 6 },
        { nombre: "Bravos de Margarita", jj: 5, jg: 4, jp: 1, ave: ".800", dif: "0.5", racha: "G4", ult10: "4-1", casa: "0-0", ruta: "4-1", ca: 30, cp: 15, caCp: 15 },
        { nombre: "Caribes de Anzoátegui", jj: 6, jg: 4, jp: 2, ave: ".667", dif: "1", racha: "P1", ult10: "4-2", casa: "4-2", ruta: "0-0", ca: 48, cp: 33, caCp: 15 },
        { nombre: "Cardenales de Lara", jj: 6, jg: 4, jp: 2, ave: ".667", dif: "1", racha: "P1", ult10: "4-2", casa: "2-1", ruta: "2-1", ca: 34, cp: 30, caCp: 4 },
        { nombre: "Águilas del Zulia", jj: 6, jg: 2, jp: 4, ave: ".333", dif: "3", racha: "P3", ult10: "2-4", casa: "2-4", ruta: "0-0", ca: 27, cp: 32, caCp: -5 },
        { nombre: "Leones del Caracas", jj: 6, jg: 2, jp: 4, ave: ".333", dif: "3", racha: "G1", ult10: "2-4", casa: "0-2", ruta: "2-2", ca: 28, cp: 37, caCp: -9 },
        { nombre: "Tiburones de La Guaira", jj: 6, jg: 2, jp: 4, ave: ".333", dif: "3", racha: "P4", ult10: "2-4", casa: "1-1", ruta: "1-3", ca: 39, cp: 46, caCp: -7 },
        { nombre: "Navegantes del Magallanes", jj: 7, jg: 1, jp: 6, ave: ".143", dif: "4.5", racha: "G1", ult10: "1-6", casa: "0-3", ruta: "1-3", ca: 42, cp: 61, caCp: -19 }
    ],

    // ===== RESULTADOS DEL LUNES 19 DE OCTUBRE =====
    resultados: [
        { local: "Cardenales", scoreLocal: 7, visitante: "Navegantes", scoreVisitante: 11, fecha: "19 Oct 2026", innings: 9, ganador: "Reid Birlingmair", perdedor: "Abdiel Mendoza" }
    ],

    // ===== CALENDARIO - MARTES 20 DE OCTUBRE =====
    calendario: [
        { local: "Tiburones", visitante: "Leones", hora: "7:00 PM", transmision: "IVC / TVES", lugar: "Estadio Universitario", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Bravos", visitante: "Caribes", hora: "7:00 PM", transmision: "BYM Sport", lugar: "Estadio Nueva Esparta", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Águilas", visitante: "Tigres", hora: "7:00 PM", transmision: "Baseball", lugar: "Estadio Luis Aparicio", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null }
    ],

    // ===== NOTICIES =====
    noticias: [
        {
            id: 1,
            titulo: "Navegantes golea a Cardenales 11-7 en el inicio de la semana",
            resumen: "Los navegantes consiguieron su primera victoria de la temporada con un contundente 11-7 sobre los cardenales en Barquisimeto.",
            fecha: "19 Oct 2026",
            tag: "RESULTADOS",
            imagen: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
            contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria de la temporada 2026-2027 al derrotar 11-7 a Cardenales de Lara este lunes 19 de octubre.</p><p>Reid Birlingmair se llevó la victoria mientras que Abdiel Mendoza cargó con la derrota. Con este resultado, los navegantes mejoraron a 1-6 mientras los cardenales cayeron a 4-2.</p><div class=\"articulo-cta\">💬 ¿Crees que Navegantes remontará la temporada? ¡Déjanos tu opinión!</div>"
        },
        {
            id: 2,
            titulo: "Tigres y Bravos lideran la tabla con victorias consecutivas",
            resumen: "Ambos equipos mantienen rachas de 4 victorias y se disputan el liderato de la LVBP.",
            fecha: "20 Oct 2026",
            tag: "TEMPORADA",
            imagen: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
            contenido: "<p><strong>LVBP.-</strong> Tigres de Aragua y Bravos de Margarita se mantienen en la cima de la tabla de posiciones con rachas ganadoras de 4 juegos consecutivos.</p><p>Los tigres lideran con récord de 5-1 (.833) mientras los bravos los siguen de cerca con 4-1 (.800). Hoy martes 20 de octubre se juegan 3 partidos que podrían mover la tabla.</p><div class=\"articulo-cta\">🔗 Ver el calendario completo en nuestra sección de Juegos.</div>"
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
            { nombre: "Por definir", valor: 0 },
            { nombre: "Por definir", valor: 0 },
            { nombre: "Por definir", valor: 0 }
        ],
        average: [
            { nombre: "Por definir", valor: ".000" },
            { nombre: "Por definir", valor: ".000" },
            { nombre: "Por definir", valor: ".000" }
        ],
        hr: [
            { nombre: "Por definir", valor: 0 },
            { nombre: "Por definir", valor: 0 },
            { nombre: "Por definir", valor: 0 }
        ],
        era: [
            { nombre: "Reid Birlingmair (MAG)", valor: "0.00" },
            { nombre: "Por definir", valor: "0.00" },
            { nombre: "Por definir", valor: "0.00" }
        ]
    }
};
