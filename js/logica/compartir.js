// ============================================
// BOTONES DE REDES SOCIALES
// Archivo independiente - no se afecta con otros cambios
// ============================================

function generarTextoSeccion(tipo) {
    let texto = "";
    const url = "\n\n🔗 Ver más: " + CONFIG.urlPagina;
    
    if (tipo === 'posiciones') {
        texto = "🏆 *TABLA DE POSICIONES LVBP* 🏆\n";
        const lider = POSICIONES[0];
        POSICIONES.forEach((pos, i) => {
            const pct = calcularPCT(pos.jg, pos.jp);
            const dif = calcularDIF(pos.jg, pos.jp, lider.jg, lider.jp);
            texto += `${i + 1}. ${pos.nombre} (${pos.jg}-${pos.jp}) ${pct} (DIF: ${dif})\n`;
        });
    } else if (tipo === 'resultados') {
        texto = "⚾ *" + generarTituloResultados() + "*\n";
        RESULTADOS.forEach(r => { texto += `${r.visitante} ${r.scoreVisitante} - ${r.scoreLocal} ${r.local} (Final)\n`; });
    } else if (tipo === 'calendario') {
        texto = "📅 *" + generarTituloCalendario() + "*\n";
        CALENDARIO.forEach(j => {
            const estado = j.finalizado ? "✅ FINAL" : (j.enVivo ? "🔴 EN VIVO" : "🕐 Programado");
            texto += `${j.visitante} vs ${j.local} - ${j.hora} [${estado}]\n`;
        });
    } else if (tipo === 'noticia') {
        const noticia = NOTICIAS.find(n => n.id === 1);
        if (noticia) texto = `📰 *${noticia.titulo}*\n\n${noticia.resumen}`;
    }
    return texto + url;
}

function compartirEnRed(red, tipo, textoCustom = '') {
    const texto = textoCustom || generarTextoSeccion(tipo);
    const textoCodificado = encodeURIComponent(texto);
    const urlCodificada = encodeURIComponent(CONFIG.urlPagina);
    let urlCompartir = "";
    switch(red) {
        case 'whatsapp': urlCompartir = `https://wa.me/?text=${textoCodificado}`; break;
        case 'telegram': urlCompartir = `https://t.me/share/url?url=${urlCodificada}&text=${textoCodificado}`; break;
        case 'twitter': urlCompartir = `https://twitter.com/intent/tweet?text=${textoCodificado}`; break;
        case 'facebook': urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}`; break;
    }
    if (urlCompartir) window.open(urlCompartir, '_blank', 'width=600,height=400');
}

function compartirSeccion(tipo, red) { compartirEnRed(red, 'custom', generarTextoSeccion(tipo)); }
