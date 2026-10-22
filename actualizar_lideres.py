import os
import requests
import base64
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
TOKEN = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')

if not TOKEN:
    print("❌ ERROR: No se encontró el token. Verifica que esté en los Secrets de GitHub.")
    exit(1)

REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
FILE_PATH = 'js/datos/lideres.js'
URL_LVBP = 'https://stats.lvbp.com/lideres.php'

# Traductor de nombres de la web a tus claves de mascotas Y abreviaturas de 3 letras
MAPA_EQUIPOS = {
    'Tigres de Aragua': {'clave': 'tigres', 'abrev': 'ARA'},
    'Tigres': {'clave': 'tigres', 'abrev': 'ARA'},
    'Leones del Caracas': {'clave': 'leones', 'abrev': 'CAR'},
    'Leones': {'clave': 'leones', 'abrev': 'CAR'},
    'Navegantes del Magallanes': {'clave': 'navegantes', 'abrev': 'MAG'},
    'Magallanes': {'clave': 'navegantes', 'abrev': 'MAG'},
    'Cardenales de Lara': {'clave': 'cardenales', 'abrev': 'LAR'},
    'Cardenales': {'clave': 'cardenales', 'abrev': 'LAR'},
    'Bravos de Margarita': {'clave': 'bravos', 'abrev': 'MAR'},
    'Bravos': {'clave': 'bravos', 'abrev': 'MAR'},
    'Tiburones de La Guaira': {'clave': 'tiburones', 'abrev': 'LAG'},
    'Tiburones': {'clave': 'tiburones', 'abrev': 'LAG'},
    'Caribes de Anzoátegui': {'clave': 'caribes', 'abrev': 'ANZ'},
    'Caribes': {'clave': 'caribes', 'abrev': 'ANZ'},
    'Águilas del Zulia': {'clave': 'aguilas', 'abrev': 'ZUL'},
    'Águilas': {'clave': 'aguilas', 'abrev': 'ZUL'},
    'Zulia': {'clave': 'aguilas', 'abrev': 'ZUL'}
}

# Diccionarios de estadísticas por pestaña (Abreviatura exacta que aparece en la web)
ESTADISTICAS_BATEO = {
    'jonrones': 'HR', 'impulsadas': 'CI', 'hits': 'H', 'dobles': '2B',
    'triples': '3B', 'carrerasAnotadas': 'C', 'basesRobadas': 'BR',
    'basesPorBolas': 'BB', 'ponchesBateo': 'K'
}
ESTADISTICAS_BATEO_AVANZADAS = {
    'average': 'AVE', 'slugging': 'SLG', 'ops': 'OPS'
}
ESTADISTICAS_PITCHEO = {
    'efectividad': 'EFE', 'ponchesPitching': 'K', 'victorias': 'G',
    'salvados': 'SV', 'inningsLanzados': 'IP', 'hitsPermitidos': 'H',
    'carrerasPermitidas': 'CP', 'carrerasLimpias': 'CL', 'jonronesPermitidos': 'HR',
    'basesPorBolasPitching': 'BB'
}
ESTADISTICAS_PITCHEO_AVANZADAS = {
    'whip': 'WHIP', 'averageContra': 'AVE', 'strikes': 'S', 'numeroPitches': 'NP'
}

def hacer_clic_en_pestania(driver, nombre_pestania):
    """Busca y hace clic en una pestaña (Bateo, Avanzadas, Pitcheo, etc.)"""
    try:
        print(f"🔍 Buscando pestaña '{nombre_pestania}'...")
        tabs = driver.find_elements(By.CSS_SELECTOR, "a, button, [role='tab'], .nav-link")
        for tab in tabs:
            if nombre_pestania.lower() in tab.text.lower():
                print(f"✅ Encontrada. Haciendo clic en '{nombre_pestania}'...")
                driver.execute_script("arguments[0].scrollIntoView(true);", tab)
                driver.execute_script("arguments[0].click();", tab)
                time.sleep(2.5)  # Esperar a que la tabla cambie
                return True
        print(f"⚠️ No se encontró la pestaña '{nombre_pestania}'")
        return False
    except Exception as e:
        print(f"❌ Error al hacer clic en pestaña {nombre_pestania}: {e}")
        return False

def hacer_clic_en_columna(driver, abreviatura):
    """Busca y hace clic en el encabezado de columna para ordenar"""
    try:
        print(f"🔍 Buscando columna '{abreviatura}' para ordenar...")
        encabezados = driver.find_elements(By.TAG_NAME, "th")
        for encabezado in encabezados:
            if abreviatura.lower() in encabezado.text.lower():
                print(f"✅ Encontrada columna '{abreviatura}'. Ordenando...")
                driver.execute_script("arguments[0].scrollIntoView(true);", encabezado)
                driver.execute_script("arguments[0].click();", encabezado)
                time.sleep(2)  # Esperar a que se ordene la tabla
                return True
        print(f"⚠️ No se encontró la columna '{abreviatura}'")
        return False
    except Exception as e:
        print(f"❌ Error al hacer clic en columna {abreviatura}: {e}")
        return False

def extraer_top3_actual(driver):
    """Extrae los primeros 3 jugadores de la tabla visible en este momento"""
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        tablas = soup.find_all('table')
        if not tablas:
            return []
            
        # Buscar la tabla con más filas (la de datos)
        tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
        filas = tabla.find_all('tr')[1:]  # Saltar encabezado
        
        jugadores = []
        for fila in filas[:10]:  # Revisar las primeras 10 filas por seguridad
            celdas = fila.find_all('td')
            if len(celdas) >= 3:
                jugador_raw = celdas[0].get_text(strip=True)
                equipo_raw = celdas[1].get_text(strip=True)
                
                # 1. Limpiar nombre (quitar posiciones como 1B, RF, P, etc.)
                nombre_limpio = jugador_raw
                for pos in ['1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'C', 'DH', 'P', '#', '*']:
                    nombre_limpio = nombre_limpio.replace(pos, '').strip()
                
                if not nombre_limpio or 'publicidad' in equipo_raw.lower() or len(nombre_limpio) < 3:
                    continue
                
                # 2. Formatear nombre a "Inicial. Apellido" (ej: "Miguel Vargas" -> "M. Vargas")
                partes = nombre_limpio.split()
                if len(partes) >= 2:
                    inicial = partes[0][0].upper() + "."
                    resto = " ".join(partes[1:]) # Une el resto por si tiene dos apellidos
                    nombre_formateado = f"{inicial} {resto}"
                else:
                    nombre_formateado = nombre_limpio
                
                # 3. Determinar equipo y su abreviatura de 3 letras
                equipo_key = 'leones'
                abrev_equipo = 'CAR' # Default
                for nombre_web, datos in MAPA_EQUIPOS.items():
                    if nombre_web.lower() in equipo_raw.lower():
                        equipo_key = datos['clave']
                        abrev_equipo = datos['abrev']
                        break
                
                # 4. Construir el nombre final exacto: "M. Vargas (ARA)"
                nombre_final = f"{nombre_formateado} ({abrev_equipo})"
                
                # 5. Obtener el valor numérico de la estadística
                valor = "0"
                for celda in celdas[2:]:
                    texto = celda.get_text(strip=True)
                    try:
                        float(texto.replace(',', '.'))
                        valor = texto
                        break
                    except ValueError:
                        continue
                
                jugadores.append({
                    "nombre": nombre_final,
                    "equipo": equipo_key,
                    "valor": valor
                })
        
        return jugadores[:3]  # Retornar solo el Top 3
        
    except Exception as e:
        print(f"❌ Error al extraer datos de la tabla: {e}")
        return []

def obtener_datos_lvbp():
    print(f"📡 Conectando a {URL_LVBP} con navegador invisible (Selenium)...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(URL_LVBP)
        
        print("⏳ Esperando a que JavaScript cargue la tabla inicial...")
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        time.sleep(2)
        
        todos_los_lideres = {}
        
        # 1. BATEO BÁSICO
        print("\n=== 🏏 PROCESANDO BATEO BÁSICO ===")
        if hacer_clic_en_pestania(driver, "Bateo"):
            for categoria, abreviatura in ESTADISTICAS_BATEO.items():
                print(f"  → {categoria.upper()} ({abreviatura})")
                if hacer_clic_en_columna(driver, abreviatura):
                    top3 = extraer_top3_actual(driver)
                    if top3:
                        todos_los_lideres[categoria] = top3
                        print(f"     ✅ {top3[0]['nombre']} ({top3[0]['valor']})")

        # 2. BATEO AVANZADO
        print("\n=== 📊 PROCESANDO BATEO AVANZADO ===")
        if hacer_clic_en_pestania(driver, "Avanzadas de Bateo"):
            for categoria, abreviatura in ESTADISTICAS_BATEO_AVANZADAS.items():
                print(f"  → {categoria.upper()} ({abreviatura})")
                if hacer_clic_en_columna(driver, abreviatura):
                    top3 = extraer_top3_actual(driver)
                    if top3:
                        todos_los_lideres[categoria] = top3
                        print(f"     ✅ {top3[0]['nombre']} ({top3[0]['valor']})")

        # 3. PITCHEO BÁSICO
        print("\n=== ⚾ PROCESANDO PITCHEO BÁSICO ===")
        if hacer_clic_en_pestania(driver, "Pitcheo"):
            for categoria, abreviatura in ESTADISTICAS_PITCHEO.items():
                print(f"  → {categoria.upper()} ({abreviatura})")
                if hacer_clic_en_columna(driver, abreviatura):
                    top3 = extraer_top3_actual(driver)
                    if top3:
                        todos_los_lideres[categoria] = top3
                        print(f"     ✅ {top3[0]['nombre']} ({top3[0]['valor']})")

        # 4. PITCHEO AVANZADO
        print("\n=== 📈 PROCESANDO PITCHEO AVANZADO ===")
        if hacer_clic_en_pestania(driver, "Avanzadas de Pitcheo"):
            for categoria, abreviatura in ESTADISTICAS_PITCHEO_AVANZADAS.items():
                print(f"  → {categoria.upper()} ({abreviatura})")
                if hacer_clic_en_columna(driver, abreviatura):
                    top3 = extraer_top3_actual(driver)
                    if top3:
                        todos_los_lideres[categoria] = top3
                        print(f"     ✅ {top3[0]['nombre']} ({top3[0]['valor']})")
        
        driver.quit()
        return todos_los_lideres
        
    except Exception as e:
        print(f"❌ Error fatal con Selenium: {e}")
        import traceback
        traceback.print_exc()
        return None

def actualizar_github(todos_los_lideres):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"❌ No se pudo leer el archivo actual: {response.text}")
        return
        
    sha = response.json().get('sha')
    fecha_actual = time.strftime('%Y-%m-%d %H:%M:%S')
    
    # Orden deseado de las categorías en el archivo final
    orden_categorias = [
        'jonrones', 'average', 'impulsadas', 'slugging', 'ops',
        'hits', 'dobles', 'triples', 'carrerasAnotadas', 'basesRobadas',
        'basesPorBolas', 'ponchesBateo', 'efectividad', 'ponchesPitching',
        'victorias', 'salvados', 'inningsLanzados', 'whip', 'averageContra',
        'strikes', 'numeroPitches', 'hitsPermitidos', 'carrerasPermitidas',
        'carrerasLimpias', 'jonronesPermitidos', 'basesPorBolasPitching'
    ]
    
    contenido = f"""// ============================================
// LÍDERES ESTADÍSTICOS - ACTUALIZACIÓN AUTOMÁTICA (SELENIUM)
// Actualizado: {fecha_actual}
// ============================================

export const LIDERES = {{
"""
    
    for categoria in orden_categorias:
        contenido += f"    {categoria}: [\n"
        if categoria in todos_los_lideres:
            lideres = todos_los_lideres[categoria]
            for i, lider in enumerate(lideres[:3], 1):
                contenido += f'        {{"posicion": {i}, "nombre": "{lider["nombre"]}", "equipo": "{lider["equipo"]}", "valor": "{lider["valor"]}"}}'
                if i < 3:
                    contenido += ","
                contenido += "\n"
        else:
            # Fallback por si una categoría no se pudo extraer
            contenido += '        {"posicion": 1, "nombre": "Por definir (CAR)", "equipo": "leones", "valor": "0"},\n'
            contenido += '        {"posicion": 2, "nombre": "Por definir (CAR)", "equipo": "leones", "valor": "0"},\n'
            contenido += '        {"posicion": 3, "nombre": "Por definir (CAR)", "equipo": "leones", "valor": "0"}\n'
        contenido += "    ],\n"
    
    contenido += """};

export const MASCOTAS = {
    'leones': 'mascotas/leo.jpg', 'navegantes': 'mascotas/capi.jpg',
    'tiburones': 'mascotas/tibu.jpg', 'tigres': 'mascotas/tigre.jpg',
    'aguilas': 'mascotas/agui.jpg', 'cardenales': 'mascotas/guarito.jpg',
    'caribes': 'mascotas/caribito.jpg', 'bravos': 'mascotas/bravin.jpg'
};

export function obtenerMascota(equipo) {
    return MASCOTAS[equipo.toLowerCase()] || 'mascotas/leo.jpg';
}
"""
    
    content_encoded = base64.b64encode(contenido.encode('utf-8')).decode('utf-8')
    data = {
        "message": "🤖 Actualización automática de las 26 estadísticas (Formato: M. Vargas (ARA))",
        "content": content_encoded,
        "sha": sha
    }
    
    response = requests.put(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("✅ ¡Archivo lideres.js actualizado en GitHub con éxito!")
    else:
        print(f"❌ Error al subir: {response.text}")

def main():
    print("🚀 Iniciando Bot de Estadísticas LVBP (26 categorías con formato de nombre profesional)...")
    print(f"🔑 Token encontrado: {'SÍ' if TOKEN else 'NO'}")
    
    datos = obtener_datos_lvbp()
    if datos and len(datos) > 0:
        print(f"\n📊 Éxito: Se extrajeron {len(datos)} de 26 categorías.")
        actualizar_github(datos)
    else:
        print("⚠️ No se pudieron extraer datos. Revisa el diagnóstico en los logs.")

if __name__ == '__main__':
    main()
