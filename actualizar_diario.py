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

# ==========================================
# CONFIGURACIÓN DEL BOT DIARIO
# ==========================================
TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'

URL_POSICIONES = 'https://stats.lvbp.com/posiciones.php'
URL_RESULTADOS = 'https://stats.lvbp.com/resultados.php'
URL_CALENDARIO = 'https://stats.lvbp.com/calendario.php'

# Mapeo de nombres de equipos a nombres cortos
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

# Mapeo de meses en español
MESES_ESPANOL = {
    'enero': 'january', 'febrero': 'february', 'marzo': 'march',
    'abril': 'april', 'mayo': 'may', 'junio': 'june',
    'julio': 'july', 'agosto': 'august', 'septiembre': 'september',
    'octubre': 'october', 'noviembre': 'november', 'diciembre': 'december'
}

# 📺 CANALES DE TV
CANALES_TV = {
    'ivc': 'IVC', 'ivctv': 'IVC', 'tves': 'TVES',
    'bym': 'BYM Sport', 'bymtv': 'BYM Sport', 'bym sport': 'BYM Sport',
    'baseball': 'Baseball', 'baseballtv': 'Baseball',
    'youtube': 'YouTube', 'youtubetv': 'YouTube',
    'televen': 'Televen', 'televentv': 'Televen',
    'venevis': 'Venevisión', 'venevisontv': 'Venevisión', 'venevisión': 'Venevisión',
    'venezolana': 'Venezolana TV', 'venezolanatv': 'Venezolana TV',
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
    imagenes = juego.find_all('img')
    
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

def es_juego_finalizado(texto_juego):
    texto_lower = texto_juego.lower()
    
    # PATRÓN 1: Tiene 9 innings o más
    inning_match = re.search(r'inning\s*(\d+)', texto_juego, re.IGNORECASE)
    tiene_innings = False
    if inning_match:
        innings = int(inning_match.group(1))
        tiene_innings = innings >= 9
    
    # PATRÓN 2: Tiene pitchers (G:, P:, o S:)
    tiene_pitchers = bool(re.search(r'G:\s*[A-Za-z', texto_juego, re.IGNORECASE)) or \
                     bool(re.search(r'P:\s*[A-Za-z', texto_juego, re.IGNORECASE))
    
    # PATRÓN 3: NO es un juego programado (no tiene "PREVIA")
    no_es_previa = 'previa' not in texto_lower
    
    es_finalizado = (tiene_innings and tiene_pitchers) or (tiene_pitchers and no_es_previa)
    
    return es_finalizado, tiene_innings, tiene_pitchers

def es_juego_programado(texto_juego):
    texto_lower = texto_juego.lower()
    
    # PATRÓN 1: Tiene logos de TV
    tiene_logos_tv = bool(re.search(r'<img[^>]+', texto_juego))
    
    # PATRÓN 2: Tiene hora anunciada
    tiene_hora = bool(re.search(r'\d{1,2}:\d{2}\s*[AP]M', texto_juego, re.IGNORECASE))
    
    # PATRÓN 3: Tiene estadio
    tiene_estadio = bool(re.search(r'estadio\s+[A-Za-z', texto_juego, re.IGNORECASE))
    
    # PATRÓN 4: Dice "PREVIA"
    es_previa = 'previa' in texto_lower
    
    # Un juego es programado si tiene al menos 2 de estos 4 patrones
    coincidencias = sum([tiene_logos_tv, tiene_hora, tiene_estadio, es_previa])
    es_programado = coincidencias >= 2
    
    return es_programado, tiene_hora, tiene_estadio, tiene_logos_tv

def extraer_posiciones(driver):
    print("📊 Extrayendo Posiciones...")
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
        print(f"⚠️ Aviso al configurar filtros: {e}")
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tablas = soup.find_all('table')
    if not tablas:
        print("⚠️ No se encontró tabla de posiciones")
        return []
    
    tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
    ths = [th.get_text(strip=True).upper() for th in tabla.find_all('th')]
    
    idx_eq = next((i for i, th in enumerate(ths) if 'EQUIPO' in th or 'CLUB' in th), 1)
    idx_jj = next((i for i, th in enumerate(ths) if th == 'JJ'), 2)
    idx_jg = next((i for i, th in enumerate(ths) if th == 'JG'), 3)
    idx_jp = next((i for i, th in enumerate(ths) if th == 'JP'), 4)
    idx_pct = next((i for i, th in enumerate(ths) if 'PCT' in th or '%' in th or 'AVE' in th), 5)
    idx_dif = next((i for i, th in enumerate(ths) if 'DIF' in th or 'GB' in th), 6)
    idx_racha = next((i for i, th in enumerate(ths) if 'RACHA' in th or 'STR' in th), 7)
    
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
    print(" Extrayendo Resultados...")
    driver.get(URL_RESULTADOS)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    juegos = soup.find_all('div', class_='game-card')
    if not juegos:
        juegos = soup.find_all('div', {'class': lambda x: x and 'game' in x.lower()})
    
    print(f"🔍 Encontradas {len(juegos)} tarjetas de juego")
    
    datos = []
    juegos_validos_encontrados = 0
    
    for juego in juegos[:8]:
        try:
            texto_juego = juego.get_text()
            
            es_finalizado, tiene_innings, tiene_pitchers = es_juego_finalizado(texto_juego)
            
            if not es_finalizado:
                print(f"⚠️ Juego no finalizado (innings: {tiene_innings}, pitchers: {tiene_pitchers}) - Saltando")
                continue
            
            equipos_divs = juego.find_all('div', class_='team-name')
            if not equipos_divs:
                equipos_divs = juego.find_all('div', style=True)
            
            if len(equipos_divs) < 2:
                print("⚠️ No se encontraron 2 equipos - Saltando")
                continue
            
            visitante_completo = equipos_divs[0].get_text(strip=True)
            local_completo = equipos_divs[1].get_text(strip=True)
            
            visitante = obtener_nombre_corto(visitante_completo)
            local = obtener_nombre_corto(local_completo)
            
            inning_match = re.search(r'Inning\s*(\d+)', texto_juego, re.IGNORECASE)
            innings = inning_match.group(1) if inning_match else "9"
            
            scores = []
            lines = texto_juego.split('\n')
            for i, line in enumerate(lines):
                if 'R' in line and 'H' in line and 'E' in line:
                    for j in range(i+1, min(i+3, len(lines))):
                        numeros = re.findall(r'\d+', lines[j])
                        if numeros:
                            scores.extend(numeros[:2])
                            break
            
            if len(scores) < 2:
                todos_numeros = re.findall(r'\d+', texto_juego)
                posibles_scores = [n for n in todos_numeros if 0 <= int(n) < 30]
                if len(posibles_scores) >= 2:
                    scores = posibles_scores[:2]
            
            score_visitante = scores[0] if len(scores) > 0 else "0"
            score_local = scores[1] if len(scores) > 1 else "0"
            
            pitcher_ganador = ""
            pitcher_perdedor = ""
            pitcher_salvador = ""
            
            match_g = re.search(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+P:|\s+S:|\s+BOXSCORE|\n|$)', texto_juego, re.IGNORECASE)
            if match_g:
                pitcher_ganador = match_g.group(1).strip().replace('BOXSCORE', '').strip()
            
            match_p = re.search(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+S:|\s+BOXSCORE|\n|$)', texto_juego, re.IGNORECASE)
            if match_p:
                pitcher_perdedor = match_p.group(1).strip().replace('BOXSCORE', '').strip()
            
            match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+BOXSCORE|\n|$)', texto_juego, re.IGNORECASE)
            if match_s:
                pitcher_salvador = match_s.group(1).strip().replace('BOXSCORE', '').strip()
            
            juegos_validos_encontrados += 1
            
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
            
            print(f"✅ Juego extraído: {visitante} {score_visitante} - {score_local} {local} ({innings} innings)")
            
        except Exception as e:
            print(f"⚠️ Error procesando juego: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    if juegos_validos_encontrados == 0:
        print(" NO hay juegos finalizados válidos")
        return None
        
    print(f"✅ Extraídos {len(datos)} resultados")
    return datos

def extraer_calendario(driver):
    print("📅 Extrayendo Calendario...")
    driver.get(URL_CALENDARIO)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    hoy_dia = datetime.now().strftime("%d").lstrip('0')
    hoy_mes = datetime.now().strftime("%B").lower()
    hoy_mes_es = None
    for mes_es, mes_en in MESES_ESPANOL.items():
        if mes_en == hoy_mes:
            hoy_mes_es = mes_es
            break
    
    print(f"📅 Buscando juegos del día: {hoy_dia} de {hoy_mes_es or hoy_mes}")
    
    todas_secciones = soup.find_all(['h2', 'h3', 'h4'])
    
    seccion_hoy = None
    for seccion in todas_secciones:
        texto = seccion.get_text(strip=True).lower()
        if (hoy_dia in texto and (hoy_mes_es in texto or hoy_mes in texto)) or \
           (f"viernes {hoy_dia}" in texto) or \
           (f"{hoy_dia} de {hoy_mes_es}" in texto if hoy_mes_es else False):
            seccion_hoy = seccion
            print(f"✅ Sección de hoy encontrada: {seccion.get_text(strip=True)}")
            break
    
    if not seccion_hoy:
        print(f"⚠️ No se encontró sección específica para el día {hoy_dia}")
        return []
    
    juegos = []
    hermano = seccion_hoy.find_next_sibling()
    while hermano and hermano.name in ['div', 'section']:
        if hermano.get('class') and any('card' in str(c).lower() for c in hermano.get('class')):
            juegos.append(hermano)
        elif len(juegos) < 10 and ('@' in hermano.get_text() or 'vs' in hermano.get_text().lower()):
            juegos.append(hermano)
        hermano = hermano.find_next_sibling()
    
    print(f"🔍 Encontradas {len(juegos)} tarjetas candidatas")
    
    datos = []
    for juego in juegos[:6]:
        try:
            texto_juego = juego.get_text()
            
            es_programado, tiene_hora, tiene_estadio, tiene_logos = es_juego_programado(texto_juego)
            
            if not es_programado:
                print(f"⚠️ Juego no es programado (hora: {tiene_hora}, estadio: {tiene_estadio}, logos: {tiene_logos}) - Saltando")
                continue
            
            equipos_divs = juego.find_all('div', class_='team-name')
            if not equipos_divs:
                equipos_divs = juego.find_all('div', style=True)
            
            if len(equipos_divs) < 2:
                continue
            
            visitante_completo = equipos_divs[0].get_text(strip=True)
            local_completo = equipos_divs[1].get_text(strip=True)
            
            visitante = obtener_nombre_corto(visitante_completo)
            local = obtener_nombre_corto(local_completo)
            
            hora = "7:00 PM"
            hora_match = re.search(r'(\d{1,2}:\d{2}\s*[AP]M)', texto_juego, re.IGNORECASE)
            if hora_match:
                hora = hora_match.group(1)
            
            estadio = "Por confirmar"
            estadio_match = re.search(r'(Estadio\s+[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+PREVIA|\n)', texto_juego, re.IGNORECASE)
            if estadio_match:
                estadio = estadio_match.group(1).strip()
            
            canales_detectados = detectar_canales(juego)
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
            
            print(f"✅ Juego programado: {visitante} vs {local} - {hora} - {estadio} - {transmision}")
            
        except Exception as e:
            print(f"️ Error procesando juego del calendario: {e}")
            continue
    
    print(f"✅ Extraídos {len(datos)} juegos del calendario")
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
        print(f"✅ {file_path} actualizado correctamente.")
    else:
        print(f"❌ Error al actualizar {file_path}: {response.text}")

def main():
    print("🚀 Iniciando Bot Diario LVBP...")
    if not TOKEN:
        print("❌ ERROR: No se encontró el GITHUB_TOKEN")
        return
        
    driver = iniciar_driver()
    try:
        # 1. Posiciones
        posiciones = extraer_posiciones(driver)
        if posiciones:
            actualizar_archivo_github('js/datos/posiciones.js', posiciones, "🤖 Bot: Actualización diaria de Posiciones")
        
        # 2. Resultados
        resultados = extraer_resultados(driver)
        if resultados is not None:
            if len(resultados) > 0:
                actualizar_archivo_github('js/datos/resultados.js', resultados, "🤖 Bot: Actualización diaria de Resultados")
            else:
                print("⚠️ Lista de resultados vacía - No se actualiza")
        else:
            print("🔒 Resultados: NO se actualiza")
        
        # 3. Calendario
        calendario = extraer_calendario(driver)
        if calendario:
            actualizar_archivo_github('js/datos/calendario.js', calendario, "🤖 Bot: Actualización diaria de Calendario")
        
    except Exception as e:
        print(f"❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("🏁 Bot Diario finalizado.")

if __name__ == '__main__':
    main()
