// ============================================
// DATOS DE LA LVBP - TEMPORADA 2026-2027
// ============================================
// INSTRUCCIONES: Solo edita los valores
// NO cambies los nombres de las propiedades
// ============================================

const DATOS = {
    
    // ===== EQUIPOS (NO SE MODIFICA) =====
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

    // ===== POSICIONES (EDITAR DIARIO) =====
    posiciones: [
        { nombre: "Caribes de Anzoátegui", jj: 4, jg: 3, jp: 1, racha: "G1" },
        { nombre: "Tigres de Aragua", jj: 4, jg: 3, jp: 1, racha: "G2" },
        { nombre: "Cardenales de Lara", jj: 3, jg: 2, jp: 1, racha: "G1" },
        { nombre: "Bravos de Margarita", jj: 3, jg: 2, jp: 1, racha: "G2" },
        { nombre: "Águilas del Zulia", jj: 4, jg: 2, jp: 2, racha: "P1" },
        { nombre: "Tiburones de La Guaira", jj: 4, jg: 2, jp: 2, racha: "P2" },
        { nombre: "Leones del Caracas", jj: 4, jg: 1, jp: 3, racha: "P2" },
        { nombre: "Navegantes del Magallanes", jj: 4, jg: 0, jp: 4, racha: "P4" }
    ],

    // ===== RESULTADOS (EDITAR DIARIO) =====
    // IMPORTANTE: "local" = equipo de casa (va a la DERECHA)
    //             "visitante" = equipo visitante (va a la IZQUIERDA)
    resultados: [
        { local: "Leones", scoreLocal: 2, visitante: "Bravos", scoreVisitante: 9, fecha: "16 Oct", innings: 9 },
        { local: "Tiburones", scoreLocal: 4, visitante: "Caribes", scoreVisitante: 7, fecha: "16 Oct", innings: 9 },
        { local: "Magallanes", scoreLocal: 7, visitante: "Tigres", scoreVisitante: 8, fecha: "16 Oct", innings: 9 },
        { local: "Águilas", scoreLocal: 5, visitante: "Cardenales", scoreVisitante: 8, fecha: "16 Oct", innings: 9 }
    ],

    // ===== CALENDARIO (EDITAR DIARIO) =====
    // "local" = equipo de casa (va a la DERECHA)
    // "visitante" = equipo visitante (va a la IZQUIERDA)
    calendario: [
        { local: "Cardenales", visitante: "Magallanes", hora: "4:00 PM", transmision: "📺 IVC", lugar: "Estadio Antonio Herrera Gutiérrez", fecha: "17 Oct 2026" },
        { local: "Tiburones", visitante: "Tigres", hora: "6:00 PM", transmision: "📻 Baseball FM", lugar: "Estadio Universitario de La Guaira", fecha: "17 Oct 2026" },
        { local: "Caribes", visitante: "Leones", hora: "6:00 PM", transmision: " Televen", lugar: "Estadio Alfonso Chico Carrasquel", fecha: "17 Oct 2026" },
        { local: "Águilas", visitante: "Bravos", hora: "8:00 PM", transmision: " BYM Sport", lugar: "Estadio Luis Aparicio El Grande", fecha: "17 Oct 2026" }
    ],

    // ===== NOTICIAS (EDITAR CUANDO TENGAS NUEVAS) =====
    noticias: [
        {
            id: 1,
            titulo: "¿Alarma en la nave? Magallanes sigue sin ganar y se hunde en el fondo de la LVBP",
            resumen: "Con cuatro jornadas disputadas, Navegantes del Magallanes marcha en el sótano de la tabla con preocupante registro de 0-4.",
            fecha: "17 Oct 2026",
            tag: "ANÁLISIS",
            imagen: "https://i.postimg.cc/7Pn1L0RW/1000419348.jpg",
            contenido: "<p><strong>CARACAS.-</strong> La temporada de la Liga Venezolana de Béisbol Profesional (LVBP) apenas comienza, pero las alarmas ya empiezan a encenderse en las filas de los \"Eternos Rivales\". Con cuatro jornadas disputadas, Navegantes del Magallanes marcha en el sótano de la tabla de posiciones con un preocupante registro de 0-4, mientras que Leones del Caracas tampoco la pasa bien tras encajar su tercera derrota del torneo.</p><p>La nave turca no ha podido descifrar la fórmula ganadora en esta primera semana de acción, acumulando una racha negativa de cuatro reveses consecutivos que los mantiene como el único equipo de la liga que aún no conoce la victoria (.000 PCT), ubicándose a 3.0 juegos de la cima.</p><p><strong>Leones tropieza ante unos inspirados Bravos</strong></p><p>Por su parte, la afición melenuda sufrió un duro golpe este viernes 16 de octubre. Los Bravos de Margarita desplegaron una letal ofensiva para imponerse de forma contundente 9-2 sobre Leones del Caracas. Con este resultado, la tropa insular mejoró su marca a 2-1 para instalarse en el tercer lugar del torneo junto a Cardenales de Lara, mientras que el Caracas cayó al penúltimo peldaño de la clasificación con récord de 1-3.</p><p>En el otro extremo de la tabla, la contienda en la parte alta se mantiene al rojo vivo: Caribes de Anzoátegui y Tigres de Aragua comparten el liderato de la LVBP con balance de 3-1 (.750 PCT).</p><p>Con el calendario avanzando a ritmo acelerado, tanto turcos como melenudos están obligados a ajustar piezas de inmediato en su pitcheo y bateo oportuno para no ceder más terreno en la tabla de posiciones.</p><div class=\"articulo-cta\">💬 ¿Crees que Magallanes podrá reaccionar este fin de semana o la crisis se extenderá? ¡Déjanos tu comentario y comparte la nota!</div>"
        }
    ],

    // ===== PUBLICIDAD (EDITAR CUANDO CAMBIE) =====
    publicidad: [
        { imagen: "https://i.postimg.cc/Ls63NHxv/1000419154.jpg", alt: "Publicidad" }
    ],

    // ===== LÍDERES ESTADÍSTICOS (EDITAR SEMANAL) =====
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
            { nombre: "L. Escobar (MAR)", valor: "0.00" },
            { nombre: "Por definir", valor: 0.00 },
            { nombre: "Por definir", valor: 0.00 }
        ]
    }
};
