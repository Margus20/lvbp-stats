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

def leer_fecha_pagina(driver):
    """Lee la fecha que muestra la página actualmente"""
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Buscar texto con formato de fecha
        # Patrones: "22 de octubre 2026", "22 octubre 2026"
        elementos = soup.find_all(['div', 'span', 'h2', 'h3', 'p', 'button'])
        
        for elem in elementos:
            texto = elem.get_text(strip=True)
            
            # Solo textos cortos (evitar calendarios completos)
            if len(texto) > 60:
                continue
            
            # Patrón: "22 de octubre 2026"
            match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', texto, re.IGNORECASE)
            if match:
                dia = int(match.group(1))
                mes_texto = match.group(2).lower()
                anio = int(match.group(3))
                mes = MESES_ESPANOL.get(mes_texto)
                if mes:
                    fecha = datetime(anio, mes, dia)
                    logger.info(f" Fecha detectada en página: {fecha.strftime('%d/%m/%Y')} (texto: '{texto}')")
                    return fecha
            
            # Patrón: "22 octubre 2026"
            match2 = re.search(r'(\d{1,2})\s+(\w+)\s+(\d{4})', texto, re.IGNORECASE)
            if match2:
                dia = int(match2.group(1))
                mes_texto = match2.group(2).lower()
                anio = int(match2.group(3))
                mes = MESES_ESPANOL.get(mes_texto)
                if mes:
                    fecha = datetime(anio, mes, dia)
                    logger.info(f"📅 Fecha detectada: {fecha.strftime('%d/%m/%Y')} (texto: '{texto}')")
                    return fecha
        
        logger.warning("⚠️ No se pudo detectar la fecha en la página")
        return None
        
    except Exception as e:
        logger.error(f"❌ Error leyendo fecha: {e}")
        return None

def navegar_a_ayer(driver):
    """Lee la fecha actual y navega hasta ayer"""
    try:
        fecha_ayer = datetime.now() - timedelta(days=1)
        logger.info(f"🎯 Fecha objetivo (ayer): {fecha_ayer.strftime('%d/%m/%Y')}")
        
        # PASO 1: Leer fecha actual de la página
        fecha_actual = leer_fecha_pagina(driver)
        
        if not fecha_actual:
            logger.warning("⚠️ No se pudo leer la fecha, intentando clic en flecha izquierda por defecto")
            # Intentar clic directo en flecha izquierda
            try:
                botones = driver.find_elements(By.XPATH, "//button | //a | //*[@role='button']")
                for boton in botones:
                    texto = boton.text.strip()
                    if texto in ['<', '‹', '«']:
                        driver.execute_script("arguments[0].click();", boton)
                        logger.info("✅ Clic en flecha izquierda (por defecto)")
                        time.sleep(3)
                        return True
            except Exception as e:
                logger.error(f"❌ Error: {e}")
            return False
        
        # PASO 2: Calcular diferencia
        diferencia = (fecha_actual - fecha_ayer).days
        logger.info(f" Diferencia: {diferencia} días")
        
        if diferencia == 0:
            logger.info("✅ Ya estamos en la fecha de ayer, no se necesita navegación")
            return True
        
        # PASO 3: Determinar dirección y cantidad de clics
        if diferencia > 0:
            # Fecha actual es FUTURA (hoy o mañana) → ir hacia atrás (izquierda)
            direccion = "izquierda"
            simbolo_buscar = ['<', '‹', '«']
            cantidad = diferencia
        else:
            # Fecha actual es PASADA (anteayer o antes) → ir hacia adelante (derecha)
            direccion = "derecha"
            simbolo_buscar = ['>', '›', '»']
            cantidad = abs(diferencia)
        
        logger.info(f"👉 Necesitamos {cantidad} clics hacia la {direccion}")
        
        # Limitar a 10 clics máximo
        if cantidad > 10:
            logger.warning(f"⚠️ Demasiados clics ({cantidad}), limitando a 10")
            cantidad = 10
        
        # PASO 4: Hacer los clics necesarios
        for i in range(cantidad):
            try:
                botones = driver.find_elements(By.XPATH, "//button | //a | //*[@role='button']")
                clic_hecho = False
                
                for boton in botones:
                    texto = boton.text.strip()
                    aria_label = boton.get_attribute('aria-label') or ''
                    
                    if texto in simbolo_buscar or 'anterior' in aria_label.lower() or 'previous' in aria_label.lower() or 'siguiente' in aria_label.lower() or 'next' in aria_label.lower():
                        # Verificar dirección correcta
                        if direccion == "izquierda" and (texto in ['<', '‹', '«'] or 'anterior' in aria_label.lower() or 'previous' in aria_label.lower()):
                            driver.execute_script("arguments[0].click();", boton)
                            clic_hecho = True
                            break
                        elif direccion == "derecha" and (texto in ['>', '›', '»'] or 'siguiente' in aria_label.lower() or 'next' in aria_label.lower()):
                            driver.execute_script("arguments[0].click();", boton)
                            clic_hecho = True
                            break
                
                if clic_hecho:
                    logger.info(f"✅ Clic {i+1}/{cantidad} hacia la {direccion}")
                    time.sleep(3)  # Esperar a que cargue
                else:
                    logger.warning(f"⚠️ No se encontró botón en clic {i+1}")
                    break
                    
            except Exception as e:
                logger.error(f"❌ Error en clic {i+1}: {e}")
                break
        
        # PASO 5: Verificar que llegamos a la fecha correcta
        fecha_final = leer_fecha_pagina(driver)
        if fecha_final:
            if fecha_final == fecha_ayer:
                logger.info(f"✅ Fecha confirmada: {fecha_final.strftime('%d/%m/%Y')}")
                return True
            else:
                logger.warning(f"⚠️ Fecha final: {fecha_final.strftime('%d/%m/%Y')}, esperada: {fecha_ayer.strftime('%d/%m/%Y')}")
                # Si la diferencia es pequeña, reintentar
                nueva_diferencia = (fecha_final - fecha_ayer).days
                if abs(nueva_diferencia) <= 3:
                    logger.info(f"🔄 Reintentando navegación ({abs(nueva_diferencia)} días de diferencia)...")
                    return navegar_a_ayer(driver)
        return False
        
    except Exception as e:
        logger.error(f"❌ Error en navegación: {e}")
        return False

def extraer_resultados(driver):
    """Extrae juegos finalizados con debugging"""
    logger.info(" Extrayendo resultados...")
    
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # DEBUG: Mostrar fecha actual de la página
        fecha_actual = leer_fecha_pagina(driver)
        if fecha_actual:
            logger.info(f"📅 Fecha actual en página: {fecha_actual.strftime('%d/%m/%Y')}")
        
        # Buscar TODOS los divs
        todos_divs = soup.find_all('div')
        logger.info(f"📊 Total de divs encontrados: {len(todos_divs)}")
        
        # DEBUG: Buscar divs con "Finalizado"
        logger.info(" Buscando divs con 'Finalizado' o 'final':")
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
            # Mostrar algunos divs grandes
            logger.info("🔍 Divs grandes encontrados:")
            for i, div in enumerate(todos_divs[:30]):
                texto = div.get_text()
                if len(texto) > 100:
                    logger.info(f"  Div {i} ({len(texto)} chars): '{texto[:150]}...'")
        
        # Extraer juegos
        juegos = []
        juegos_procesados = set()
        
        for div in todos_divs:
            try:
                texto = div.get_text()
                
                # FILTRO: Solo juegos finalizados
                if 'Finalizado' not in texto and 'finalizado' not in texto:
                    continue
                
                # Buscar equipos en orden
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
                            for k in range(j+1, min(j+4, len(lines))):
                                numeros = re.findall(r'\b(\d+)\b', lines[k])
                                if numeros and len(numeros) >= 2:
                                    score_visitante = numeros[0]
                                    score_local = numeros[1]
                                    break
                            break
                    
                    # Innings
                    innings = "9"
                    inning_match = re.search(r'Inning\s*(\d+)', texto, re.IGNORECASE)
                    if inning_match:
                        innings = inning_match.group(1)
                    
                    # Pitchers
                    pitcher_ganador = pitcher_perdedor = pitcher_salvador = ""
                    
                    if 'G:' in texto:
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
                        'fecha': fecha_ayer.strftime("%Y-%m-%d") if fecha_actual else (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
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
                continue
        
        logger.info(f"📊 Total extraídos: {len(juegos)}")
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
        
        # PASO 1: Navegar a ayer (lee fecha y ajusta)
        if not navegar_a_ayer(driver):
            logger.warning("⚠️ No se pudo navegar a ayer con certeza")
        
        time.sleep(2)
        
        # PASO 2: Extraer resultados
        resultados = extraer_resultados(driver)
        
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
