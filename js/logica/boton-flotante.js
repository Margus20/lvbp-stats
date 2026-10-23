console.log("🚀 Iniciando script del botón flotante...");

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM listo, creando botón flotante...");
    
    // 1. Crear el contenedor principal
    const contenedor = document.createElement('div');
    contenedor.className = 'boton-flotante-nav';
    
    // 2. Crear el menú de opciones
    const menu = document.createElement('div');
    menu.className = 'menu-flotante';
    menu.innerHTML = `
        <div class="menu-flotante-item" data-target="noticias">
            <i class="fas fa-newspaper"></i> <span>Noticias</span>
        </div>
        <div class="menu-flotante-item" data-target="posiciones">
            <i class="fas fa-trophy"></i> <span>Posiciones</span>
        </div>
        <div class="menu-flotante-item" data-target="resultados">
            <i class="fas fa-baseball-ball"></i> <span>Resultados</span>
        </div>
        <div class="menu-flotante-item" data-target="calendario">
            <i class="fas fa-calendar-alt"></i> <span>Calendario</span>
        </div>
        <div class="menu-flotante-item" data-target="estadisticas">
            <i class="fas fa-chart-bar"></i> <span>Estadísticas</span>
        </div>
        <div class="menu-flotante-separador"></div>
        <div class="menu-flotante-item" data-target="inicio">
            <i class="fas fa-arrow-up"></i> <span>Ir al inicio</span>
        </div>
    `;
    
    // 3. Crear el botón rojo principal
    const boton = document.createElement('button');
    boton.className = 'btn-flotante-principal';
    boton.innerHTML = '<i class="fas fa-bars"></i>';
    boton.setAttribute('aria-label', 'Menú de navegación');
    boton.setAttribute('title', 'Navegación rápida');
    
    // 4. Ensamblar y agregar a la página
    contenedor.appendChild(menu);
    contenedor.appendChild(boton);
    document.body.appendChild(contenedor);
    
    console.log("✅ Botón flotante agregado al HTML con éxito");

    let menuAbierto = false;
    
    function toggleMenu() {
        menuAbierto = !menuAbierto;
        if (menuAbierto) {
            menu.classList.add('visible');
            boton.classList.add('activo');
            boton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            menu.classList.remove('visible');
            boton.classList.remove('activo');
            boton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
    
    function navegarASeccion(targetId) {
        toggleMenu(); // Cerrar menú al hacer clic
        if (targetId === 'inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const seccion = document.getElementById(targetId);
        if (seccion) {
            const posicion = seccion.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: posicion - 20, behavior: 'smooth' });
        }
    }
    
    // Eventos de clic
    boton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    const items = menu.querySelectorAll('.menu-flotante-item');
    items.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const target = this.getAttribute('data-target');
            navegarASeccion(target);
        });
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (menuAbierto && !contenedor.contains(e.target)) {
            toggleMenu();
        }
    });
});
