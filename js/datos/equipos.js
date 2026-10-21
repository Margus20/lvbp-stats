// ============================================
// EQUIPOS DE LA LVBP - TEMPORADA 2026-2027
// ============================================

import { CONFIG } from './config.js';

export const EQUIPOS = [
    { 
        nombre: "Caribes de Anzoátegui", 
        nombreCorto: "Caribes", 
        abrev: "ANZ", 
        logo: CONFIG.repositorio + "caribes.png", 
        mascota: "mascotas/caribito.jpg", // 🆕 Agregado
        claseFila: "fila-caribes", 
        color: "#F2F2F2", 
        colorTexto: "#2c2c2c" 
    },
    { 
        nombre: "Tigres de Aragua", 
        nombreCorto: "Tigres", 
        abrev: "ARA", 
        logo: CONFIG.repositorio + "tigres.png", 
        mascota: "mascotas/tigre.jpg", // 🆕 Agregado
        claseFila: "fila-tigres", 
        color: "#042959", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Cardenales de Lara", 
        nombreCorto: "Cardenales", 
        abrev: "LAR", 
        logo: CONFIG.repositorio + "cardenales.png", 
        mascota: "mascotas/guarito.jpg", // 🆕 Agregado
        claseFila: "fila-cardenales", 
        color: "#D90D1E", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Bravos de Margarita", 
        nombreCorto: "Bravos", 
        abrev: "MAR", 
        logo: CONFIG.repositorio + "bravos.png", 
        mascota: "mascotas/bravin.jpg", // 🆕 Agregado
        claseFila: "fila-bravos", 
        color: "#56A6A6", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Águilas del Zulia", 
        nombreCorto: "Águilas", 
        abrev: "ZUL", 
        logo: CONFIG.repositorio + "aguilas.png", 
        mascota: "mascotas/agui.jpg", // 🆕 Agregado
        claseFila: "fila-aguilas", 
        color: "#F24607", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Tiburones de La Guaira", 
        nombreCorto: "Tiburones", 
        abrev: "LGU", 
        logo: CONFIG.repositorio + "tiburones.png", 
        mascota: "mascotas/tibu.jpg", // 🆕 Agregado
        claseFila: "fila-tiburones", 
        color: "#2104D9", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Leones del Caracas", 
        nombreCorto: "Leones", 
        abrev: "CAR", 
        logo: CONFIG.repositorio + "leones.png", 
        mascota: "mascotas/leo.jpg", // 🆕 Agregado
        claseFila: "fila-leones", 
        color: "#082040", 
        colorTexto: "#ffffff" 
    },
    { 
        nombre: "Navegantes del Magallanes", 
        nombreCorto: "Magallanes", 
        abrev: "MAG", 
        logo: CONFIG.repositorio + "magallanes.png", 
        mascota: "mascotas/capi.jpg", // 🆕 Agregado
        claseFila: "fila-magallanes", 
        color: "#5BA9D9", 
        colorTexto: "#ffffff" 
    }
];

// ============================================
// FUNCIONES DE AYUDA (Helpers)
// ============================================

// Buscar un equipo por su nombre corto o abreviatura
export function buscarEquipo(identificador) {
    return EQUIPOS.find(eq => 
        eq.nombreCorto.toLowerCase() === identificador.toLowerCase() || 
        eq.abrev.toLowerCase() === identificador.toLowerCase()
    );
}

// Obtener la ruta de la mascota de un equipo dado su nombre corto o abreviatura
export function obtenerMascota(identificador) {
    const equipo = buscarEquipo(identificador);
    return equipo ? equipo.mascota : "mascotas/leo.jpg"; // Retorna la del León por defecto si no encuentra
}
