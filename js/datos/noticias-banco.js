// ============================================
// BANCO DE NOTICIAS (Biblioteca)
// Aquí guardas TODAS las noticias que creas.
// Cada noticia tiene una fechaPublicacion.
// El bot las publicará automáticamente ese día.
// ============================================

import { CONFIG } from './config.js';

export const BANCO_NOTICIAS = [
    {
        id: 1,
        titulo: "Magallanes derrota a Cardenales 11-7",
        resumen: "Los navegantes consiguieron su primera victoria de la temporada.",
        fechaCreacion: "19 Oct 2026",      // Cuando la escribiste
        fechaPublicacion: "19 Oct 2026",   // Cuando se publica (puede ser futura)
        tag: "RESULTADOS",
        imagen: CONFIG.logoPagina,
        contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria.</p>",
        esPrincipal: false  // Si es true, sale como noticia grande
    },
    
    // === AGREGA NUEVAS NOTICIAS AQUÍ ===
    // Ejemplo de noticia programada para el futuro:
    {
        id: 2,
        titulo: "H. Pérez conecta 5 jonrones en la temporada",
        resumen: "El jardinero de las Águilas lidera la liga de jonrones.",
        fechaCreacion: "25 Oct 2026",
        fechaPublicacion: "26 Oct 2026",  // Se publicará mañana automáticamente
        tag: "LÍDERES",
        imagen: CONFIG.logoPagina,  // Cambia por tu imagen: "img/noticias/perez.jpg"
        contenido: "<p>Héctor Pérez sigue imparable en la temporada.</p>",
        esPrincipal: true  // Esta será la noticia GRANDE del día 26
    },
    
    {
        id: 3,
        titulo: "Tiburones blanquea 5-0 a Leones",
        resumen: "Dominio total de los Tiburones en el Universitario.",
        fechaCreacion: "25 Oct 2026",
        fechaPublicacion: "27 Oct 2026",  // Se publicará el 27
        tag: "RESULTADOS",
        imagen: CONFIG.logoPagina,
        contenido: "<p>En el estadio Universitario, Tiburones dominó de principio a fin.</p>",
        esPrincipal: true
    }
    
    // Sigue agregando más noticias aquí...
    // El bot las publicará automáticamente en la fecha que pongas
];
