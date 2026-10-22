import os
import requests
import base64
import json
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ==========================================
# CONFIGURACIÓN DEL BOT
# ==========================================
# ✅ CORRECCIÓN 1: Buscar GITHUB_TOKEN primero, luego GH_TOKEN
TOKEN = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')

if not TOKEN:
    print("❌ ERROR: No se encontró el token. Verifica que esté en los Secrets de GitHub.")
    exit(1)

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
    print(f"📡 Conectando a {URL_LVBP} con navegador invisible (Selenium)...")
    
    # Configurar Chrome en modo "headless" (sin ventana gráfica, ideal para servidores)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
    
    try:
        # Iniciar el navegador
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(URL_LVBP)
        
        print("⏳ Esperando a que JavaScript cargue la tabla de estadísticas...")
        try:
            # Esperar hasta 15 segundos a que aparezca al menos una tabla
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            # Dar 2 segundos extra para asegurar que los datos dentro de la tabla se rendericen
            time.sleep(2)
        except Exception as e:
            print(f"⚠️ Tiempo de espera agotado o no se encontró la tabla: {e}")
        
        # Obtener el HTML completo YA PROCESADO por JavaScript
        html_completo = driver.page_source
        driver.quit()
        
        print("✅ Página cargada completamente. Procesando HTML...")
        soup = BeautifulSoup(html_completo, 'html.parser')
        
        # Buscar la tabla con más filas (ignorando menús o tablas pequeñas de diseño)
        todas_las_tablas = soup.find_all('table')
        tablas_validas = [t for t in todas_las_tablas if len(t.find_all('tr')) > 4]
        
        if not tablas_validas:
            print("❌ No se encontró ninguna tabla válida con datos en la página.")
            return None
            
        tabla = max(tablas_validas, key=lambda t: len(t.find_all('tr')))
        print(f"📊 Tabla encontrada con {len(tabla.find_all('tr'))} filas.")
        
        filas = tabla.find_all('tr')
        jugadores = []
        
        for fila in filas[1:]:  # Saltamos la fila de encabezados
            celdas = fila.find_all('td')
            if len(celdas) >= 3:
                jugador = celdas[0].get_text(strip=True)
                equipo_raw = celdas[1].get_text(strip=True)
                valor = celdas[2].get_text(strip=True)
                
                # Validar que el jugador tenga nombre (no sea fila vacía o de publicidad)
                if not jugador or jugador == '' or 'publicidad' in equipo_raw.lower():
                    continue
                
                # Buscar el equipo en nuestro traductor
                equipo_key = 'leones'  # Valor por defecto
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
        
        # ✅ CORRECCIÓN 3: Asegurar que siempre haya 3 elementos para que el f-string no falle
        while len(top_3) < 3:
            top_3.append({"nombre": "Por definir", "equipo": "leones", "valor": "0"})
        
        print(f"📊 Datos extraídos exitosamente: {top_3}")
        return top_3
        
    except Exception as e:
        print(f"❌ Error fatal con Selenium: {e}")
        return None

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
    
    # 2. Creamos el nuevo contenido del archivo JS (f-string seguro)
    nuevo_contenido = f"""// ============================================
// LÍDERES ESTADÍSTICOS - ACTUALIZACIÓN AUTOMÁTICA (SELENIUM)
// Actualizado: {requests.get('https://api.github.com').headers.get('Date', 'Fecha desconocida')}
// ============================================

export const LIDERES = {{
    jonrones: [
        {{"posicion": 1, "nombre": "{top_3[0]['nombre']}", "equipo": "{top_3[0]['equipo']}", "valor": "{top_3[0]['valor']}"}},
        {{"posicion": 2, "nombre": "{top_3[1]['nombre']}", "equipo": "{top_3[1]['equipo']}", "valor": "{top_3[1]['valor']}"}},
        {{"posicion": 3, "nombre": "{top_3[2]['nombre']}", "equipo": "{top_3[2]['equipo']}", "valor": "{top_3[2]['valor']}"}}
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
        "message": "🤖 Actualización automática de Líderes (Selenium)",
        "content": content_encoded,
        "sha": sha
    }
    
    response = requests.put(url, headers=headers, json=data)
    if response.status_code == 200:
        print("✅ ¡Archivo lideres.js actualizado en GitHub con éxito!")
    else:
        print(f"❌ Error al subir: {response.text}")

def main():
    print("🚀 Iniciando Bot de Estadísticas LVBP (con Selenium)...")
    print(f"🔑 Token encontrado: {'SÍ' if TOKEN else 'NO'}")
    datos = obtener_datos_lvbp()
    if datos:
        actualizar_github(datos)
    else:
        print("⚠️ No se pudieron extraer datos. Revisa el diagnóstico en los logs.")

if __name__ == '__main__':
    main()
