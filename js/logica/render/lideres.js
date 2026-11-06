import { LIDERES, obtenerMascota } from '../../datos/lideres.js';

export function renderLideres() {
    const categoriasAMostrar = {
        'contenedor-jonrones': 'jonrones', 'contenedor-average': 'average', 'contenedor-impulsadas': 'impulsadas',
        'contenedor-slugging': 'slugging', 'contenedor-ops': 'ops', 'contenedor-hits': 'hits',
        'contenedor-dobles': 'dobles', 'contenedor-triples': 'triples', 'contenedor-basesRobadas': 'basesRobadas',
        'contenedor-basesPorBolas': 'basesPorBolas', 'contenedor-ponchesBateo': 'ponchesBateo', 'contenedor-efectividad': 'efectividad',
        'contenedor-victorias': 'victorias', 'contenedor-salvados': 'salvados', 'contenedor-inningsLanzados': 'inningsLanzados',
        'contenedor-ponches': 'ponchesPitching', 'contenedor-hold': 'hold', 'contenedor-whip': 'whip', 'contenedor-averageContra': 'averageContra'
    };

    for (const [idContenedor, claveCategoria] of Object.entries(categoriasAMostrar)) {
        const contenedor = document.getElementById(idContenedor);
        if (!contenedor) continue;
        
        const lideres = LIDERES[claveCategoria];
        if (!lideres || lideres.length === 0) {
            contenedor.innerHTML = '<p style="color:#666; font-size:0.8rem; text-align:center;">Sin datos</p>';
            continue;
        }

        contenedor.innerHTML = '';
        lideres.forEach(lider => {
            const rutaMascota = obtenerMascota(lider.equipo);
            let nombreLimpio = lider.nombre.replace(/\s*(?:1B|2B|3B|SS|LF|CF|RF|C|DH|P)\s*(?=\(|$)/gi, ' ').replace(/\s+/g, ' ').trim();
            const item = document.createElement('div');
            item.className = 'item-lider';
            item.innerHTML = `<div class="posicion">#${lider.posicion}</div><img src="${rutaMascota}" alt="Mascota" class="mascota-img" onerror="this.src='mascotas/leo.jpg'"><div class="info-jugador"><span class="nombre" title="${nombreLimpio}">${nombreLimpio}</span></div><div class="valor">${lider.valor}</div>`;
            contenedor.appendChild(item);
        });
    }
}
