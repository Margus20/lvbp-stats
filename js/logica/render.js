// ============================================
// RENDERIZAR NOTICIAS (HERO LIMPIO + SECUNDARIAS)
// ============================================
export function renderNoticias() {
    const heroContainer = document.getElementById("hero-noticia-container");
    const containerSecundarias = document.getElementById("noticias-secundarias-container");
    
    if (!heroContainer || !containerSecundarias) return;
    
    // ✅ IMAGEN DE RESPALDO (backup)
    const imagenRespaldo = "/lvbp-stats/img/noticias/lvbp-noticia.jpg";
    
    // Si no hay noticias, mostrar un hero de respaldo (también limpio)
    if (!NOTICIAS || NOTICIAS.length === 0) {
        heroContainer.innerHTML = `
            <div class="hero-imagen" style="background-image: url('${imagenRespaldo}');">
                <div class="hero-overlay"></div>
                <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua">
                <div class="hero-contenido">
                    <h1 class="hero-titulo">Bienvenido a LVBP al Día</h1>
                    <p class="hero-fecha">Temporada 2026-2027</p>
                </div>
            </div>`;
        containerSecundarias.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No hay noticias publicadas</p>';
        return;
    }
    
    // 1. Encontrar la noticia PRINCIPAL (la grande)
    const noticiaPrincipal = NOTICIAS.find(n => n.esPrincipal) || NOTICIAS[0];
    
    // 2. Renderizar el HERO dinámicamente
    // ✅ AJUSTE CLAVE: El onclick y cursor: pointer ahora están en el contenedor principal (.hero-imagen)
    // para que toda el área de la imagen sea clickable, no solo el texto.
    heroContainer.innerHTML = `
        <div class="hero-imagen" style="background-image: url('${noticiaPrincipal.imagen}'); cursor: pointer;" 
             onerror="this.style.backgroundImage='url(${imagenRespaldo})'"
             onclick="window.abrirArticulo(${noticiaPrincipal.id})">
            <div class="hero-overlay" style="pointer-events: none;"></div>
            <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua" style="pointer-events: none;">
            <div class="hero-contenido">
                <h1 class="hero-titulo">${noticiaPrincipal.titulo}</h1>
                <p class="hero-fecha">${noticiaPrincipal.fecha}</p>
            </div>
        </div>
    `;
    
    // 3. Renderizar las noticias secundarias (las que NO son la principal, máximo 4)
    containerSecundarias.innerHTML = '';
    const noticiasSecundarias = NOTICIAS.filter(n => n.id !== noticiaPrincipal.id).slice(0, 4);
    
    if (noticiasSecundarias.length === 0) {
        containerSecundarias.innerHTML = '<p style="text-align:center; color:#999; padding:20px; grid-column: 1/-1;">No hay más noticias para mostrar</p>';
    } else {
        noticiasSecundarias.forEach(noticia => {
            const card = document.createElement("div");
            card.className = "noticia-secundaria-card";
            card.onclick = () => window.abrirArticulo(noticia.id);
            
            // ✅ Tarjetas secundarias: SOLO titular y fecha
            card.innerHTML = `
                <img src="${noticia.imagen}" 
                     alt="${noticia.titulo}" 
                     onerror="this.src='${imagenRespaldo}'"
                     style="pointer-events: none;">
                <div class="noticia-secundaria-overlay" style="pointer-events: none;">
                    <h4>${noticia.titulo}</h4>
                    <div class="fecha">${noticia.fecha}</div>
                </div>
            `;
            containerSecundarias.appendChild(card);
        });
    }
}
