// ============================================
// FUNCIONES AUXILIARES
// ============================================

function calcularPCT(jg, jp) {
    if ((jg + jp) === 0) return ".000";
    return "." + Math.round((jg / (jg + jp)) * 1000).toString().padStart(3, '0');
}

function calcularDIF(jg, jp, liderJG, liderJP) {
    const diff = ((liderJG - jg) + (jp - liderJP)) / 2;
    return diff > 0 ? diff.toFixed(1) : "-";
}

function getEquipo(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    if (nombreLower.includes('navegantes') || nombreLower.includes('magallanes')) {
        return EQUIPOS.find(eq => eq.abrev === 'MAG');
    }
    let equipo = EQUIPOS.find(eq => eq.nombre.toLowerCase() === nombreLower || eq.nombreCorto.toLowerCase() === nombreLower);
    if (!equipo) {
        equipo = EQUIPOS.find(eq => nombreLower.includes(eq.nombreCorto.toLowerCase()));
    }
    return equipo;
}

function getCanal(nombre) {
    const nombreLower = nombre.toLowerCase().trim();
    return CANALES.find(c => c.nombre.toLowerCase() === nombreLower || (nombreLower === 'x' && c.nombre === 'X'));
}

function getLogo(nombre) { const eq = getEquipo(nombre); return eq ? eq.logo : ''; }
function getColor(nombre) { const eq = getEquipo(nombre); return eq ? eq.color : '#cccccc'; }
function getColorTexto(nombre) { const eq = getEquipo(nombre); return eq ? eq.colorTexto : '#ffffff'; }

// ✅ GENERA TÍTULOS AUTOMÁTICAMENTE SEGÚN LOS DATOS
function generarTituloResultados() {
    if (RESULTADOS.length === 0) return "SIN RESULTADOS RECIENTES";
    const ultimaFecha = RESULTADOS[RESULTADOS.length - 1].fecha;
    return "RESULTADOS - " + ultimaFecha.toUpperCase();
}

function generarTituloCalendario() {
    if (CALENDARIO.length === 0) return "SIN JUEGOS PROGRAMADOS";
    const fechasUnicas = [...new Set(CALENDARIO.map(j => j.fecha))];
    if (fechasUnicas.length === 1) {
        return "JORNADA - " + fechasUnicas[0].toUpperCase();
    }
    return "PRÓXIMOS JUEGOS";
}

function renderizarCanales(transmision) {
    if (!transmision) return '';
    const nombres = transmision.split('/').map(n => n.trim());
    const logos = nombres.map(nombre => {
        const canal = getCanal(nombre);
        if (canal) {
            const claseExtra = canal.esIcono ? 'es-icono' : '';
            return `<img src="${canal.logo}" alt="${nombre}" class="logo-canal-cal ${claseExtra}" title="${nombre}">`;
        }
        return `<span class="canal-texto">${nombre}</span>`;
    });
    return logos.join(' <span class="separador-canal">+</span> ');
}
