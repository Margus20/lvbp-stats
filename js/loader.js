// Loader para cargar datos desde JSON
const DataLoader = {
    equipos: null,
    posiciones: null,
    resultados: null,
    calendario: null,
    noticias: null,
    publicidad: null,

    async cargarDatos() {
        try {
            const [equipos, posiciones, resultados, calendario, noticias, publicidad] = await Promise.all([
                fetch('data/equipos.json').then(r => r.json()),
                fetch('data/posiciones.json').then(r => r.json()),
                fetch('data/resultados.json').then(r => r.json()),
                fetch('data/calendario.json').then(r => r.json()),
                fetch('data/noticias.json').then(r => r.json()),
                fetch('data/publicidad.json').then(r => r.json())
            ]);

            this.equipos = equipos;
            this.posiciones = posiciones;
            this.resultados = resultados;
            this.calendario = calendario;
            this.noticias = noticias;
            this.publicidad = publicidad;

            console.log('✅ Datos cargados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            return false;
        }
    },

    getEquipo(nombre) {
        const nombreLower = nombre.toLowerCase();
        return this.equipos.find(eq => 
            eq.nombre.toLowerCase().includes(nombreLower) || 
            eq.abrev.toLowerCase() === nombreLower ||
            nombreLower.includes(eq.abrev.toLowerCase())
        );
    },

    getLogo(nombre) {
        const eq = this.getEquipo(nombre);
        return eq ? eq.logo : '';
    },

    getColor(nombre) {
        const eq = this.getEquipo(nombre);
        return eq ? eq.color : '#cccccc';
    },

    getColorTexto(nombre) {
        const eq = this.getEquipo(nombre);
        return eq ? eq.colorTexto : '#ffffff';
    }
};
