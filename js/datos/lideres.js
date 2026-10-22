// ============================================
// LÍDERES ESTADÍSTICOS - ACTUALIZACIÓN AUTOMÁTICA (SELENIUM)
// Actualizado: 2026-10-22 16:41:04
// ============================================

export const LIDERES = {
    jonrones: [
        {"posicion": 1, "nombre": "David Rodríguez1B", "equipo": "tigres", "valor": "8"},
        {"posicion": 2, "nombre": "# Yonny Hernández3B", "equipo": "cardenales", "valor": "6"},
        {"posicion": 3, "nombre": "* Símon MuzziottiRF", "equipo": "tiburones", "valor": "8"}
    ]
};

export const MASCOTAS = {
    'leones': 'mascotas/leo.jpg', 'navegantes': 'mascotas/capi.jpg',
    'tiburones': 'mascotas/tibu.jpg', 'tigres': 'mascotas/tigre.jpg',
    'aguilas': 'mascotas/agui.jpg', 'cardenales': 'mascotas/guarito.jpg',
    'caribes': 'mascotas/caribito.jpg', 'bravos': 'mascotas/bravin.jpg'
};

export function obtenerMascota(equipo) {
    return MASCOTAS[equipo.toLowerCase()] || 'mascotas/leo.jpg';
}
