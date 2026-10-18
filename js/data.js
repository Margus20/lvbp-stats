// ============================================
// DATOS DE LA LVBP - TEMPORADA 2026-2027
// ============================================

const DATOS = {
    
    // ===== EQUIPOS =====
    equipos: [
        { nombre: "Caribes de Anzoátegui", nombreCorto: "Caribes", abrev: "ANZ", logo: "https://i.postimg.cc/0j685n5D/image-search-1791393733450-11zon.webp", claseFila: "fila-caribes", color: "#F2F2F2", colorTexto: "#2c2c2c" },
        { nombre: "Tigres de Aragua", nombreCorto: "Tigres", abrev: "ARA", logo: "https://i.postimg.cc/0QRG0W3n/1791393470300-11zon.jpg", claseFila: "fila-tigres", color: "#042959", colorTexto: "#ffffff" },
        { nombre: "Cardenales de Lara", nombreCorto: "Cardenales", abrev: "LAR", logo: "https://i.postimg.cc/HLpzqP32/image-search-1791395610326-11zon.jpg", claseFila: "fila-cardenales", color: "#D90D1E", colorTexto: "#ffffff" },
        { nombre: "Bravos de Margarita", nombreCorto: "Bravos", abrev: "MAR", logo: "https://i.postimg.cc/PJh5yYdY/1791395148443-11zon.jpg", claseFila: "fila-bravos", color: "#56A6A6", colorTexto: "#ffffff" },
        { nombre: "Águilas del Zulia", nombreCorto: "Águilas", abrev: "ZUL", logo: "https://i.postimg.cc/J4wxQnwX/1791392132263-11zon.jpg", claseFila: "fila-aguilas", color: "#F24607", colorTexto: "#ffffff" },
        { nombre: "Tiburones de La Guaira", nombreCorto: "Tiburones", abrev: "LGU", logo: "https://i.postimg.cc/J7Hm024y/image-search-1791382706892.png", claseFila: "fila-tiburones", color: "#2104D9", colorTexto: "#ffffff" },
        { nombre: "Leones del Caracas", nombreCorto: "Leones", abrev: "CAR", logo: "https://i.postimg.cc/Kjrw7g8p/image-search-1791396859705.jpg", claseFila: "fila-leones", color: "#082040", colorTexto: "#ffffff" },
        { nombre: "Navegantes del Magallanes", nombreCorto: "Magallanes", abrev: "MAG", logo: "https://i.postimg.cc/ydNH8j6v/1791396497437-11zon.jpg", claseFila: "fila-magallanes", color: "#5BA9D9", colorTexto: "#ffffff" }
    ],

    // ===== POSICIONES =====
    posiciones: [
        { nombre: "Caribes de Anzoátegui", jj: 5, jg: 4, jp: 1, racha: "G1" },
        { nombre: "Tigres de Aragua", jj: 5, jg: 4, jp: 1, racha: "G1" },
        { nombre: "Cardenales de Lara", jj: 4, jg: 3, jp: 1, racha: "G1" },
        { nombre: "Bravos de Margarita", jj: 4, jg: 3, jp: 1, racha: "G1" },
        { nombre: "Águilas del Zulia", jj: 5, jg: 2, jp: 3, racha: "P1" },
        { nombre: "Tiburones de La Guaira", jj: 5, jg: 2, jp: 3, racha: "P1" },
        { nombre: "Leones del Caracas", jj: 5, jg: 1, jp: 4, racha: "P1" },
        { nombre: "Navegantes del Magallanes", jj: 5, jg: 0, jp: 5, racha: "P5" }
    ],

    // ===== RESULTADOS DEL SÁBADO 17 DE OCTUBRE =====
    // Datos oficiales de stats.lvbp.com
    // "local" = equipo de casa (va a la DERECHA)
    // "visitante" = equipo visitante (va a la IZQUIERDA)
    resultados: [
        { local: "Cardenales", scoreLocal: 7, visitante: "Magallanes", scoreVisitante: 4, fecha: "17 Oct", innings: 9, pitcherGanador: "Robinson Hernández", pitcherPerdedor: "Amílcar Chirinos" },
        { local: "Caribes", scoreLocal: 9, visitante: "Leones", scoreVisitante: 8, fecha: "17 Oct", innings: 9, pitcherGanador: "Sebastián Perrone", pitcherPerdedor: "Mikell Manzano" },
        { local: "Tiburones", scoreLocal: 6, visitante: "Tigres", scoreVisitante: 7, fecha: "17 Oct", innings: 10, pitcherGanador: "Carlos Guzmán", pitcherPerdedor: "Emerson Martínez" },
        { local: "Águilas", scoreLocal: 6, visitante: "Bravos", scoreVisitante: 7, fecha: "17 Oct", innings: 9, pitcherGanador: "Luis Cohen", pitcherPerdedor: "Dylan Covey" }
    ],

    // ===== JORNADA DE HOY - DOMINGO 18 DE OCTUBRE =====
    // Datos oficiales de stats.lvbp.com
    // "local" = equipo de casa (va a la DERECHA)
    // "visitante" = equipo visitante (va a la IZQUIERDA)
    calendario: [
        { 
            local: "Tigres", 
            visitante: "Tiburones", 
            hora: "1:00 PM", 
            transmision: "📺 Venevisión",
            lugar: "Estadio José Pérez Colmenares", 
            fecha: "18 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        },
        { 
            local: "Caribes", 
            visitante: "Leones", 
            hora: "4:00 PM", 
            transmision: "📺 Televen",
            lugar: "Estadio Alfonso Carrasquel", 
            fecha: "18 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        },
        { 
            local: "Águilas", 
            visitante: "Bravos", 
            hora: "5:00 PM", 
            transmision: "📺 IVC",
            lugar: "Estadio Luis Aparicio", 
            fecha: "18 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        },
        { 
            local: "Magallanes", 
            visitante: "Cardenales", 
            hora: "7:00 PM", 
            transmision: "📺 BYM Sport",
            lugar: "Estadio José Bernardo Pérez", 
            fecha: "18 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        }
    ],

    // ===== NOTICIAS =====
    noticias: [
        {
            id: 1,
            titulo: "Cardenales hunde más al Magallanes y extiende su mal momento en la LVBP",
            resumen: "Cardenales de Lara derrotó 7-4 a los Navegantes del Magallanes, extendiendo la racha negativa de la nave turca a 0-5.",
            fecha: "17 Oct 2026",
            tag: "RESULTADOS",
            imagen: "https://i.postimg.cc/d3h5b9Rh/1000419499.jpg",
            contenido: "<p><strong>CARACAS.-</strong> Cardenales de Lara volvió a demostrar su solidez en el terreno de juego al derrotar 7-4 a los Navegantes del Magallanes, resultado que extiende la racha negativa de la nave turca y consolida el buen momento del conjunto crepuscular en el inicio de la temporada.</p><p>Con este triunfo, Lara mejora su registro a 3-1, manteniéndose firmemente en la parte alta de la tabla de posiciones y levantando vuelo en el campeonato. Por su parte, el equipo eléctrico continúa sin conocer la victoria y cae a un preocupante récord de 0-5, hundiéndose en el fondo de la clasificación.</p><p><strong>Las cifras del encuentro</strong></p><p>La ofensiva de Cardenales desplegó un ataque oportuno con 12 imparables sin cometer pifias a la defensiva (7 R, 12 H, 0 E). Magallanes conectó 11 hits y anotó 4 carreras, pero un error a la defensiva y el pitcheo en momentos clave terminaron por costarle el compromiso (4 R, 11 H, 1 E).</p><p>En el apartado del pitcheo:</p><p>• <strong>Pitcher Ganador:</strong> Robinson Hernández</p><p>• <strong>Pitcher Perdedor:</strong> Amílcar Chirinos</p><p>Magallanes requerirá de ajustes urgentes en su cuerpo de lanzadores y en la efectividad con corredores en posición de anotar para revertir esta racha adversa en sus próximos compromisos.</p><div class=\"articulo-cta\"> ¿Crees que Magallanes logrará romper la racha negativa en su próximo partido? ¡Déjanos tu opinión!</div>"
        },
        {
            id: 2,
            titulo: "¿Alarma en la nave? Magallanes sigue sin ganar y se hunde en el fondo de la LVBP",
            resumen: "Con cinco jornadas disputadas, Navegantes del Magallanes marcha en el sótano de la tabla con preocupante registro de 0-5.",
            fecha: "17 Oct 2026",
            tag: "ANÁLISIS",
            imagen: "https://i.postimg.cc/7Pn1L0RW/1000419348.jpg",
            contenido: "<p><strong>CARACAS.-</strong> La temporada de la Liga Venezolana de Béisbol Profesional (LVBP) apenas comienza, pero las alarmas ya empiezan a encenderse en las filas de los Navegantes del Magallanes. Con cinco jornadas disputadas, el equipo azul marcha en el sótano de la tabla de posiciones con un preocupante registro de 0-5, mientras que Leones del Caracas tampoco la pasa bien tras encajar su cuarta derrota del torneo.</p><p>La nave turca no ha podido descifrar la fórmula ganadora en esta primera semana de acción, acumulando una racha negativa de cinco reveses consecutivos que los mantiene como el único equipo de la liga que aún no conoce la victoria (.000 PCT), ubicándose a 4.0 juegos de la cima.</p><p>Con el calendario avanzando a ritmo acelerado, Magallanes está obligado a ajustar piezas de inmediato en su pitcheo y bateo oportuno para no ceder más terreno en la tabla de posiciones.</p><div class=\"articulo-cta\">💬 ¿Crees que Magallanes podrá reaccionar esta semana o la crisis se extenderá? ¡Déjanos tu comentario y comparte la nota!</div>"
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
            { nombre: "Robinson Hernández (LAR)", valor: "0.00" },
            { nombre: "Luis Cohen (MAR)", valor: "0.00" },
            { nombre: "Sebastián Perrone (ANZ)", valor: "0.00" }
        ]
    }
};
