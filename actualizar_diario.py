import os
import requests
import base64
import time
import json
import re
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

# Configurar Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

CANALES_TV = {
    'ivc': 'IVC', 'ivctv': 'IVC', 'tves': 'TVES',
    'bym': 'BYM Sport', 'bymtv': 'BYM Sport',
    'baseball': 'Baseball', 'baseballtv': 'Baseball',
    'meridiano': 'Meridiano TV', 'meridianotv': 'Meridiano TV'
}

# Regex compilados para mejor rendimiento
PATTERNS = {
    'hora': re.compile(r'(\d{1,2}:\d{2}\s*[AP]M)', re.IGNORECASE),
    'estadio': re.compile(r'(Estadio\s+[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+PREVIA|\n)', re.IGNORECASE),
    'inning': re.compile(r'Inning\s*(\d+)', re.IGNORECASE),
    'pitcher_g': re.compile(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+P:|\s+S:|\s+BOXSCORE|\n|$)', re.IGNORECASE),
    'pitcher_p': re.compile(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+S:|\s+BOXSCORE|\n|$)', re.IGNORECASE),
    'pitcher_s': re.compile(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+BOXSCORE|\n|$)', re.IGNORECASE),
    'numeros': re.compile(r'\d+'),
    'numeros_aislados': re.compile(r'\b\d{1,2}\b')
}

def iniciar_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    return webdriver.Chrome(options=chrome_options)

def obtener_nombre_corto(nombre_completo):
    try:
        if not nombre_completo:
            return ''
        for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
            if nombre_largo.lower() in nombre_completo.lower():
                return nombre_corto
        
        nombre_lower = nombre_completo.lower()
        mapeo_parcial = {
            'navegantes': 'Magallanes', 'magallanes': 'Magallanes',
            'caribes': 'Caribes', 'tigres': 'Tigres', 'aragua': 'Tigres',
            'cardenales': 'Cardenales', 'lara': 'Cardenales',
            'bravos': 'Bravos', 'margarita': 'Bravos',
            'tiburones': 'Tiburones', 'guaira': 'Tiburones',
            'aguilas': 'Águilas', 'zulia': 'Águilas',
            'leones': 'Leones', 'caracas': 'Leones'
        }
        for clave, corto in mapeo_parcial.items():
            if clave in nombre_lower:
                return corto
        return nombre_completo.split()[0] if nombre_completo else ''
    except Exception as e:
        logger.error(f"Error procesando nombre '{nombre_completo}': {e}")
        return ''

def detectar_canales(juego):
    try:
        canales_detectados = []
        imagenes = juego.find_all('img') if hasattr(juego, 'find_all') else []
        for img in imagenes:
            alt = img.get('alt', '').lower()
            src = img.get('src', '').lower()
            texto_completo = f"{alt} {src}"
            for clave, nombre_canal in CANALES_TV.items():
                if clave in texto_completo and nombre_canal not in canales_detectados:
                    canales_detectados.append(nombre_canal)
                    break
        return canales_detectados
    except Exception as e:
        logger.warning(f"Error detectando canales: {e}")
        return []

def extraer_fecha_del_texto(texto):
    """Extrae la fecha real del texto en lugar de usar datetime.now()"""
    try:
        # Buscar patrones de fecha: "2026-10-23", "23 de octubre", "Octubre 23, 2026"
        patron_iso = re.compile(r'(\d{4}-\d{2}-\d{2})')
        match = patron_iso.search(texto)
        if match:
            return match.group(1)
        
        # Si no encuentra fecha ISO, retornar None (usará fecha actual como fallback)
        return None
    except:
        return None

def extraer_posiciones(driver):
    logger.info("📊 Extrayendo Posiciones...")
    try:
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
                        Select(select_elem).select_by_visible_text('2026')
                        time.sleep(1.5)
                        break
        except Exception as e:
            logger.warning(f"Aviso menor en pestañas/selects: {e}")
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        tablas = soup.find_all('table')
        if not tablas:
            logger.error("❌ No se encontró ninguna tabla de posiciones")
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
            try:
                tds = tr.find_all('td')
                if len(tds) > idx_eq:
                    nombre_completo = tds[idx_eq].get_text(strip=True)
                    datos.append({
                        'numero': i,
                        'nombre': obtener_nombre_corto(nombre_completo),
                        'jj': tds[idx_jj].get_text(strip=True) if idx_jj < len(tds) else '0',
                        'jg': tds[idx_jg].get_text(strip=True) if idx_jg < len(tds) else '0',
                        'jp': tds[idx_jp].get_text(strip=True) if idx_jp < len(tds) else '0',
                        'pct': tds[idx_pct].get_text(strip=True) if idx_pct < len(tds) else '.000',
                        'dif': tds[idx_dif].get_text(strip=True) if idx_dif < len(tds) else '-',
                        'racha': tds[idx_racha].get_text(strip=True) if idx_racha < len(tds) else ''
                    })
            except Exception as e:
                logger.warning(f"Error procesando fila {i}: {e}")
                continue
        
        # VALIDACIÓN: Debe tener al menos 8 equipos
        if len(datos) < 8:
            logger.error(f"❌ Datos incompletos: solo {len(datos)} equipos (mínimo 8)")
            return []
        
        logger.info(f"✅ Extraídas {len(datos)} posiciones correctamente")
        return datos
    except Exception as e:
        logger.error(f"❌ Error crítico en extraer_posiciones: {e}")
        return []

def extraer_resultados(driver):
    logger.info("🏆 Extrayendo Resultados...")
    try:
        driver.get(URL_RESULTADOS)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(3)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        todos_divs = soup.find_all('div')
        candidatos = []
        
        for div in todos_divs:
            try:
                texto = div.get_text()
                if 'Finalizado' in texto or 'finalizado' in texto:
                    equipos_en_div = []
                    for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                        if nombre_corto in texto:
                            equipos_en_div.append(nombre_corto)
                    if len(equipos_en_div) >= 2:
                        candidatos.append((div, equipos_en_div, texto))
            except Exception as e:
                logger.warning(f"Error procesando div candidato: {e}")
                continue
        
        logger.info(f" Candidatos iniciales: {len(candidatos)}")
        
        # Filtrar divs anidados
        divs_finales = []
        for i, (div1, eq1, txt1) in enumerate(candidatos):
            try:
                es_anidado = False
                for j, (div2, eq2, txt2) in enumerate(candidatos):
                    if i != j and div1 in div2.find_all('div'):
                        es_anidado = True
                        break
                if not es_anidado:
                    divs_finales.append((div1, eq1, txt1))
            except Exception as e:
                logger.warning(f"Error filtrando anidados: {e}")
                continue
        
        logger.info(f"✅ Después de filtrar anidados: {len(divs_finales)}")
        
        datos = []
        juegos_vistos = set()
        
        for div, equipos, texto in divs_finales[:8]:
            try:
                visitante = equipos[0]
                local = equipos[1]
                clave = f"{visitante}-{local}"
                if clave in juegos_vistos:
                    logger.debug(f"⚠️ Duplicado detectado: {clave}")
                    continue
                juegos_vistos.add(clave)
                
                # Extraer scores
                scores = []
                lines = texto.split('\n')
                for i, line in enumerate(lines):
                    if 'R' in line and 'H' in line and 'E' in line:
                        for j in range(i+1, min(i+3, len(lines))):
                            try:
                                numeros = PATTERNS['numeros'].findall(lines[j])
                                if numeros and len(numeros) >= 2:
                                    scores = [numeros[0], numeros[1]]
                                    break
                            except:
                                continue
                        break
                
                if len(scores) < 2:
                    try:
                        numeros_aislados = PATTERNS['numeros_aislados'].findall(texto)
                        posibles = [n for n in numeros_aislados if 0 <= int(n) <= 20]
                        if len(posibles) >= 2:
                            scores = [posibles[0], posibles[1]]
                    except:
                        pass
                
                score_visitante = scores[0] if len(scores) > 0 else "0"
                score_local = scores[1] if len(scores) > 1 else "0"
                
                # Extraer innings
                try:
                    inning_match = PATTERNS['inning'].search(texto)
                    innings = inning_match.group(1) if inning_match else "9"
                except:
                    innings = "9"
                
                # Extraer pitchers
                try:
                    pitcher_ganador = ""
                    pitcher_perdedor = ""
                    pitcher_salvador = ""
                    
                    match_g = PATTERNS['pitcher_g'].search(texto)
                    if match_g:
                        pitcher_ganador = match_g.group(1).strip()
                    
                    match_p = PATTERNS['pitcher_p'].search(texto)
                    if match_p:
                        pitcher_perdedor = match_p.group(1).strip()
                    
                    match_s = PATTERNS['pitcher_s'].search(texto)
                    if match_s:
                        pitcher_salvador = match_s.group(1).strip()
                except Exception as e:
                    logger.warning(f"Error extrayendo pitchers: {e}")
                    pitcher_ganador = pitcher_perdedor = pitcher_salvador = ""
                
                # Extraer fecha real del texto
                fecha_extraida = extraer_fecha_del_texto(texto)
                fecha_final = fecha_extraida if fecha_extraida else datetime.now().strftime("%Y-%m-%d")
                
                datos.append({
                    'fecha': fecha_final,
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
                
                logger.info(f"✅ Juego: {visitante} {score_visitante} - {score_local} {local} ({innings} inn)")
            except Exception as e:
                logger.error(f"❌ Error procesando juego: {e}")
                continue
        
        # VALIDACIÓN: Debe tener al menos 1 juego
        if len(datos) == 0:
            logger.error("❌ No se extrajeron juegos válidos")
            return None
        
        logger.info(f"✅ Extraídos {len(datos)} resultados únicos")
        return datos
    except Exception as e:
        logger.error(f"❌ Error crítico en extraer_resultados: {e}")
        return None

def extraer_calendario(driver):
    logger.info("📅 Extrayendo Calendario...")
    try:
        driver.get(URL_CALENDARIO)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(3)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        todos_divs = soup.find_all('div')
        divs_con_previa = []
        
        for div in todos_divs:
            try:
                texto = div.get_text()
                if 'PREVIA' in texto:
                    equipos_encontrados = []
                    for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                        if nombre_corto in texto:
                            equipos_encontrados.append(nombre_corto)
                    if len(equipos_encontrados) >= 2:
                        divs_con_previa.append((div, equipos_encontrados, texto))
            except Exception as e:
                logger.warning(f"Error procesando div con PREVIA: {e}")
                continue
        
        logger.info(f"🔍 Divs con PREVIA y 2+ equipos: {len(divs_con_previa)}")
        
        # Filtrar anidados
        divs_finales = []
        for i, (div1, eq1, txt1) in enumerate(divs_con_previa):
            try:
                es_anidado = False
                for j, (div2, eq2, txt2) in enumerate(divs_con_previa):
                    if i != j and div1 in div2.find_all('div'):
                        es_anidado = True
                        break
                if not es_anidado:
                    divs_finales.append((div1, eq1, txt1))
            except Exception as e:
                logger.warning(f"Error filtrando anidados: {e}")
                continue
        
        logger.info(f"✅ Después de filtrar anidados: {len(divs_finales)}")
        
        datos = []
        juegos_vistos = set()
        
        for div, equipos, texto in divs_finales[:6]:
            try:
                visitante = equipos[0]
                local = equipos[1]
                clave = f"{visitante}-{local}"
                if clave in juegos_vistos:
                    logger.debug(f"⚠️ Duplicado: {clave}")
                    continue
                juegos_vistos.add(clave)
                
                # Extraer hora
                try:
                    hora = "7:00 PM"
                    hora_match = PATTERNS['hora'].search(texto)
                    if hora_match:
                        hora = hora_match.group(1)
                except:
                    hora = "7:00 PM"
                
                # Extraer estadio
                try:
                    estadio = "Por confirmar"
                    estadio_match = PATTERNS['estadio'].search(texto)
                    if estadio_match:
                        estadio = estadio_match.group(1).strip()
                except:
                    estadio = "Por confirmar"
                
                # Extraer televisoras
                try:
                    canales_detectados = detectar_canales(div)
                    transmision = " / ".join(canales_detectados) if canales_detectados else "Por confirmar"
                except:
                    transmision = "Por confirmar"
                
                # Extraer fecha real
                fecha_extraida = extraer_fecha_del_texto(texto)
                fecha_final = fecha_extraida if fecha_extraida else datetime.now().strftime("%Y-%m-%d")
                
                datos.append({
                    'fecha': fecha_final,
                    'hora': hora,
                    'visitante': visitante,
                    'local': local,
                    'lugar': estadio,
                    'transmision': transmision,
                    'enVivo': False,
                    'finalizado': False
                })
                
                logger.info(f"✅ Juego: {visitante} vs {local} - {hora} - {estadio} - {transmision}")
            except Exception as e:
                logger.error(f"❌ Error procesando juego de calendario: {e}")
                continue
        
        # VALIDACIÓN: Debe tener al menos 1 juego
        if len(datos) == 0:
            logger.warning("⚠️ No se extrajeron juegos del calendario")
            return []
        
        logger.info(f"✅ Extraídos {len(datos)} juegos únicos")
        return datos
    except Exception as e:
        logger.error(f"❌ Error crítico en extraer_calendario: {e}")
        return []

def actualizar_archivo_github(file_path, datos_lista, mensaje_commit):
    """Actualiza archivo en GitHub con validaciones y reintentos"""
    try:
        if not datos_lista:
            logger.warning(f"⚠️ Lista vacía para {file_path}. No se actualizará GitHub.")
            return False
        
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{file_path}"
        headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
        
        # Obtener SHA actual
        response = requests.get(url, headers=headers, timeout=10)
        sha = response.json().get('sha') if response.status_code == 200 else None
        
        nombre_constante = file_path.split('/')[-1].replace('.js', '').upper()
        js_content = f"export const {nombre_constante} = {json.dumps(datos_lista, indent=4, ensure_ascii=False)};\n"
        
        data = {
            "message": mensaje_commit,
            "content": base64.b64e
