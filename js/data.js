// ============================================
// DATOS DE LA LVBP - TEMPORADA 2026-2027
// ============================================

const DATOS = {
    
    // ===== EQUIPOS =====
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

    // ===== CANALES DE TV =====
    canales: [
        { nombre: "IVC", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/ivctv.png" },
        { nombre: "Televen", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/televentv.png" },
        { nombre: "BYM Sport", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/bymtv.png" },
        { nombre: "Baseball", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/baseballtv.png" },
        { nombre: "Venevisión", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/venevisiontv.png" },
        { nombre: "Venezolana TV", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/venezolanatv.png" },
        { nombre: "TVES", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/tves.png" },
        { nombre: "Meridiano TV", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/meridianotv.png" },
        { nombre: "YouTube", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/youtubetv.png" },
        { nombre: "X", logo: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/x-logo.png", esIcono: true }
    ],

    // ===== POSICIONES ACTUALIZADAS =====
    posiciones: [
        { nombre: "Tigres de Aragua", jj: 6, jg: 5, jp: 1, racha: "G4" },
        { nombre: "Bravos de Margarita", jj: 5, jg: 4, jp: 1, racha: "G4" },
        { nombre: "Caribes de Anzoátegui", jj: 6, jg: 4, jp: 2, racha: "P1" },
        { nombre: "Cardenales de Lara", jj: 6, jg: 4, jp: 2, racha: "P1" },
        { nombre: "Águilas del Zulia", jj: 6, jg: 2, jp: 4, racha: "P3" },
        { nombre: "Leones del Caracas", jj: 6, jg: 2, jp: 4, racha: "G1" },
        { nombre: "Tiburones de La Guaira", jj: 6, jg: 2, jp: 4, racha: "P4" },
        { nombre: "Navegantes del Magallanes", jj: 7, jg: 1, jp: 6, racha: "G1" }
    ],

    // ===== RESULTADOS DEL LUNES 19 DE OCTUBRE =====
    resultados: [
        { local: "Cardenales", scoreLocal: 7, visitante: "Magallanes", scoreVisitante: 11, fecha: "19 Oct 2026", innings: 9 }
    ],

    // ===== CALENDARIO - SOLO MARTES 20 DE OCTUBRE =====
    calendario: [
        { local: "Tiburones", visitante: "Leones", hora: "7:00 PM", transmision: "IVC / TVES", lugar: "Estadio Universitario", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Bravos", visitante: "Caribes", hora: "7:00 PM", transmision: "BYM Sport", lugar: "Estadio Nueva Esparta", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null },
        { local: "Águilas", visitante: "Tigres", hora: "7:00 PM", transmision: "Baseball", lugar: "Estadio Luis Aparicio", fecha: "20 Oct 2026", enVivo: false, finalizado: false, inning: null, scoreLocal: null, scoreVisitante: null }
    ],

    // ===== NOTICIAS =====
    noticias: [
        {
            id: 1,
            titulo: "Magallanes golea a Cardenales 11-7 en el inicio de la semana",
            resumen: "Los navegantes consiguieron su primera victoria de la temporada con un contundente 11-7 sobre los cardenales en Barquisimeto.",
            fecha: "19 Oct 2026",
            tag: "RESULTADOS",
            imagen: "https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png",
            contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria de la temporada al derrotar 11-7 a Cardenales de Lara este lunes 19 de octubre.</p><div class=\"articulo-cta\">💬 ¿Crees que Magallanes remontará la temporada? ¡Déjanos tu opinión!</div>"
        }
    ],

    // ===== PUBLICIDAD =====
    publicidad: [
        { imagen: "https://i.postimg.cc/Ls63NHxv/1000419154.jpg", alt: "Publicidad" },
        { imagen: "https://i.postimg.cc/gJp0nMtD/1792281708726-11zon.jpg", alt: "Publicidad" }
    ],

    // ===== LÍDERES ESTADÍSTICOS =====
    lideres: {
        carreras: [{ nombre: "Por definir", valor: 0 }],
        average: [{ nombre: "Por definir", valor: ".000" }],
        hr: [{ nombre: "Por definir", valor: 0 }],
        era: [{ nombre: "Por definir", valor: "0.00" }]
    }
};
