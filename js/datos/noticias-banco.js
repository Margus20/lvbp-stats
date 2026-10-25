// ============================================
// BANCO DE NOTICIAS (Biblioteca)
// Aquí guardas TODAS las noticias que creas.
// El bot tomará las más recientes de aquí automáticamente.
// ============================================

import { CONFIG } from './config.js';

export const BANCO_NOTICIAS = [
    {
        id: 1,
        titulo: "Magallanes derrota a Cardenales 11-7 y suma su primera victoria",
        resumen: "Los navegantes consiguieron su primera victoria de la temporada al vencer 11-7 a los cardenales en Barquisimeto.",
        fecha: "19 Oct 2026",
        tag: "RESULTADOS",
        imagen: CONFIG.logoPagina, // Puedes cambiar esto por la ruta de tu imagen, ej: "img/noticias/magallanes.jpg"
        contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria de la campaña al derrotar 11-7 a Cardenales de Lara, rompiendo una racha de 6 derrotas consecutivas.</p>"
    }
    // Aquí irás agregando las nuevas noticias hacia abajo, separadas por coma.
];
