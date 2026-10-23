import os
import requests
import base64
import json
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
URL_RESULTADOS = 'https://stats.lvbp.com/resultados.php'

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
    return nombre_completo.split()[0] if nombre_completo else ''

def extraer_resultados(driver):
    logger.info("🏆 Extrayendo Resultados...")
    try:
        driver.get(URL_RESULTADOS)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        todos_divs = soup.find_all('div')
        candidatos = []
        
        # Método 1: Buscar "Finalizado"
        for div in todos_divs:
            try:
                texto = div.get_text()
                if 'Finalizado' in texto or 'finalizado' in texto:
                    equipos_en_div = [corto for largo, corto in NOMBRES_EQUIPOS.items() if corto in texto]
                    if len(equipos_en_div) >= 2:
                        candidatos.append((div, equipos_en_div, texto))
            except:
                continue
        logger.info(f" Método 1 (Finalizado): {len(candidatos)}")
        
        # Método 2: Buscar "BOXSCORE"
        if len(candidatos) == 0:
            for div in todos_divs:
                try:
                    texto = div.get_text()
                    if 'BOXSCORE' in texto:
                        equipos_en_div = [corto for largo, corto in NOMBRES_EQUIPOS.items() if corto in texto]
                        if len(equipos_en_div) >= 2:
                            candidatos.append((div, equipos_en_div, texto))
                except:
                    continue
            logger.info(f" Método 2 (BOXSCORE): {len(candidatos)}")
        
        # Método 3: Buscar por pitchers (G:, P:, S:)
        if len(candidatos) == 0:
            import re
            for div in todos_divs:
                try:
                    texto = div.get_text()
                    if re.search(r'[GPS]:\s*[A-Za-z]', texto):
                        equipos_en_div = [corto for largo, corto in NOMBRES_EQUIPOS.items() if corto in texto]
                        if len(equipos_en_div) >= 2:
                            candidatos.append((div, equipos_en_div, texto))
                except:
                    continue
            logger.info(f" Método 3 (Pitchers): {len(candidatos)}")
        
        # Filtrar duplicados
        divs_finales = []
        juegos_vistos = set()
        
        for div, equipos, texto in candidatos:
            try:
                firma = f"{equipos[0]}-{equipos[1]}"
                if firma not in juegos_vistos:
                    juegos_vistos.add(firma)
                    divs_finales.append((div, equipos, texto))
            except:
                continue
        
        logger.info(f" Después de filtrar: {len(divs_finales)}")
        
        datos = []
        for div, equipos, texto in divs_finales[:8]:
            try:
                visitante = equipos[0]
                local = equipos[1]
                
                # Extraer scores
                import re
                scores = []
                lines = texto.split('\n')
                for i, line in enumerate(lines):
                    if 'R' in line and 'H' in line and 'E' in line:
                        for j in range(i+1, min(i+3, len(lines))):
                            try:
                                numeros = re.findall(r'\d+', lines[j])
                                if numeros and len(numeros) >= 2:
                                    scores = [numeros[0], numeros[1]]
                                    break
                            except:
                                continue
                        break
                
                if len(scores) < 2:
                    try:
                        numeros_aislados = re.findall(r'\b\d{1,2}\b', texto)
                        posibles = [n for n in numeros_aislados if 0 <= int(n) <= 20]
                        if len(posibles) >= 2:
                            scores = [posibles[0], posibles[1]]
                    except:
                        pass
                
                score_visitante = scores[0] if len(scores) > 0 else "0"
                score_local = scores[1] if len(scores) > 1 else "0"
                
                # Extraer innings
                try:
                    inning_match = re.search(r'Inning\s*(\d+)', texto, re.IGNORECASE)
                    innings = inning_match.group(1) if inning_match else "9"
                except:
                    innings = "9"
                
                # Extraer pitchers
                pitcher_ganador = pitcher_perdedor = pitcher_salvador = ""
                try:
                    match_g = re.search(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+P:|\s+S:|\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
                    if match_g: pitcher_ganador = match_g.group(1).strip()
                    match_p = re.search(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+S:|\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
                    if match_p: pitcher_perdedor = match_p.group(1).strip()
                    match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+BOXSCORE|\n|$)', texto, re.IGNORECASE)
                    if match_s: pitcher_salvador = match_s.group(1).strip()
                except Exception as e:
                    logger.warning(f"Error extrayendo pitchers: {e}")
                
                # Extraer fecha
                try:
                    patron_fecha = re.compile(r'(\d{4}-\d{2}-\d{2})')
                    match = patron_fecha.search(texto)
                    fecha = match.group(1) if match else datetime.now().strftime("%Y-%m-%d")
                except:
                    fecha = datetime.now().strftime("%Y-%m-%d")
                
                datos.append({
                    'fecha': fecha,
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
        logger.error(f" Error crítico: {e}")
        return None

def actualizar_github(file_path, datos, mensaje):
    if not datos:
        logger.warning(f" Lista vacía para {file_path}")
        return False
    
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{file_path}"
    headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
    
    response = requests.get(url, headers=headers, timeout=10)
    sha = response.json().get('sha') if response.status_code == 200 else None
    
    nombre_constante = file_path.split('/')[-1].replace('.js', '').upper()
    js_content = f"export const {nombre_constante} = {json.dumps(datos, indent=4, ensure_ascii=False)};\n"
    
    data = {
        "message": mensaje,
        "content": base64.b64encode(js_content.encode('utf-8')).decode('utf-8'),
    }
    if sha:
        data["sha"] = sha
    
    put_response = requests.put(url, headers=headers, json=data, timeout=10)
    if put_response.status_code in [200, 201]:
        logger.info(f" {file_path} actualizado")
        return True
    else:
        logger.error(f" Error: {put_response.text}")
        return False

def main():
    logger.info("🚀 Iniciando Bot de Resultados...")
    if not TOKEN:
        logger.error(" No hay GITHUB_TOKEN")
        return
    
    driver = None
    try:
        driver = iniciar_driver()
        resultados = extraer_resultados(driver)
        if resultados:
            actualizar_github('js/datos/resultados.js', resultados, "🤖 Bot: Resultados")
        else:
            logger.error(" Resultados: NO se actualiza")
        logger.info(" Bot finalizado")
    except Exception as e:
        logger.exception(f" Error fatal: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    main()
