import os
import requests
from bs4 import BeautifulSoup
import base64
import json

# ==========================================
# CONFIGURACIÓN DEL BOT
# ==========================================
TOKEN = os.environ.get('GH_TOKEN') 
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
FILE_PATH = 'js/datos/lideres.js'
URL_LVBP = 'https://stats.lvbp.com/lideres.php'

# Traductor de nombres de la web a tus claves de mascotas
MAPA_EQUIPOS = {
    'Tigres de Aragua': 'tigres', 'Tigres': 'tigres',
    'Leones del Caracas': 'leones', 'Leones': 'leones',
    'Navegantes del Magallanes': 'navegantes', 'Magallanes': 'navegantes',
    'Cardenales de Lara': 'cardenales', 'Cardenales': 'cardenales',
    'Bravos de Margarita': 'bravos', 'Bravos': 'bravos',
    'Tiburones de La Guaira': 'tiburones', 'Tiburones': 'tiburones',
    'Caribes de Anzoátegui': 'caribes', 'Caribes': 'caribes',
    'Águilas del Zulia': 'aguilas', 'Águilas': 'aguilas'
}

def obtener_datos_lvbp():
    print(f"📡 Conectando a {URL_LVBP}...")
    # Usamos un User-Agent para que la web crea que somos un navegador real
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    response = requests.get(URL_LVBP, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error al conectar: Código {response.status_code}")
        return None
        
    soup = BeautifulSoup(response.text, 'html.parser')
    tabla = soup.find('table')
    
    if not tabla:
        print("❌ No se encontró ninguna tabla en la página.")
        return None
        
    print("✅ Tabla encontrada. Extrayendo los primeros 3 jugadores...")
    filas = tabla.find_all('tr')
    jugadores = []
    
    for fila in filas[1:]: # Saltamos la fila de encabezados
        celdas = fila.find_all('td')
        if len(celdas) >= 3:
            jugador = celdas[0].get_text(strip=True)
            equipo_raw = celdas[1].get_text(strip=True)
            valor = celdas[2].get_text(strip=True) # Tomamos la 3ra columna como valor
            
            # Buscamos el equipo en nuestro traductor
            equipo_key = 'leones' # Valor por defecto
            for nombre_web, clave in MAPA_EQUIPOS.items():
                if nombre_web.lower() in equipo_raw.lower():
                    equipo_key = clave
                    break
            
            jugadores.append({
                "nombre": jugador,
                "equipo": equipo_key,
                "valor": valor
            })
            
    # Nos quedamos solo con el Top 3
    top_3 = jugadores[:3]
    print(f"📊 Datos extraídos: {top_3}")
    return top_3

def actualizar_github(top_3):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # 1. Obtener la versión actual (SHA) del archivo
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"❌ No se pudo leer el archivo actual: {response.text}")
        return
        
    sha = response.json().get('sha')
    
    # 2. Creamos el nuevo contenido del archivo JS
    # NOTA: Para esta prueba, actualizamos principalmente la categoría 'jonrones'
    # para verificar que el bot funciona. Luego lo expandiremos.
    nuevo_contenido = f"""// ============================================
// LÍDERES ESTADÍSTICOS - ACTUALIZACIÓN AUTOMÁTICA
// ============================================

export const LIDERES = {{
    jonrones: [
        {{"posicion": 1, "nombre": "{top_3[0]['nombre'] if len(top_3)>0 else 'Por definir'}", "equipo": "{top_3[0]['equipo'] if len(top_3)>0 else 'leones'}", "valor": "{top_3[0]['valor'] if len(top_3)>0 else '0'}"}},
        {{"posicion": 2, "nombre": "{top_3[1]['nombre'] if len(top_3)>1 else 'Por definir'}", "equipo": "{top_3[1]['equipo'] if len(top_3)>1 else 'leones'}", "valor": "{top_3[1]['valor'] if len(top_3)>1 else '0'}"}},
        {{"posicion": 3, "nombre": "{top_3[2]['nombre'] if len(top_3)>2 else 'Por definir'}", "equipo": "{top_3[2]['equipo'] if len(top_3)>2 else 'leones'}", "valor": "{top_3[2]['valor'] if len(top_3)>2 else '0'}"}}
    ],
    // ... (El resto de categorías se mantienen como las dejaste manualmente por ahora)
}};

export const MASCOTAS = {{
    'leones': 'mascotas/leo.jpg', 'navegantes': 'mascotas/capi.jpg',
    'tiburones': 'mascotas/tibu.jpg', 'tigres': 'mascotas/tigre.jpg',
    'aguilas': 'mascotas/agui.jpg', 'cardenales': 'mascotas/guarito.jpg',
    'caribes': 'mascotas/caribito.jpg', 'bravos': 'mascotas/bravin.jpg'
}};

export function obtenerMascota(equipo) {{
    return MASCOTAS[equipo.toLowerCase()] || 'mascotas/leo.jpg';
}}
"""
    
    # 3. Codificar y subir
    content_encoded = base64.b64encode(nuevo_contenido.encode('utf-8')).decode('utf-8')
    data = {
        "message": "🤖 Actualización automática de Líderes (Prueba)",
        "content": content_encoded,
        "sha": sha
    }
    
    response = requests.put(url, headers=headers, json=data)
    if response.status_code == 200:
        print("✅ ¡Archivo lideres.js actualizado en GitHub con éxito!")
    else:
        print(f"❌ Error al subir: {response.text}")

def main():
    print("🚀 Iniciando Bot de Estadísticas LVBP...")
    datos = obtener_datos_lvbp()
    if datos:
        actualizar_github(datos)
    else:
        print("⚠️ No se pudieron extraer datos. Revisa los logs.")

if __name__ == '__main__':
    main()
