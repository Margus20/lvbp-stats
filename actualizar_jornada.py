import json
import os
from datetime import datetime

# ============================================
# BOT DE ACTUALIZACIÓN DIARIA DE JORNADA
# ============================================
# Este script:
# 1. Lee calendario_banco.json (192 juegos)
# 2. Filtra SOLO los juegos de HOY
# 3. Genera calendario.js con el formato exacto
# ============================================

def obtener_fecha_hoy():
    """Devuelve la fecha de hoy en formato 'DD Mon YYYY' (ej: '26 Oct 2026')"""
    hoy = datetime.utcnow()
    meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
             'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return f"{hoy.day} {meses[hoy.month - 1]} {hoy.year}"

def cargar_calendario():
    """Carga el calendario desde calendario_banco.json"""
    ruta = 'calendario_banco.json'
    if not os.path.exists(ruta):
        print(f"❌ No se encontró {ruta}")
        return []
    
    with open(ruta, 'r', encoding='utf-8') as f:
        return json.load(f)

def filtrar_juegos_hoy(calendario, fecha_hoy):
    """Filtra SOLO juegos con fecha = hoy"""
    juegos_hoy = []
    for juego in calendario:
        if juego.get('fecha') == fecha_hoy:
            juegos_hoy.append(juego)
    return juegos_hoy

def generar_js(juegos, fecha_hoy):
    """Genera calendario.js con el formato EXACTO que usa la página"""
    if not juegos:
        return f'''export const CALENDARIO = [
    // No hay juegos programados para hoy ({fecha_hoy})
];
'''
    
    lines = []
    lines.append('export const CALENDARIO = [')
    
    for i, juego in enumerate(juegos):
        lines.append('    {')
        lines.append(f'        "fecha": "{juego.get("fecha", "")}",')
        lines.append(f'        "hora": "{juego.get("hora", "")}",')
        lines.append(f'        "visitante": "{juego.get("visitante", "")}",')
        lines.append(f'        "local": "{juego.get("local", "")}",')
        lines.append(f'        "lugar": "{juego.get("lugar", "")}",')
        lines.append(f'        "transmision": "{juego.get("transmision", "")}",')
        lines.append(f'        "enVivo": {str(juego.get("enVivo", False)).lower()},')
        lines.append(f'        "finalizado": {str(juego.get("finalizado", False)).lower()}')
        
        if i < len(juegos) - 1:
            lines.append('    },')
        else:
            lines.append('    }')
    
    lines.append('];')
    
    return '\n'.join(lines)

def guardar_calendario(contenido_js):
    """Guarda el archivo calendario.js"""
    ruta = 'js/datos/calendario.js'
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(contenido_js)
    print(f"✅ Archivo guardado: {ruta}")

def main():
    print("🤖 Bot de jornada iniciado...")
    
    fecha_hoy = obtener_fecha_hoy()
    print(f"📅 Fecha de hoy: {fecha_hoy}")
    
    calendario = cargar_calendario()
    print(f"📚 Total de juegos en el banco: {len(calendario)}")
    
    juegos_hoy = filtrar_juegos_hoy(calendario, fecha_hoy)
    print(f"🎯 Juegos programados para hoy: {len(juegos_hoy)}")
    
    if not juegos_hoy:
        print("️ No hay juegos programados para hoy")
    else:
        print(f"✅ Juegos seleccionados: {len(juegos_hoy)}")
        for j in juegos_hoy:
            print(f"   - {j.get('hora')}: {j.get('visitante')} @ {j.get('local')}")
    
    contenido = generar_js(juegos_hoy, fecha_hoy)
    guardar_calendario(contenido)
    print("🎉 Bot finalizado correctamente")

if __name__ == '__main__':
    main()
