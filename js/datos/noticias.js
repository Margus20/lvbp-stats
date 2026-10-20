// ============================================
// NOTICIAS
// SOLO agrega las noticias que TÚ quieras publicar
// El sistema NO inventa noticias
// Si no hay noticias, deja el array vacío: export const NOTICIAS = [];
// ============================================

import { CONFIG } from './config.js';

export const NOTICIAS = [
    {
        id: 1,
        titulo: "Magallanes derrota a Cardenales 11-7 y suma su primera victoria",
        resumen: "Los navegantes consiguieron su primera victoria de la temporada al vencer 11-7 a los cardenales en Barquisimeto.",
        fecha: "19 Oct 2026",
        tag: "RESULTADOS",
        imagen: CONFIG.logoPagina,
        contenido: "<p><strong>LARA.-</strong> Navegantes del Magallanes logró su primera victoria de la campaña al derrotar 11-7 a Cardenales de Lara, rompiendo una racha de 6 derrotas consecutivas.</p>"
    }
];
