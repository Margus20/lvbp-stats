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
        logger.error(f"Error procesando nombre: {e}")
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
    try:
        patron_iso = re.compile(r'(\d{4}-\d{2}-\d{2})')
        match = patron_iso.search(texto)
        if match:
            return match.group(1)
        return None
    except:
        return None

def extraer_posiciones(driver):
    logger.info(" Extrayendo Posiciones...")
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
            logger.error(" No se encontró tabla de posiciones")
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
        
        if len(datos) < 8:
            logger.error(f" Datos incompletos: solo {len(datos)} equipos")
            return []
        
        logger.info(f" Extraídas {len(datos)} posiciones")
        return datos
    except Exception as e:
        logger.error(f" Error crítico en posiciones: {e}")
        return []
        
        def extraer_resultados(driver):
            logger.info(" Extrayendo Resultados...")
            try:
                driver.get(URL_RESULTADOS)
                WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                time.sleep(3)
        
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                todos_divs = soup.find_all('div')
                candidatos = []
        
                # MÉTODO 1: Buscar "Finalizado"
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
            except:
                continue
        
        logger.info(f" Método 1 (Finalizado): {len(candidatos)}")
        
        # MÉTODO 2: Buscar "BOXSCORE" (indicador de juego terminado)
        if len(candidatos) == 0:
            for div in todos_divs:
                try:
                    texto = div.get_text()
                    if 'BOXSCORE' in texto:
                        equipos_en_div = []
                        for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                            if nombre_corto in texto:
                                equipos_en_div.append(nombre_corto)
                        if len(equipos_en_div) >= 2:
                            candidatos.append((div, equipos_en_div, texto))
                except:
                    continue
            logger.info(f" Método 2 (BOXSCORE): {len(candidatos)}")
        
        # MÉTODO 3: Buscar por pitchers (G:, P:, S:)
        if len(candidatos) == 0:
            for div in todos_divs:
                try:
                    texto = div.get_text()
                    if re.search(r'[GPS]:\s*[A-Za-z]', texto):
                        equipos_en_div = []
                        for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                            if nombre_corto in texto:
                                equipos_en_div.append(nombre_corto)
                        if len(equipos_en_div) >= 2:
                            candidatos.append((div, equipos_en_div, texto))
                except:
                    continue
            logger.info(f" Método 3 (Pitchers): {len(candidatos)}")
        
        # MÉTODO 4: Buscar por estructura R H E con scores
        if len(candidatos) == 0:
            for div in todos_divs:
                try:
                    texto = div.get_text()
                    lines = texto.split('\n')
                    tiene_rhe = any('R' in line and 'H' in line and 'E' in line for line in lines)
                    if tiene_rhe:
                        equipos_en_div = []
                        for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                            if nombre_corto in texto:
                                equipos_en_div.append(nombre_corto)
                        if len(equipos_en_div) >= 2:
                            candidatos.append((div, equipos_en_div, texto))
                except:
                    continue
            logger.info(f" Método 4 (R H E): {len(candidatos)}")
        
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
            except:
                continue
        
        logger.info(f" Después de filtrar anidados: {len(divs_finales)}")
        
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
                
                try:
                    inning_match = PATTERNS['inning'].search(texto)
                    innings = inning_match.group(1) if inning_match else "9"
                except:
                    innings = "9"
                
                pitcher_ganador = ""
                pitcher_perdedor = ""
                pitcher_salvador = ""
                
                try:
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
                
                logger.info(f" Juego: {visitante} {score_visitante} - {score_local} {local}")
            except Exception as e:
                logger.error(f" Error procesando juego: {e}")
                continue
        
        if len(datos) == 0:
            logger.error(" No se extrajeron juegos válidos")
            return None
        
        logger.info(f" Extraídos {len(datos)} resultados")
        return datos
    except Exception as e:
        logger.error(f" Error crítico en resultados: {e}")
        return None

def extraer_calendario(driver):
    logger.info(" Extrayendo Calendario...")
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
                logger.warning(f"Error procesando div: {e}")
                continue
        
        logger.info(f" Divs con PREVIA: {len(divs_con_previa)}")
        
        # Filtrado RELAJADO: Solo eliminar duplicados exactos
        divs_finales = []
        textos_vistos = set()
        
        for div, equipos, texto in divs_con_previa:
            try:
                # Crear firma única del juego
                firma = f"{equipos[0]}-{equipos[1]}"
                if firma not in textos_vistos:
                    textos_vistos.add(firma)
                    divs_finales.append((div, equipos, texto))
            except Exception as e:
                logger.warning(f"Error filtrando: {e}")
                continue
        
        logger.info(f" Después de filtrar duplicados: {len(divs_finales)}")
        
        datos = []
        juegos_vistos = set()
        
        for div, equipos, texto in divs_finales[:6]:
            try:
                visitante = equipos[0]
                local = equipos[1]
                clave = f"{visitante}-{local}"
                if clave in juegos_vistos:
                    continue
                juegos_vistos.add(clave)
                
                hora = "7:00 PM"
                try:
                    hora_match = PATTERNS['hora'].search(texto)
                    if hora_match:
                        hora = hora_match.group(1)
                except:
                    pass
                
                estadio = "Por confirmar"
                try:
                    estadio_match = PATTERNS['estadio'].search(texto)
                    if estadio_match:
                        estadio = estadio_match.group(1).strip()
                except:
                    pass
                
                try:
                    canales_detectados = detectar_canales(div)
                    transmision = " / ".join(canales_detectados) if canales_detectados else "Por confirmar"
                except:
                    transmision = "Por confirmar"
                
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
                
                logger.info(f" Juego: {visitante} vs {local} - {hora}")
            except Exception as e:
                logger.error(f" Error procesando juego: {e}")
                continue
        
        if len(datos) == 0:
            logger.warning(" No se extrajeron juegos")
            return []
        
        logger.info(f" Extraídos {len(datos)} juegos")
        return datos
    except Exception as e:
        logger.error(f" Error crítico en calendario: {e}")
        return []

def actualizar_archivo_github(file_path, datos_lista, mensaje_commit):
    try:
        if not datos_lista:
            logger.warning(f" Lista vacía para {file_path}")
            return False
        
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{file_path}"
        headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
        
        response = requests.get(url, headers=headers, timeout=10)
        sha = response.json().get('sha') if response.status_code == 200 else None
        
        nombre_constante = file_path.split('/')[-1].replace('.js', '').upper()
        js_content = f"export const {nombre_constante} = {json.dumps(datos_lista, indent=4, ensure_ascii=False)};\n"
        
        data = {
            "message": mensaje_commit,
            "content": base64.b64encode(js_content.encode('utf-8')).decode('utf-8'),
        }
        if sha:
            data["sha"] = sha
        
        for intento in range(3):
            try:
                put_response = requests.put(url, headers=headers, json=data, timeout=10)
                if put_response.status_code in [200, 201]:
                    logger.info(f" {file_path} actualizado")
                    return True
                elif put_response.status_code == 409 and intento < 2:
                    logger.warning(f" Conflicto en {file_path}, reintentando...")
                    time.sleep(2)
                    continue
                else:
                    logger.error(f" Error en {file_path}: {put_response.text}")
                    return False
            except requests.exceptions.RequestException as e:
                logger.error(f" Error de red intento {intento+1}: {e}")
                if intento < 2:
                    time.sleep(2)
                continue
        
        return False
    except Exception as e:
        logger.error(f" Error crítico actualizando {file_path}: {e}")
        return False

def main():
    logger.info(" Iniciando Bot Diario LVBP...")
    
    if not TOKEN:
        logger.error(" ERROR: No se encontró GITHUB_TOKEN")
        return
    
    driver = None
    try:
        driver = iniciar_driver()
        
        posiciones = extraer_posiciones(driver)
        if posiciones:
            actualizar_archivo_github('js/datos/posiciones.js', posiciones, " Bot: Posiciones")
        else:
            logger.error(" Posiciones: NO se actualiza")
        
        resultados = extraer_resultados(driver)
        if resultados is not None and len(resultados) > 0:
            actualizar_archivo_github('js/datos/resultados.js', resultados, " Bot: Resultados")
        else:
            logger.warning(" Resultados: NO se actualiza")
        
        calendario = extraer_calendario(driver)
        if calendario and len(calendario) > 0:
            actualizar_archivo_github('js/datos/calendario.js', calendario, " Bot: Calendario")
        else:
            logger.warning(" Calendario: NO se actualiza")
        
        logger.info(" Bot finalizado")
        
    except Exception as e:
        logger.exception(f" Error fatal: {e}")
    finally:
        if driver:
            driver.quit()
            logger.info(" Driver cerrado")

if __name__ == '__main__':
    main()
