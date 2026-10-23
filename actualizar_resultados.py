import os
import requests
import base64
import json
import logging
import re
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

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

MESES_ESPANOL = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
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

def navegar_a_ayer(driver):
    try:
        fecha_ayer = datetime.now() - timedelta(days=1)
        logger.info(f" Fecha objetivo: {fecha_ayer.strftime('%d/%m/%Y')}")
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        fecha_texto = soup.find(string=re.compile(r'\d{1,2}\s+de\s+\w+\s+\d{4}'))
        
        if fecha_texto:
            match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', str(fecha_texto))
            if match:
                dia = int(match.group(1))
                mes = MESES_ESPANOL.get(match.group(2).lower())
                anio = int(match.group(3))
                if mes:
                    fecha_actual = datetime(anio, mes, dia)
                    diferencia = (fecha_actual - fecha_ayer).days
                    
                    if diferencia == 0:
                        logger.info("✅ Ya estamos en ayer")
                        return True
                    
                    logger.info(f"📊 Diferencia: {diferencia} días")
                    
                    if diferencia > 0:
                        simbolo = '<'
                    else:
                        simbolo = '>'
                        diferencia = abs(diferencia)
                    
                    for i in range(min(diferencia, 10)):
                        botones = driver.find_elements(By.CSS_SELECTOR, "button, a")
                        for boton in botones:
                            if boton.text.strip() == simbolo:
                                driver.execute_script("arguments[0].click();", boton)
                                logger.info(f"✅ Clic {i+1}")
                                time.sleep(2)
                                break
                        time.sleep(1)
                    
                    return True
        
        return False
    except Exception as e:
        logger.error(f"❌ Error navegando: {e}")
        return False

def extraer_tarjetas_juego(driver):
    logger.info(" Extrayendo resultados (DEBUG)...")
    
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Buscar TODOS los divs
        todos_divs = soup.find_all('div')
        logger.info(f"📊 Total de divs encontrados: {len(todos_divs)}")
        
        # DEBUG: Mostrar divs que contienen "Finalizado"
        logger.info("🔍 Buscando divs con 'Finalizado' o 'final':")
        divs_con_final = []
        for i, div in enumerate(todos_divs):
            texto = div.get_text()
            if 'finalizado' in texto.lower() or 'final' in texto.lower():
                divs_con_final.append((i, texto[:200]))
                if len(divs_con_final) >= 10:
                    break
        
        if divs_con_final:
            for idx, texto in divs_con_final:
                logger.info(f"  ✅ Div {idx}: '{texto}'")
        else:
            logger.info("⚠️ No se encontró 'Finalizado' en ningún div")
            # Mostrar algunos divs grandes para ver la estructura
            logger.info("🔍 Divs grandes encontrados:")
            for i, div in enumerate(todos_divs[:30]):
                texto = div.get_text()
                if len(texto) > 100:
                    logger.info(f"  Div {i} ({len(texto)} chars): '{texto[:150]}...'")
        
        # Buscar tarjetas de juego
        tarjetas = soup.find_all('div', class_=lambda x: x and any(kw in x.lower() for kw in ['game', 'card', 'match', 'resultado']))
        
        if not tarjetas:
            tarjetas = soup.find_all('div')
        
        logger.info(f" Tarjetas candidatas: {len(tarjetas)}")
        
        juegos = []
        juegos_procesados = set()
        
        for tarjeta in tarjetas:
            try:
                texto = tarjeta.get_text()
                
                # FILTRO: Solo juegos finalizados
                if 'Finalizado' not in texto and 'finalizado' not in texto:
                    continue
                
                # Extraer equipos en orden
                equipos_encontrados = []
                for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                    if nombre_corto in texto:
                        equipos_encontrados.append(nombre_corto)
                
                if len(equipos_encontrados) < 2:
                    continue
                
                # Procesar de 2 en 2 (visitante, local)
                for i in range(0, len(equipos_encontrados), 2):
                    if i + 1 >= len(equipos_encontrados):
                        break
                    
                    visitante = equipos_encontrados[i]
                    local = equipos_encontrados[i + 1]
                    
                    clave = f"{visitante}-{local}"
                    if clave in juegos_procesados:
                        continue
                    juegos_procesados.add(clave)
                    
                    # Extraer scores
                    score_visitante = "0"
                    score_local = "0"
                    
                    lines = texto.split('\n')
                    for j, line in enumerate(lines):
                        if 'R' in line and 'H' in line and 'E' in line:
                            numeros_encontrados = []
                            for k in range(j+1, min(j+4, len(lines))):
                                nums = re.findall(r'\b(\d+)\b', lines[k])
                                if nums:
                                    numeros_encontrados.extend(nums)
                                    break
                            
                            if len(numeros_encontrados) >= 2:
                                score_visitante = numeros_encontrados[0]
                                score_local = numeros_encontrados[1]
                            break
                    
                    if score_visitante == "0" or score_local == "0":
                        match_scores = re.search(r'(\d{1,2})\s+\d+\s+\d+.*?(\d{1,2})\s+\d+\s+\d+', texto, re.DOTALL)
                        if match_scores:
                            score_visitante = match_scores.group(1)
                            score_local = match_scores.group(2)
                    
                    # Innings
                    innings = "9"
                    inning_match = re.search(r'Inning\s*(\d+)', texto, re.IGNORECASE)
                    if inning_match:
                        innings = inning_match.group(1)
                    
                    # Pitchers
                    pitcher_ganador = pitcher_perdedor = pitcher_salvador = ""
                    
                    if 'G:' in texto or 'g:' in texto.lower():
                        match_g = re.search(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s,\.]+?)(?:\s+P:|\s+S:|\s+BOXSCORE|\n\n|$)', texto, re.IGNORECASE)
                        if match_g:
                            pitcher_ganador = match_g.group(1).strip().split(',')[0].strip()
                        
                        match_p = re.search(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s,\.]+?)(?:\s+S:|\s+BOXSCORE|\n\n|$)', texto, re.IGNORECASE)
                        if match_p:
                            pitcher_perdedor = match_p.group(1).strip().split(',')[0].strip()
                        
                        match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s,\.]+?)(?:\s+BOXSCORE|\n\n|$)', texto, re.IGNORECASE)
                        if match_s:
                            pitcher_salvador = match_s.group(1).strip().split(',')[0].strip()
                    
                    juegos.append({
                        'fecha': (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
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
                    
                    logger.info(f"✅ Juego: {visitante} {score_visitante} - {score_local} {local}")
                
            except Exception as e:
                logger.warning(f"⚠️ Error procesando tarjeta: {e}")
                continue
        
        logger.info(f"📊 Total de juegos extraídos: {len(juegos)}")
        return juegos if juegos else None
        
    except Exception as e:
        logger.error(f"❌ Error crítico: {e}")
        return None

def actualizar_github(file_path, datos, mensaje):
    if not datos:
        logger.warning(f"⚠️ Lista vacía para {file_path}")
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
        logger.info(f"✅ {file_path} actualizado")
        return True
    else:
        logger.error(f"❌ Error: {put_response.text}")
        return False

def main():
    logger.info("🚀 Iniciando Bot de Resultados...")
    if not TOKEN:
        logger.error("❌ No hay GITHUB_TOKEN")
        return
    
    driver = None
    try:
        driver = iniciar_driver()
        driver.get(URL_RESULTADOS)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(3)
        
        navegar_a_ayer(driver)
        time.sleep(2)
        
        resultados = extraer_tarjetas_juego(driver)
        
        if resultados and len(resultados) > 0:
            logger.info(f"✅ Extraídos {len(resultados)} juegos")
            actualizar_github('js/datos/resultados.js', resultados, "🤖 Bot: Resultados")
        else:
            logger.error("❌ No se extrajeron juegos")
        
        logger.info(" Bot finalizado")
        
    except Exception as e:
        logger.exception(f"❌ Error fatal: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    main()
