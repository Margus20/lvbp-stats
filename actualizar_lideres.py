import os
import requests
import base64
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

# ==========================================
# CONFIGURACIÓN DEL BOT
# ==========================================
TOKEN = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')

if not TOKEN:
    print("❌ ERROR: No se encontró el token.")
    exit(1)

REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
FILE_PATH = 'js/datos/lideres.js'
URL_LVBP = 'https://stats.lvbp.com/lideres.php'

# Traductor de equipos
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

# ✅ BATEO - SOLO PESTAÑA "Bateo" (11 datos)
ESTADISTICAS_BATEO = {
    'jonrones': 'HR',
    'hits': 'H',
    'dobles': '2B',
    'triples': '3B',
    'impulsadas': 'CI',
    'basesRobadas': 'BR',
    'basesPorBolas': 'BB',
    'ponchesBateo': 'K',
    'average': 'AVE',
    'slugging': 'SLG',
    'ops': 'OPS'
}

# ✅ PITCHEO - SOLO PESTAÑA "Pitcheo" (8 datos)
ESTADISTICAS_PITCHEO = {
    'efectividad': 'EFE',
    'victorias': 'G',
    'salvados': 'SV',
    'inningsLanzados': 'IP',
    'ponchesPitching': 'K',
    'hold': 'HLD',
    'whip': 'WHIP',
    'averageContra': 'AVE'
}

# 📉 ESTADÍSTICAS DONDE "MENOR ES MEJOR" (se ordenan ascendente)
ESTADISTICAS_MENOR_ES_MEJOR = ['efectividad', 'whip', 'averageContra']

def cambiar_a_pitcheo(driver):
    try:
        print("🔄 Buscando dropdown para cambiar a Pitcheo...")
        selects = driver.find_elements(By.TAG_NAME, "select")
        for select_elem in selects:
            options = select_elem.find_elements(By.TAG_NAME, "option")
            for option in options:
                if 'pitcheo' in option.text.lower() or 'pitching' in option.text.lower():
                    print(f"✅ Encontrada opción 'Pitcheo'. Seleccionando...")
                    select = Select(select_elem)
                    select.select_by_visible_text(option.text)
                    time.sleep(3)
                    return True
        print("⚠️ No se encontró el dropdown de Pitcheo")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def hacer_clic_en_pestania(driver, nombre_pestania):
    try:
        print(f"🔍 Buscando pestaña '{nombre_pestania}'...")
        tabs = driver.find_elements(By.CSS_SELECTOR, "a, button, [role='tab'], .nav-link")
        for tab in tabs:
            if nombre_pestania.lower() in tab.text.lower():
                print(f"✅ Encontrada. Haciendo clic...")
                driver.execute_script("arguments[0].scrollIntoView(true);", tab)
                driver.execute_script("arguments[0].click();", tab)
                time.sleep(2.5)
                return True
        print(f"⚠️ No se encontró '{nombre_pestania}'")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def hacer_clic_en_columna(driver, abreviatura, categoria):
    """Busca columna con prioridad: EXACTA > SIN / > CON /"""
    try:
        print(f"🔍 Buscando columna '{abreviatura}'...")
        
        # Scroll horizontal máximo
        driver.execute_script("""
            var container = document.querySelector('.table-responsive') || document.querySelector('table') || document.body;
            if (container) container.scrollLeft = container.scrollWidth;
        """)
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        encabezados = soup.find_all('th')
        indice_columna = -1
        
        # 1️⃣ PRIORIDAD 1: Coincidencia EXACTA (sin /)
        for i, encabezado in enumerate(encabezados):
            texto = encabezado.get_text(strip=True).upper()
            if texto == abreviatura.upper() and '/' not in texto:
                print(f"✅ Coincidencia EXACTA: '{texto}' en posición {i}")
                indice_columna = i
                break
        
        # 2️⃣ PRIORIDAD 2: Empieza con la abreviatura (sin /)
        if indice_columna == -1:
            for i, encabezado in enumerate(encabezados):
                texto = encabezado.get_text(strip=True).upper()
                if texto.startswith(abreviatura.upper()) and '/' not in texto:
                    print(f"✅ Coincidencia por inicio: '{texto}' en posición {i}")
                    indice_columna = i
                    break
        
        # 3️⃣ PRIORIDAD 3: Contiene la abreviatura (solo si no encontró las anteriores)
        if indice_columna == -1:
            for i, encabezado in enumerate(encabezados):
                texto = encabezado.get_text(strip=True).upper()
                if abreviatura.upper() in texto and '/' not in texto:
                    print(f"⚠️ Coincidencia parcial: '{texto}' en posición {i}")
                    indice_columna = i
                    break
        
        if indice_columna >= 0:
            encabezados_selenium = driver.find_elements(By.TAG_NAME, "th")
            if indice_columna < len(encabezados_selenium):
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});", encabezados_selenium[indice_columna])
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", encabezados_selenium[indice_columna])
                time.sleep(2.5)
                
                if categoria in ESTADISTICAS_MENOR_ES_MEJOR:
                    print(f"📉 '{categoria}' es 'menor es mejor'. Segundo clic...")
                    driver.execute_script("arguments[0].click();", encabezados_selenium[indice_columna])
                    time.sleep(2.5)
        else:
            print(f"❌ No se encontró NINGUNA columna para '{abreviatura}'")
        
        # Scroll de vuelta al inicio
        driver.execute_script("""
            var container = document.querySelector('.table-responsive') || document.querySelector('table');
            if (container) container.scrollLeft = 0;
            window.scrollTo(0, 0);
        """)
        time.sleep(1.5)
        
        return indice_columna
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return -1

def extraer_TODOS_los_jugadores(driver, indice_columna_objetivo, nombre_categoria):
    """Extrae TODOS los jugadores, leyendo EXCLUSIVAMENTE la columna objetivo"""
    try:
        driver.execute_script("""
            var container = document.querySelector('.table-responsive') || document.querySelector('table');
            if (container) container.scrollLeft = 0;
            window.scrollTo(0, 0);
        """)
        time.sleep(1.5)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        tablas = soup.find_all('table')
        if not tablas:
            return []
            
        tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
        filas = tabla.find_all('tr')[1:]
        
        jugadores = []
        for fila in filas[:50]:
            celdas = fila.find_all('td')
            if not celdas or len(celdas) < 2:
                continue
            
            # Encontrar automáticamente la celda del nombre
            nombre_idx = 0
            equipo_idx = 1
            
            for i in range(min(3, len(celdas))):
                texto = celdas[i].get_text(strip=True)
                if len(texto) >= 3 and not texto.isdigit() and not texto.replace('.','').isdigit():
                    nombre_idx = i
                    equipo_idx = i + 1 if i + 1 < len(celdas) else i
                    break
            
            jugador_raw = celdas[nombre_idx].get_text(strip=True)
            equipo_raw = celdas[equipo_idx].get_text(strip=True) if equipo_idx < len(celdas) else ""
            
            # ==========================================
            # 🛠️ AQUÍ ESTÁ EL ARREGLO: Limpieza SEGURA del nombre
            # ==========================================
            nombre_limpio = jugador_raw.strip()
            
            # 1. Quitamos símbolos sueltos al inicio o final
            nombre_limpio = nombre_limpio.replace('#', '').replace('*', '').strip()
            
            # 2. Quitamos la posición SOLO si está al final del texto (ej: "Juan Pérez P" o "Juan Pérez 1B")
            # Al poner un espacio antes de la posición, evitamos borrar la 'P' inicial de "Pérez" o "Pinto"
            posiciones_finales = [' 1B', ' 2B', ' 3B', ' SS', ' LF', ' CF', ' RF', ' C', ' DH', ' P']
            for pos in posiciones_finales:
                if nombre_limpio.endswith(pos):
                    nombre_limpio = nombre_limpio[:-len(pos)].strip()
                    break  # Solo quitamos una posición si la encontramos al final
            
            if not nombre_limpio or 'publicidad' in equipo_raw.lower() or len(nombre_limpio) < 3:
                continue
            
            # Formatear nombre
            partes = nombre_limpio.split()
            if len(partes) >= 2:
                inicial = partes[0][0].upper() + "."
                resto = " ".join(partes[1:])
                nombre_formateado = f"{inicial} {resto}"
            else:
                nombre_formateado = nombre_limpio
            
            # Determinar equipo
            equipo_key = 'leones'
            abrev_equipo = 'CAR'
            for nombre_web, datos in MAPA_EQUIPOS.items():
                if nombre_web.lower() in equipo_raw.lower():
                    equipo_key = datos['clave']
                    abrev_equipo = datos['abrev']
                    break
            
            nombre_final = f"{nombre_formateado} ({abrev_equipo})"
            
            # 🎯 LECTURA ESTRICTA POR COLUMNA OBJETIVO
            valor = "0"
            if indice_columna_objetivo < len(celdas):
                valor_celda = celdas[indice_columna_objetivo].get_text(strip=True)
                
                # Si es un guion o vacío, es 0. Si no, intentamos convertirlo a número.
                if valor_celda in ['-', '', 'N/A']:
                    valor = "0"
                else:
                    try:
                        # Validamos que sea un número (acepta coma o punto decimal)
                        float(valor_celda.replace(',', '.'))
                        valor = valor_celda
                    except ValueError:
                        valor = "0" # Si hay texto extraño en esa columna, lo tratamos como 0
            
            if valor != "0" or valor == "0": # Guardamos todos los que tengan valor válido (incluyendo 0)
                jugadores.append({
                    "nombre": nombre_final,
                    "equipo": equipo_key,
                    "valor": valor,
                    "valor_numerico": float(valor.replace(',', '.'))
                })
        
        print(f"📊 Extraídos {len(jugadores)} jugadores para {nombre_categoria}")
        return jugadores
    except Exception as e:
        print(f"❌ Error al extraer: {e}")
        import traceback
        traceback.print_exc()
        return []

def ordenar_y_tomar_top3(jugadores, categoria):
    """Ordena los jugadores matemáticamente y toma los 3 primeros"""
    if not jugadores:
        return []
    
    menor_es_mejor = categoria in ESTADISTICAS_MENOR_ES_MEJOR
    
    if menor_es_mejor:
        # Ascendente (menor primero): EFE, WHIP, AVE
        jugadores_ordenados = sorted(jugadores, key=lambda x: x['valor_numerico'])
    else:
        # Descendente (mayor primero): HR, H, CI, etc.
        jugadores_ordenados = sorted(jugadores, key=lambda x: x['valor_numerico'], reverse=True)
    
    top3 = jugadores_ordenados[:3]
    
    for i, jugador in enumerate(top3, 1):
        jugador['posicion'] = i
    
    return top3

def obtener_datos_lvbp():
    print(f"📡 Conectando a {URL_LVBP}...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(URL_LVBP)
        
        print("⏳ Esperando carga...")
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        time.sleep(2)
        
        todos_los_lideres = {}
        
        # 1️⃣ BATEO
        print("\n=== 🏏 BATEO (SOLO PESTAÑA 'Bateo') ===")
        if hacer_clic_en_pestania(driver, "Bateo"):
            for cat, abr in ESTADISTICAS_BATEO.items():
                print(f"  → {cat.upper()} ({abr})")
                indice = hacer_clic_en_columna(driver, abr, cat)
                if indice >= 0:
                    todos_jugadores = extraer_TODOS_los_jugadores(driver, indice, cat)
                    top3 = ordenar_y_tomar_top3(todos_jugadores, cat)
                    if top3:
                        todos_los_lideres[cat] = top3
                        print(f"     ✅ #{top3[0]['posicion']} {top3[0]['nombre']} ({top3[0]['valor']})")
                    time.sleep(0.5)

        # 2️⃣ PITCHEO
        print("\n=== ⚾ PITCHEO (SOLO PESTAÑA 'Pitcheo') ===")
        if cambiar_a_pitcheo(driver):
            hacer_clic_en_pestania(driver, "Pitcheo")
            for cat, abr in ESTADISTICAS_PITCHEO.items():
                print(f"  → {cat.upper()} ({abr})")
                indice = hacer_clic_en_columna(driver, abr, cat)
                if indice >= 0:
                    todos_jugadores = extraer_TODOS_los_jugadores(driver, indice, cat)
                    top3 = ordenar_y_tomar_top3(todos_jugadores, cat)
                    if top3:
                        todos_los_lideres[cat] = top3
                        print(f"     ✅ #{top3[0]['posicion']} {top3[0]['nombre']} ({top3[0]['valor']})")
                    time.sleep(0.5)
        
        driver.quit()
        return todos_los_lideres
        
    except Exception as e:
        print(f"❌ Error fatal: {e}")
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
        print(f"❌ No se pudo leer: {response.text}")
        return
        
    sha = response.json().get('sha')
    fecha_actual = time.strftime('%Y-%m-%d %H:%M:%S')
    
    orden_categorias = [
        'jonrones', 'hits', 'dobles', 'triples', 'impulsadas',
        'basesRobadas', 'basesPorBolas', 'ponchesBateo',
        'average', 'slugging', 'ops',
        'efectividad', 'victorias', 'salvados', 'inningsLanzados',
        'ponchesPitching', 'hold', 'whip', 'averageContra'
    ]
    
    contenido = f"""// ============================================
// LÍDERES ESTADÍSTICOS - ACTUALIZACIÓN AUTOMÁTICA
// Actualizado: {fecha_actual}
// ============================================

export const LIDERES = {{
"""
    
    for cat in orden_categorias:
        contenido += f"    {cat}: [\n"
        if cat in todos_los_lideres:
            lideres = todos_los_lideres[cat]
            for i, lid in enumerate(lideres[:3], 1):
                contenido += f'        {{"posicion": {i}, "nombre": "{lid["nombre"]}", "equipo": "{lid["equipo"]}", "valor": "{lid["valor"]}"}}'
                if i < 3:
                    contenido += ","
                contenido += "\n"
        else:
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
        "message": "🤖 Actualización automática (Nombres corregidos: se respeta la 'P' inicial)",
        "content": content_encoded,
        "sha": sha
    }
    
    response = requests.put(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("✅ ¡Archivo actualizado!")
    else:
        print(f"❌ Error: {response.text}")

def main():
    print("🚀 Iniciando Bot LVBP...")
    print(f"🔑 Token: {'SÍ' if TOKEN else 'NO'}")
    
    datos = obtener_datos_lvbp()
    if datos and len(datos) > 0:
        print(f"\n📊 Éxito: {len(datos)} de 19 categorías.")
        actualizar_github(datos)
    else:
        print("⚠️ No se extrajeron datos.")

if __name__ == '__main__':
    main()
