import { NOTICIAS } from '../../datos/noticias.js';

export function renderNoticias() {
    const heroContainer = document.getElementById("hero-noticia-container");
    const containerSecundarias = document.getElementById("noticias-secundarias-container");
    if (!heroContainer || !containerSecundarias) return;

    const imagenRespaldo = "/lvbp-stats/img/noticias/lvbp-noticia.jpg";
    
    if (!NOTICIAS || NOTICIAS.length === 0) {
        heroContainer.innerHTML = `
            <div class="hero-imagen" style="position: relative; height: 400px; border-radius: 12px; overflow: hidden;">
                <img src="${imagenRespaldo}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;" alt="Respaldo">
                <div class="hero-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%); z-index: 2;"></div>
                <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua" style="position: absolute; top: 15px; right: 15px; width: 80px; height: auto; opacity: 0.4; z-index: 4; pointer-events: none;">
                <div class="hero-contenido" style="position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; padding: 30px;">
                    <h1 class="hero-titulo">Bienvenido a LVBP al Día</h1>
                    <p class="hero-fecha">Temporada 2026-2027</p>
                </div>
            </div>`;
        containerSecundarias.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No hay noticias publicadas</p>';
        return;
    }
    
    const noticiaPrincipal = NOTICIAS.find(n => n.esPrincipal) || NOTICIAS[0];
    
    heroContainer.innerHTML = `
        <div class="hero-imagen" style="position: relative; cursor: pointer; height: 400px; border-radius: 12px; overflow: hidden;" onclick="window.abrirArticulo(${noticiaPrincipal.id})">
            <img src="${noticiaPrincipal.imagen}" onerror="this.src='${imagenRespaldo}';" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;" alt="${noticiaPrincipal.titulo}">
            <div class="hero-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%); z-index: 2; pointer-events: none;"></div>
            <img src="https://raw.githubusercontent.com/Margus20/lvbp-stats/main/img/logo_pag.png" alt="LVBP al Día" class="hero-marca-agua" style="position: absolute; top: 15px; right: 15px; width: 80px; height: auto; opacity: 0.4; z-index: 4; pointer-events: none;">
            <div class="hero-contenido" style="position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; padding: 30px;">
                <h1 class="hero-titulo">${noticiaPrincipal.titulo}</h1>
                <p class="hero-fecha">${noticiaPrincipal.fecha}</p>
            </div>
        </div>`;
    
    containerSecundarias.innerHTML = '';
    const noticiasSecundarias = NOTICIAS.filter(n => n.id !== noticiaPrincipal.id).slice(0, 4);
    
    noticiasSecundarias.forEach(noticia => {
        const card = document.createElement("div");
        card.className = "noticia-secundaria-card";
        card.onclick = () => window.abrirArticulo(noticia.id);
        card.innerHTML = `
            <img src="${noticia.imagen}" alt="${noticia.titulo}" onerror="this.src='${imagenRespaldo}';" style="pointer-events: none; width: 100%; height: 100%; object-fit: cover;">
            <div class="noticia-secundaria-overlay" style="pointer-events: none;">
                <h4>${noticia.titulo}</h4>
                <div class="fecha">${noticia.fecha}</div>
            </div>`;
        containerSecundarias.appendChild(card);
    });
}
