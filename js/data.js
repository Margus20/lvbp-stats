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
        { nombre: "Caribes de Anzoátegui", jj: 5, jg: 4, jp: 1, racha: "G2" },
        { nombre: "Tigres de Aragua", jj: 5, jg: 4, jp: 1, racha: "G3" },
        { nombre: "Cardenales de Lara", jj: 4, jg: 3, jp: 1, racha: "G2" },
        { nombre: "Bravos de Margarita", jj: 4, jg: 3, jp: 1, racha: "G3" },
        { nombre: "Águilas del Zulia", jj: 5, jg: 2, jp: 3, racha: "P2" },
        { nombre: "Tiburones de La Guaira", jj: 5, jg: 2, jp: 3, racha: "P3" },
        { nombre: "Leones del Caracas", jj: 5, jg: 2, jp: 3, racha: "G1" },
        { nombre: "Navegantes del Magallanes", jj: 5, jg: 0, jp: 5, racha: "P5" }
    ],

    // ===== RESULTADOS DE AYER =====
    resultados: [
        { local: "Leones", scoreLocal: 2, visitante: "Bravos", scoreVisitante: 9, fecha: "16 Oct", innings: 9 },
        { local: "Caribes", scoreLocal: 7, visitante: "Tiburones", scoreVisitante: 4, fecha: "16 Oct", innings: 9 },
        { local: "Magallanes", scoreLocal: 7, visitante: "Tigres", scoreVisitante: 8, fecha: "16 Oct", innings: 9 },
        { local: "Águilas", scoreLocal: 5, visitante: "Cardenales", scoreVisitante: 8, fecha: "16 Oct", innings: 9 }
    ],

    // ===== JORNADA DE HOY =====
    calendario: [
        { 
            local: "Cardenales", 
            visitante: "Magallanes", 
            hora: "4:00 PM", 
            transmision: "📺 IVC",
            lugar: "Estadio Antonio Herrera Gutiérrez", 
            fecha: "17 Oct 2026",
            enVivo: false,
            finalizado: true,
            inning: 9,
            scoreLocal: 7,
            scoreVisitante: 4
        },
        { 
            local: "Tiburones", 
            visitante: "Tigres", 
            hora: "6:00 PM", 
            transmision: "📻 Baseball FM",
            lugar: "Estadio Universitario de La Guaira", 
            fecha: "17 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        },
        { 
            local: "Caribes", 
            visitante: "Leones", 
            hora: "6:00 PM", 
            transmision: "📺 Televen",
            lugar: "Estadio Alfonso Chico Carrasquel", 
            fecha: "17 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        },
        { 
            local: "Águilas", 
            visitante: "Bravos", 
            hora: "8:00 PM", 
            transmision: "📺 BYM Sport",
            lugar: "Estadio Luis Aparicio El Grande", 
            fecha: "17 Oct 2026",
            enVivo: false,
            finalizado: false,
            inning: null,
            scoreLocal: null,
            scoreVisitante: null
        }
    ],

    // ===== NOTICIAS (2 NOTICIAS) =====
    noticias: [
        {
            id: 1,
            titulo: "Cardenales hunde más al Magallanes y extiende su mal momento en la LVBP",
            resumen: "Cardenales de Lara derrotó 7-4 a los Navegantes del Magallanes, extendiendo la racha negativa de la nave turca a 0-5.",
            fecha: "17 Oct 2026",
            tag: "RESULTADOS",
            imagen: "https://i.postimg.cc/d3h5b9Rh/1000419499.jpg",
            contenido: "<p><strong>CARACAS.-</strong> Cardenales de Lara volvió a demostrar su solidez en el terreno de juego al derrotar 7-4 a los Navegantes del Magallanes, resultado que extiende la racha negativa de la nave turca y consolida el buen momento del conjunto crepuscular en el inicio de la temporada.</p><p>Con este triunfo, Lara mejora su registro a 3-1, manteniéndose firmemente en la parte alta de la tabla de posiciones y levantando vuelo en el campeonato. Por su parte, el equipo eléctrico continúa sin conocer la victoria y cae a un preocupante récord de 0-5, hundiéndose en el fondo de la clasificación.</p><p><strong>Las cifras del encuentro</strong></p><p>La ofensiva de Cardenales desplegó un ataque oportuno con 12 imparables sin cometer pifias a la defensiva (7 R, 12 H, 0 E). Magallanes conectó 11 hits y anotó 4 carreras, pero un pecado a la defensiva y el pitcheo en momentos clave terminaron por costarle el compromiso (4 R, 11 H, 1 E).</p><p>En el apartado del pitcheo:</p><p>• <strong>Pitcher Ganador:</strong> Rob Hernández (1-0, 0.00 ERA)</p><p>• <strong>Pitcher Perdedor:</strong> Chirinos (0-1, 21.60 ERA)</p><p>• <strong>Juego Salvado:</strong> Gu Rodríguez (2, 0.00 ERA)</p><p>Magallanes requerirá de ajustes urgentes en su cuerpo de lanzadores y en la efectividad con corredores en posición de anotar para revertir esta racha adversa en sus próximos compromisos.</p><div class=\"articulo-cta\">💬 ¿Crees que Magallanes logrará romper la racha negativa en su próximo partido? ¡Déjanos tu opinión!</div>"
        },
        {
            id: 2,
            titulo: "¿Alarma en la nave? Magallanes sigue sin ganar y se hunde en el fondo de la LVBP",
            resumen: "Con cuatro jornadas disputadas, Navegantes del Magallanes marcha en el sótano de la tabla con preocupante registro de 0-4.",
            fecha: "17 Oct 2026",
            tag: "ANÁLISIS",
            imagen: "https://i.postimg.cc/7Pn1L0RW/1000419348.jpg",
            contenido: "<p><strong>CARACAS.-</strong> La temporada de la Liga Venezolana de Béisbol Profesional (LVBP) apenas comienza, pero las alarmas ya empiezan a encenderse en las filas de los \"Eternos Rivales\". Con cuatro jornadas disputadas, Navegantes del Magallanes marcha en el sótano de la tabla de posiciones con un preocupante registro de 0-4, mientras que Leones del Caracas tampoco la pasa bien tras encajar su tercera derrota del torneo.</p><p>La nave turca no ha podido descifrar la fórmula ganadora en esta primera semana de acción, acumulando una racha negativa de cuatro reveses consecutivos que los mantiene como el único equipo de la liga que aún no conoce la victoria (.000 PCT), ubicándose a 3.0 juegos de la cima.</p><p><strong>Leones tropieza ante unos inspirados Bravos</strong></p><p>Por su parte, la afición melenuda sufrió un duro golpe este viernes 16 de octubre. Los Bravos de Margarita desplegaron una letal ofensiva para imponerse de forma contundente 9-2 sobre Leones del Caracas. Con este resultado, la tropa insular mejoró su marca a 2-1 para instalarse en el tercer lugar del torneo junto a Cardenales de Lara, mientras que el Caracas cayó al penúltimo peldaño de la clasificación con récord de 1-3.</p><p>En el otro extremo de la tabla, la contienda en la parte alta se mantiene al rojo vivo: Caribes de Anzoátegui y Tigres de Aragua comparten el liderato de la LVBP con balance de 3-1 (.750 PCT).</p><p>Con el calendario avanzando a ritmo acelerado, tanto turcos como melenudos están obligados a ajustar piezas de inmediato en su pitcheo y bateo oportuno para no ceder más terreno en la tabla de posiciones.</p><div class=\"articulo-cta\">💬 ¿Crees que Magallanes podrá reaccionar este fin de semana o la crisis se extenderá? ¡Déjanos tu comentario y comparte la nota!</div>"
        }
    ],

    // ===== PUBLICIDAD (DOS ANUNCIOS) =====
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
            { nombre: "L. Escobar (MAR)", valor: "0.00" }
        ]
    }
};
