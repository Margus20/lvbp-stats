// ============================================
// APP.JS - VERSIÓN DE DIAGNÓSTICO
// Muestra en pantalla qué está fallando
// ============================================

// Función para mostrar mensajes en pantalla
function mostrarMensaje(texto, tipo) {
    const div = document.createElement('div');
    const colores = {
        'exito': 'background: #00cc00; color: white;',
        'error': 'background: #cc0000; color: white;',
        'info': 'background: #0066cc; color: white;',
        'advertencia': 'background: #ff9900; color: black;'
    };
    div.style.cssText = colores[tipo] + ' padding: 15px; margin: 10px; border-radius: 8px; font-family: monospace; font-size: 14px; border: 2px solid rgba(0,0,0,0.3);';
    div.innerHTML = texto;
    document.body.insertBefore(div, document.body.firstChild);
}

// ============================================
// FASE 1: Verificar que el script se está ejecutando
// ============================================
mostrarMensaje('✅ <strong>FASE 1:</strong> El archivo app.js se está ejecutando correctamente', 'exito');

// ============================================
// FASE 2: Intentar importar cada módulo por separado
// ============================================
async function diagnosticar() {
    const modulos = [
        { nombre: 'utils.js', ruta: './utils.js' },
        { nombre: 'compartir.js', ruta: './compartir.js' },
        { nombre: 'render.js', ruta: './render.js' },
        { nombre: 'config.js', ruta: '../datos/config.js' },
        { nombre: 'equipos.js', ruta: '../datos/equipos.js' },
        { nombre: 'canales.js', ruta: '../datos/canales.js' },
        { nombre: 'posiciones.js', ruta: '../datos/posiciones.js' },
        { nombre: 'resultados.js', ruta: '../datos/resultados.js' },
        { nombre: 'calendario.js', ruta: '../datos/calendario.js' },
        { nombre: 'noticias.js', ruta: '../datos/noticias.js' },
        { nombre: 'lideres.js', ruta: '../datos/lideres.js' },
        { nombre: 'publicidad.js', ruta: '../datos/publicidad.js' }
    ];

    const resultados = [];

    for (const modulo of modulos) {
        try {
            const mod = await import(modulo.ruta);
            resultados.push({ nombre: modulo.nombre, estado: '✅ OK', mod: mod });
        } catch (error) {
            resultados.push({ nombre: modulo.nombre, estado: '❌ ERROR', error: error.message });
        }
    }

    // Mostrar resultados en pantalla
    let html = '<strong>🔍 DIAGNÓSTICO DE MÓDULOS:</strong><br><br>';
    resultados.forEach(r => {
        html += `${r.estado} <strong>${r.nombre}</strong>`;
        if (r.error) {
            html += `<br><small style="opacity: 0.9;">Error: ${r.error}</small>`;
        }
        html += '<br>';
    });

    const hayErrores = resultados.some(r => r.estado.includes('ERROR'));
    mostrarMensaje(html, hayErrores ? 'error' : 'exito');

    // Si todo está bien, intentar renderizar
    if (!hayErrores) {
        try {
            const { renderPosiciones, renderNoticias, renderResultados, renderCalendario, renderLideres, renderPublicidad } = await import('./render.js');
            const { compartirEnRed, compartirSeccion } = await import('./compartir.js');
            const { NOTICIAS } = await import('../datos/noticias.js');

            window.compartirEnRed = compartirEnRed;
            window.compartirSeccion = compartirSeccion;

            renderPosiciones();
            renderNoticias();
            renderResultados();
            renderCalendario();
            renderLideres();
            renderPublicidad();

            mostrarMensaje('✅ <strong>FASE 3:</strong> Todos los datos se renderizaron correctamente', 'exito');
        } catch (error) {
            mostrarMensaje('❌ <strong>FASE 3:</strong> Error al renderizar: ' + error.message, 'error');
        }
    }
}

// Ejecutar diagnóstico
diagnosticar();

// ============================================
// MENÚ HAMBURGUESA
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("navMenu").classList.toggle("activo");
        });
    }
});
