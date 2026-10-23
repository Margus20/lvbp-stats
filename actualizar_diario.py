import os
import requests
import base64
import time
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'

URL_POSICIONES = 'https://stats.lvbp.com/posiciones.php'
URL_RESULTADOS = 'https://stats.lvbp.com/resultados.php'
URL_CALENDARIO = 'https://stats.lvbp.com/calendario.php'

NOMBRES_EQUIPOS = {
    'Caribes de Anzoátegui': 'Caribes',
    'Tigres de Aragua': 'Tigres',
    'Cardenales de Lara': 'Cardenales',
    'Bravos de Margarita': 'Bravos',
    'Tiburones de La Guaira': 'Tiburones',
    'Águilas del Zulia': 'Águilas',
    'Leones del Caracas': 'Leones',
    'Navegantes del Magallanes': 'Magallanes'
}

MESES_ESPANOL = {
    'enero': 'january', 'febrero': 'february', 'marzo': 'march',
    'abril': 'april', 'mayo': 'may', 'junio': 'june',
    'julio': 'july', 'agosto': 'august', 'septiembre': 'september',
    'octubre': 'october', 'noviembre': 'november', 'diciembre': 'december'
}

CANALES_TV = {
    'ivc': 'IVC', 'ivctv': 'IVC', 'tves': 'TVES',
    'bym': 'BYM Sport', 'bymtv': 'BYM Sport',
    'baseball': 'Baseball', 'baseballtv': 'Baseball',
    'meridiano': 'Meridiano TV', 'meridianotv': 'Meridiano TV'
}

def iniciar_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=chrome_options)

def obtener_nombre_corto(nombre_completo):
    if not nombre_completo:
        return ''
    for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
        if nombre_largo.lower() in nombre_completo.lower():
            return nombre_corto
    nombre_lower = nombre_completo.lower()
    if 'navegantes' in nombre_lower or 'magallanes' in nombre_lower:
        return 'Magallanes'
    if 'caribes' in nombre_lower:
        return 'Caribes'
    if 'tigres' in nombre_lower or 'aragua' in nombre_lower:
        return 'Tigres'
    if 'cardenales' in nombre_lower or 'lara' in nombre_lower:
        return 'Cardenales'
    if 'bravos' in nombre_lower or 'margarita' in nombre_lower:
        return 'Bravos'
    if 'tiburones' in nombre_lower or 'guaira' in nombre_lower:
        return 'Tiburones'
    if 'aguilas' in nombre_lower or 'zulia' in nombre_lower:
        return 'Águilas'
    if 'leones' in nombre_lower or 'caracas' in nombre_lower:
        return 'Leones'
    return nombre_completo.split()[0] if nombre_completo else ''

def detectar_canales(juego):
    canales_detectados = []
    imagenes = juego.find_all('img') if hasattr(juego, 'find_all') else []
    for img in imagenes:
        alt = img.get('alt', '').lower()
        src = img.get('src', '').lower()
        texto_completo = alt + ' ' + src
        for clave, nombre_canal in CANALES_TV.items():
            if clave in texto_completo:
                if nombre_canal not in canales_detectados:
                    canales_detectados.append(nombre_canal)
                break
    return canales_detectados

def extraer_posiciones(driver):
    print(" Extrayendo Posiciones...")
    driver.get(URL_POSICIONES)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    time.sleep(2)
    
    try:
        tabs = driver.find_elements(By.CSS_SELECTOR, "button, a, [role='tab'], .nav-link")
        for tab in tabs:
            if 'temporada regular' in tab.text.lower():
                driver.execute_script("arguments[0].click();", tab)
                time.sleep(1.5)
                break
        selects = driver.find_elements(By.TAG_NAME, "select")
        for select_elem in selects:
            options = select_elem.find_elements(By.TAG_NAME, "option")
            for option in options:
                if '2026' in option.text:
                    select = Select(select_elem)
                    try:
                        select.select_by_visible_text('2026')
                        time.sleep(1.5)
                    except:
                        pass
                    break
    except Exception as e:
        print(f"⚠️ Aviso: {e}")
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tablas = soup.find_all('table')
    if not tablas:
        print("⚠️ No se encontró tabla")
        return []
    
    tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
    ths = [th.get_text(strip=True).upper() for th in tabla.find_all('th')]
    
    idx_eq = next((i for i, th in enumerate(ths) if 'EQUIPO' in th or 'CLUB' in th), 1)
    idx_jj = next((i for i, th in enumerate(ths) if th == 'JJ'), 2)
    idx_jg = next((i for i, th in enumerate(ths) if th == 'JG'), 3)
    idx_jp = next((i for i, th in enumerate(ths) if th == 'JP'), 4)
    idx_pct = next((i for i, th in enumerate(ths) if 'PCT' in th), 5)
    idx_dif = next((i for i, th in enumerate(ths) if 'DIF' in th), 6)
    idx_racha = next((i for i, th in enumerate(ths) if 'RACHA' in th), 7)
    
    datos = []
    for i, tr in enumerate(tabla.find_all('tr')[1:], 1):
        tds = tr.find_all('td')
        if len(tds) > idx_eq:
            nombre_completo = tds[idx_eq].get_text(strip=True)
            nombre_corto = obtener_nombre_corto(nombre_completo)
            datos.append({
                'numero': i,
                'nombre': nombre_corto,
                'jj': tds[idx_jj].get_text(strip=True) if idx_jj < len(tds) else '0',
                'jg': tds[idx_jg].get_text(strip=True) if idx_jg < len(tds) else '0',
                'jp': tds[idx_jp].get_text(strip=True) if idx_jp < len(tds) else '0',
                'pct': tds[idx_pct].get_text(strip=True) if idx_pct < len(tds) else '.000',
                'dif': tds[idx_dif].get_text(strip=True) if idx_dif < len(tds) else '-',
                'racha': tds[idx_racha].get_text(strip=True) if idx_racha < len(tds) else ''
            })
    
    print(f"✅ Extraídas {len(datos)} posiciones")
    return datos

def extraer_resultados(driver):
    print("🏆 Extrayendo Resultados...")
    driver.get(URL_RESULTADOS)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    todos_divs = soup.find_all('div')
    candidatos = []
    
    for div in todos_divs:
        texto = div.get_text()
        if 'Finalizado' in texto or 'finalizado' in texto:
            equipos_en_div = []
            for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                if nombre_corto in texto:
                    equipos_en_div.append(nombre_corto)
            if len(equipos_en_div) >= 2:
                candidatos.append((div, equipos_en_div, texto))
    
    print(f"🔍 Candidatos iniciales: {len(candidatos)}")
    
    divs_finales = []
    for i, (div1, eq1, txt1) in enumerate(candidatos):
        es_anidado = False
        for j, (div2, eq2, txt2) in enumerate(candidatos):
            if i != j and div1 in div2.find_all('div'):
                es_anidado = True
                break
        if not es_anidado:
            divs_finales.append((div1, eq1, txt1))
    
    print(f"✅ Después de filtrar anidados: {len(divs_finales)}")
    
    datos = []
    juegos_vistos = set()
    
    for div, equipos, texto in divs_finales[:8]:
        try:
            visitante = equipos[0]
            local = equipos[1]
            clave = f"{visitante}-{local}"
            if clave in juegos_vistos:
                continue
            juegos_vistos.add(clave)
            
            scores = []
            lines = texto.split('\n')
            for i, line in enumerate(lines):
                if 'R' in line and 'H' in line and 'E' in line:
                    for j in range(i+1, min(i+3, len(lines))):
                        numeros = re.findall(r'\d+', lines[j])
                        if numeros and len(numeros) >= 2:
                            scores = [numeros[0], numeros[1]]
                            break
                    break
            
            if len(scores) < 2:
                numeros_aislados = re.findall(r'\b\d{1,2}\b', texto)
                posibles = [n for n in numeros_aislados if 0 <= int(n) <= 20]
                if len(posibles) >= 2:
                    scores = [posibles[0], posibles[1]]
            
            score_visitante = scores[0] if len(scores) > 0 else "0"
            score_local = scores[1] if len(scores) > 1 else "0"
            
            inning_match = re.search(r'Inning\s*(\d+)', texto, re.IGNORECASE)
            innings = inning_match.group(1) if inning_match else "9"
            
            pitcher_ganador = ""
            pitcher_perdedor = ""
            pitcher_salvador = ""
            
            match_g = re.search(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+P:|\s+S:|\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
            if match_g:
                pitcher_ganador = match_g.group(1).strip()
            match_p = re.search(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+S:|\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
            if match_p:
                pitcher_perdedor = match_p.group(1).strip()
            match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
            if match_s:
                pitcher_salvador = match_s.group(1).strip()
            
            datos.append({
                'fecha': datetime.now().strftime("%Y-%m-%d"),
                'visitante': visitante,
                'local': local,
                'scoreVisitante': score_visitante,
                'scoreLocal': score_local,
                'innings': innings,
                'finalizado': True,
                'pitcherGanador': pitcher_ganador,
                'pitcherPerdedor': pitcher_perdedor,
                'pitcherSalvador': pitcher_salvador
            })
            
            print(f"✅ Juego: {visitante} {score_visitante} - {score_local} {local} ({innings} inn)")
        except Exception as e:
            print(f"⚠️ Error: {e}")
            continue
    
    if len(datos) == 0:
        print("❌ No se extrajeron juegos válidos")
        return None
    
    print(f"✅ Extraídos {len(datos)} resultados únicos")
    return datos

def extraer_calendario(driver):
    """Extrae calendario buscando DIRECTAMENTE divs con PREVIA"""
    print("📅 Extrayendo Calendario...")
    driver.get(URL_CALENDARIO)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # MÉTODO DIRECTO: Buscar TODOS los divs que contengan "PREVIA"
    todos_divs = soup.find_all('div')
    divs_con_previa = []
    
    for div in todos_divs:
        texto = div.get_text()
        if 'PREVIA' in texto:
            # Verificar que tenga al menos 2 equipos
            equipos_encontrados = []
            for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                if nombre_corto in texto:
                    equipos_encontrados.append(nombre_corto)
            
            if len(equipos_encontrados) >= 2:
                divs_con_previa.append((div, equipos_encontrados, texto))
    
    print(f"🔍 Divs con PREVIA y 2+ equipos: {len(divs_con_previa)}")
    
    # Filtrar divs anidados (tomar solo el más específico)
    divs_finales = []
    for i, (div1, eq1, txt1) in enumerate(divs_con_previa):
        es_anidado = False
        for j, (div2, eq2, txt2) in enumerate(divs_con_previa):
            if i != j and div1 in div2.find_all('div'):
                es_anidado = True
                break
        if not es_anidado:
            divs_finales.append((div1, eq1, txt1))
    
    print(f"✅ Después de filtrar anidados: {len(divs_finales)}")
    
    # Extraer y deduplicar
    datos = []
    juegos_vistos = set()
    
    for div, equipos, texto in divs_finales[:6]:
        try:
            visitante = equipos[0]
            local = equipos[1]
            clave = f"{visitante}-{local}"
            if clave in juegos_vistos:
                print(f"⚠️ Duplicado: {clave} - Saltando")
                continue
            juegos_vistos.add(clave)
            
            # Extraer hora
            hora = "7:00 PM"
            hora_match = re.search(r'(\d{1,2}:\d{2}\s*[AP]M)', texto, re.IGNORECASE)
            if hora_match:
                hora = hora_match.group(1)
            
            # Extraer estadio
            estadio = "Por confirmar"
            estadio_match = re.search(r'(Estadio\s+[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+PREVIA|\n)', texto, re.IGNORECASE)
            if estadio_match:
                estadio = estadio_match.group(1).strip()
            
            # Extraer televisoras
            canales_detectados = detectar_canales(div)
            transmision = " / ".join(canales_detectados) if canales_detectados else "Por confirmar"
            
            datos.append({
                'fecha': datetime.now().strftime("%Y-%m-%d"),
                'hora': hora,
                'visitante': visitante,
                'local': local,
                'lugar': estadio,
                'transmision': transmision,
                'enVivo': False,
                'finalizado': False
            })
            
            print(f"✅ Juego: {visitante} vs {local} - {hora} - {estadio} - {transmision}")
        except Exception as e:
            print(f"⚠️ Error: {e}")
            continue
    
    print(f"✅ Extraídos {len(datos)} juegos únicos")
    return datos

def actualizar_archivo_github(file_path, datos_lista, mensaje_commit):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{file_path}"
    headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
    
    response = requests.get(url, headers=headers)
    sha = response.json().get('sha') if response.status_code == 200 else None
    
    nombre_constante = file_path.split('/')[-1].replace('.js', '').upper()
    js_content = f"export const {nombre_constante} = {json.dumps(datos_lista, indent=4, ensure_ascii=False)};\n"
    
    data = {
        "message": mensaje_commit,
        "content": base64.b64encode(js_content.encode('utf-8')).decode('utf-8'),
    }
    if sha:
        data["sha"] = sha
    
    response = requests.put(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print(f"✅ {file_path} actualizado.")
    else:
        print(f"❌ Error: {response.text}")

def main():
    print("🚀 Iniciando Bot Diario LVBP...")
    if not TOKEN:
        print("❌ ERROR: No GITHUB_TOKEN")
        return
    
    driver = iniciar_driver()
    try:
        posiciones = extraer_posiciones(driver)
        if posiciones:
            actualizar_archivo_github('js/datos/posiciones.js', posiciones, " Bot: Posiciones")
        
        resultados = extraer_resultados(driver)
        if resultados is not None and len(resultados) > 0:
            actualizar_archivo_github('js/datos/resultados.js', resultados, "🤖 Bot: Resultados")
        else:
            print("🔒 Resultados: NO se actualiza")
        
        calendario = extraer_calendario(driver)
        if calendario and len(calendario) > 0:
            actualizar_archivo_github('js/datos/calendario.js', calendario, "🤖 Bot: Calendario")
        else:
            print("🔒 Calendario: NO se actualiza")
    
    except Exception as e:
        print(f"❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("🏁 Bot finalizado.")

if __name__ == '__main__':
    main()
