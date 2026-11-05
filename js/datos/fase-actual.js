// ============================================
// CONFIGURACIÓN DE LA FASE ACTUAL DEL CAMPEONATO
// ============================================
// Este archivo controla qué fase del campeonato está activa.
// Para cambiar de fase en el futuro, solo modificaremos estos valores.

export const FASE_ACTUAL = {
    nombre: "Ronda Regular",
    fase: "ronda-regular",
    inicio: "2026-10-12",
    fin: "2026-12-27",
    siguiente: "Serie del Comodín",
    inicioSiguiente: "2026-12-29",
    equiposActivos: 8,
    totalJuegosPorEquipo: 56,
    mostrarColumnaJR: true,
    clasificadosDirectos: 4,
    equiposComodin: 2,
    esPlayoff: false,
    mostrarReglas: false,
    marcadorSerie: null
};
