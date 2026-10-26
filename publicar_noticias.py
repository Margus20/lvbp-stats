import json
from datetime import datetime
import os

# ============================================
# BOT DE PUBLICACIÓN AUTOMÁTICA DE NOTICIAS
# ============================================
# Este script:
# 1. Lee el banco de noticias (JSON) desde la raíz
# 2. Lee el archivo Evergreen (noticias atemporales)
# 3. Filtra las que tienen fechaPublicacion = HOY
# 4. Si no hay 5 noticias del día, completa con Evergreen
# 5. Selecciona 1 principal + 4 más recientes
# 6. Genera noticias.js automáticamente en js/datos/
# ============================================

def obtener_fecha_hoy():
    """Devuelve la fecha de hoy en formato 'DD Mon YYYY' (ej: '26 Oct 2026')"""
    hoy = datetime.utcnow()
    meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
             'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return f"{hoy.day} {meses[hoy.month - 1]} {hoy.year}"

def cargar_banco():
    """Carga el banco de noticias desde el JSON en la raíz del repositorio"""
    ruta = 'noticias-banco.json'
    if not os.path.exists(ruta):
        print(f"❌ No se encontró {ruta}")
        return []
    
    with open(ruta, 'r', encoding='utf-8') as f:
        return json.load(f)

def cargar_evergreen():
    """Carga las noticias Evergreen (atemporales) desde el JSON"""
    ruta = 'noticias-evergreen.json'
    if not os.path.exists(ruta):
        print(f"⚠️ No se encontró {ruta} (no hay noticias Evergreen)")
        return []
    
    with open(ruta, 'r', encoding='utf-8') as f:
        return json.load(f)

def filtrar_noticias_hoy(banco, fecha_hoy):
    """Filtra noticias con fechaPublicacion = hoy"""
    noticias_hoy = []
    for noticia in banco:
        if noticia.get('fechaPublicacion') == fecha_hoy:
            noticias_hoy.append(noticia)
    return noticias_hoy

def seleccionar_noticias(noticias_hoy, evergreen):
    """
    Selecciona hasta 5 noticias:
    1. Primero toma las del día (1 principal + hasta 4 secundarias)
    2. Si no llega a 5, completa con Evergreen
    """
    if not noticias_hoy and not evergreen:
        return []
    
    # Separar principales y secundarias del día
    principales_hoy = [n for n in noticias_hoy if n.get('esPrincipal', False)]
    secundarias_hoy = [n for n in noticias_hoy if not n.get('esPrincipal', False)]
    
    resultado = []
    
    # Paso 1: Agregar 1 principal del día (si existe)
    if principales_hoy:
        resultado.append(principales_hoy[0])
        print(f"   - ⭐ PRINCIPAL (día): {principales_hoy[0].get('titulo')}")
    
    # Paso 2: Agregar secundarias del día (hasta 4)
    secundarias_agregadas = 0
    for noticia in secundarias_hoy:
        if len(resultado) < 5:
            resultado.append(noticia)
            secundarias_agregadas += 1
            print(f"   -  Secundaria (día): {noticia.get('titulo')}")
    
    # Paso 3: Si no llegamos a 5, completar con Evergreen
    if evergreen and len(resultado) < 5:
        print("📚 Completando con noticias Evergreen...")
        evergreen_disponibles = [n for n in evergreen if n not in resultado]
        
        # Si no hay principal aún, buscar una en Evergreen
        if not principales_hoy:
            evergreen_principal = next((n for n in evergreen_disponibles if n.get('esPrincipal', False)), None)
            if evergreen_principal and len(resultado) < 5:
                resultado.append(evergreen_principal)
                print(f"   - ⭐ PRINCIPAL (Evergreen): {evergreen_principal.get('titulo')}")
                evergreen_disponibles.remove(evergreen_principal)
        
        # Agregar el resto de Evergreen como secundarias
        for noticia in evergreen_disponibles:
            if len(resultado) < 5:
                resultado.append(noticia)
                print(f"   - 📰 Secundaria (Evergreen): {noticia.get('titulo')}")
    
    # Si no hay principal pero hay noticias, marcar la primera como principal
    if not resultado:
        return []
    
    if not any(n.get('esPrincipal', False) for n in resultado):
        resultado[0]['esPrincipal'] = True
        print(f"   - ⚠️ Sin principal definida, se asignó: {resultado[0].get('titulo')}")
    
    return resultado[:5]  # Máximo 5 noticias

def escapar_string(texto):
    """Escapa comillas y saltos de línea para JavaScript"""
    if texto is None:
        return ""
    return str(texto).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '')

def generar_js(noticias):
    """Genera el contenido del archivo noticias.js"""
    if not noticias:
        return '''// ============================================
// NOTICIAS DEL DÍA
// Generado automáticamente por el bot
// Hoy no hay noticias programadas
// ============================================

export const NOTICIAS = [];
'''
    
    lines = []
    lines.append('// ============================================')
    lines.append('// NOTICIAS DEL DÍA')
    lines.append('// Generado automáticamente por el bot')
    lines.append(f'// Fecha: {obtener_fecha_hoy()}')
    lines.append('// ============================================')
    lines.append('')
    lines.append('export const NOTICIAS = [')
    
    for i, noticia in enumerate(noticias):
        lines.append('    {')
        lines.append(f'        id: {noticia.get("id", i+1)},')
        lines.append(f'        titulo: "{escapar_string(noticia.get("titulo", ""))}",')
        lines.append(f'        resumen: "{escapar_string(noticia.get("resumen", ""))}",')
        lines.append(f'        fecha: "{escapar_string(noticia.get("fechaPublicacion", ""))}",')
        lines.append(f'        tag: "{escapar_string(noticia.get("tag", ""))}",')
        lines.append(f'        imagen: "{escapar_string(noticia.get("imagen", ""))}",')
        lines.append(f'        contenido: "{escapar_string(noticia.get("contenido", ""))}",')
        lines.append(f'        esPrincipal: {str(noticia.get("esPrincipal", False)).lower()}')
        
        if i < len(noticias) - 1:
            lines.append('    },')
        else:
            lines.append('    }')
    
    lines.append('];')
    
    return '\n'.join(lines)

def guardar_noticias(contenido_js):
    """Guarda el archivo noticias.js en su carpeta correcta"""
    ruta = 'js/datos/noticias.js'
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(contenido_js)
    print(f"✅ Archivo guardado: {ruta}")

def main():
    print(" Bot de noticias iniciado...")
    
    fecha_hoy = obtener_fecha_hoy()
    print(f"📅 Fecha de hoy: {fecha_hoy}")
    
    # Cargar banco normal y Evergreen
    banco = cargar_banco()
    evergreen = cargar_evergreen()
    
    print(f"📚 Total de noticias en el banco: {len(banco)}")
    print(f" Total de noticias Evergreen: {len(evergreen)}")
    
    # Filtrar noticias del día
    noticias_hoy = filtrar_noticias_hoy(banco, fecha_hoy)
    print(f"📰 Noticias programadas para hoy: {len(noticias_hoy)}")
    
    if not noticias_hoy and not evergreen:
        print("⚠️ No hay noticias del día ni Evergreen disponibles")
        contenido = generar_js([])
    else:
        print("🎯 Seleccionando noticias (prioridad: día > Evergreen)...")
        seleccionadas = seleccionar_noticias(noticias_hoy, evergreen)
        print(f"✅ Total de noticias seleccionadas: {len(seleccionadas)}")
        contenido = generar_js(seleccionadas)
    
    guardar_noticias(contenido)
    print("🎉 Bot finalizado correctamente")

if __name__ == '__main__':
    main()
