// ============================================
// ORQUESTADOR PRINCIPAL
// Inicializa todo cuando la página carga
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            document.getElementById("navMenu").classList.toggle("activo");
        });
    }
    
    const formulario = document.getElementById("formulario-comentario");
    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();
            comentarios.push({
                autor: formulario.querySelector(".input-comentario").value,
                texto: formulario.querySelector(".textarea-comentario").value,
                fecha: new Date().toLocaleString("es-VE")
            });
            renderizarComentarios();
            formulario.reset();
        });
    }
    
    renderPosiciones();
    renderNoticias();
    renderResultados();
    renderCalendario();
    renderLideres();
    renderPublicidad();
    
    console.log("✅ LVBP al Día cargado correctamente");
});
