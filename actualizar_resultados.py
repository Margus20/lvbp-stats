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
    """Lee la fecha principal que muestra la página"""
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Buscar en el selector de fecha (generalmente está en un div/h2 destacado)
        elementos_fecha = soup.find_all(['div', 'span', 'h2', 'h3', 'p'])
        
        for elem in elementos_fecha:
            texto = elem.get_text(strip=True)
            
            # Patrón: "22 de octubre 2026"
            match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', texto, re.IGNORECASE)
            if match:
                dia = int(match.group(1))
                mes_texto = match.group(2).lower()
                anio = int(match.group(3))
                mes = MESES_ESPANOL.get(mes_texto)
                if mes:
                    return datetime(anio, mes, dia)
            
            # Patrón: "octubre 22, 2026"
            match2 = re.search(r'(\w+)\s+(\d{1,2}),?\s+(\d{4})', texto, re.IGNORECASE)
            if match2:
                mes_texto = match2.group(1).lower()
                dia = int(match2.group(2))
                anio = int(match2.group(3))
                mes = MESES_ESPANOL.get(mes_texto)
                if mes:
                    return datetime(anio, mes, dia)
        
        return None
    except Exception as e:
        logger.error(f"❌ Error leyendo fecha: {e}")
        return None

def navegar_a_fecha_ayer(driver):
    """Navega estrictamente hasta la fecha de ayer"""
    try:
        fecha_ayer = datetime.now() - timedelta(days=1)
        logger.info(f"🎯 Fecha objetivo (ayer): {fecha_ayer.strftime('%d/%m/%Y')}")
        
        # Leer fecha actual
        fecha_actual = leer_fecha_pagina(driver)
        
        if not fecha_actual:
            logger.warning("️ No se pudo leer fecha, intentando clic en flecha izquierda")
            try:
                botones = driver.find_elements(By.CSS_SELECTOR, "button, a, [role='button']")
                for boton in botones:
                    texto = boton.text.strip()
                    if texto in ['<', '‹', '«']:
                        driver.execute_script("arguments[0].click();", boton)
                        time.sleep(2)
                        return True
            except Exception as e:
                logger.error(f"❌ Error: {e}")
            return False
        
        diferencia = (fecha_actual - fecha_ayer).days
        logger.info(f"📊 Diferencia: {diferencia} días")
        
        if diferencia == 0:
            logger.info("✅ Ya estamos en la fecha de ayer")
            return True
        
        # Determinar dirección
        if diferencia > 0:
            direccion = "izquierda"
            simbolo_buscar = ['<', '‹', '«']
        else:
            direccion = "derecha"
            simbolo_buscar = ['>', '›', '»']
        
        cantidad_clics = abs(diferencia)
        logger.info(f"👉 {cantidad_clics} clics hacia la {direccion}")
        
        if cantidad_clics > 15:
            logger.warning(f"⚠️ Demasiados clics ({cantidad_clics}), limitando a 15")
            cantidad_clics = 15
        
        # Hacer clics uno por uno verificando la fecha
        for i in range(cantidad_clics):
            try:
                botones = driver.find_elements(By.CSS_SELECTOR, "button, a, [role='button']")
                clic_hecho = False
                
                for boton in botones:
                    texto = boton.text.strip()
                    if texto in simbolo_buscar:
                        driver.execute_script("arguments[0].click();", boton)
                        clic_hecho = True
                        break
                
                if clic_hecho:
                    logger.info(f"✅ Clic {i+1}/{cantidad_clics}")
                    time.sleep(2)
                else:
                    logger.warning(f"⚠️ No se encontró botón en clic {i+1}")
                    break
                    
            except Exception as e:
                logger.error(f"❌ Error en clic {i+1}: {e}")
                break
        
        # Verificación final
        fecha_final = leer_fecha_pagina(driver)
        if fecha_final:
            if fecha_final == fecha_ayer:
                logger.info(f"✅ Fecha confirmada: {fecha_final.strftime('%d/%m/%Y')}")
                return True
            else:
                logger.warning(f"⚠️ Fecha final {fecha_final.strftime('%d/%m/%Y')} != ayer {fecha_ayer.strftime('%d/%m/%Y')}")
                # Intentar ajustar
                nueva_diferencia = (fecha_final - fecha_ayer).days
                if abs(nueva_diferencia) <= 3:
                    logger.info(f"🔄 Ajustando {abs(nueva_diferencia)} días más...")
                    return navegar_a_fecha_ayer(driver)
        return False
        
    except Exception as e:
        logger.error(f"❌ Error en navegación: {e}")
        return False

def extraer_resultados(driver):
    """Extrae SOLO los juegos de la fecha de ayer, ignorando otras fechas"""
    logger.info(" Extrayendo Resultados (estricto por fecha)...")
    try:
        driver.get(URL_RESULTADOS)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(3)
        
        # Navegar a ayer
        if not navegar_a_fecha_ayer(driver):
            logger.warning("⚠️ No se pudo navegar a ayer con certeza")
        
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        fecha_ayer = datetime.now() - timedelta(days=1)
        
        # Formatos de fecha de ayer para buscar en la página
        dia_ayer = fecha_ayer.day
        mes_ayer_nombre = list(MESES_ESPANOL.keys())[fecha_ayer.month - 1]
        
        # Patrones de fecha de ayer
        patrones_fecha_ayer = [
            f"{dia_ayer} de {mes_ayer_nombre}",
            f"{mes_ayer_nombre} {dia_ayer}",
            f"viernes {dia_ayer}",
            f"jueves {dia_ayer}",
            f"miércoles {dia_ayer}",
            f"martes {dia_ayer}",
            f"lunes {dia_ayer}",
            f"sábado {dia_ayer}",
            f"domingo {dia_ayer}",
            f"{dia_ayer}",  # Solo el número como último recurso
        ]
        
        logger.info(f"🔍 Buscando sección con fecha: {dia_ayer} de {mes_ayer_nombre}")
        
        # Buscar TODOS los encabezados y secciones de fecha
        todos_elementos = soup.find_all(['h2', 'h3', 'h4', 'strong', 'div', 'span'])
        
        seccion_ayer = None
        for elem in todos_elementos:
            texto = elem.get_text(strip=True).lower()
            for patron in patrones_fecha_ayer:
                if patron.lower() in texto:
                    # Verificar que no sea parte de un rango (ej: "22 - 23")
                    if '-' not in texto or texto.count('-') == 0:
                        seccion_ayer = elem
                        logger.info(f"✅ Sección de ayer encontrada: '{elem.get_text(strip=True)}'")
                        break
            if seccion_ayer:
                break
        
        if not seccion_ayer:
            logger.error("❌ No se encontró sección con la fecha de ayer")
            return None
        
        # Extraer SOLO los juegos que estén DEBAJO de esta sección
        # hasta encontrar otra sección de fecha diferente
        datos = []
        juegos_procesados = set()
        
        # Obtener todos los hermanos siguientes
        hermano = seccion_ayer.find_next_sibling()
        juegos_encontrados = 0
        
        while hermano and juegos_encontrados < 10:
            texto_hermano = hermano.get_text(strip=True).lower()
            
            # Verificar si es OTRA fecha (encabezado de sección diferente)
            es_otra_fecha = False
            for elem_fecha in todos_elementos:
                if elem_fecha == hermano:
                    continue
                texto_elem = elem_fecha.get_text(strip=True).lower()
                # Si este elemento contiene un número de día diferente al de ayer
                for d in range(1, 32):
                    if d != dia_ayer and str(d) in texto_elem and len(texto_elem) < 50:
                        # Podría ser otra fecha
                        if any(mes in texto_elem for mes in MESES_ESPANOL.keys()):
                            es_otra_fecha = True
                            break
                if es_otra_fecha:
                    break
            
            if es_otra_fecha:
                logger.info(f"🛑 Se encontró otra fecha, deteniendo extracción")
                break
            
            # Verificar si es un juego finalizado
            try:
                texto_completo = hermano.get_text()
                
                if 'Finalizado' not in texto_completo and 'finalizado' not in texto_completo:
                    hermano = hermano.find_next_sibling()
                    continue
                
                # Buscar equipos
                equipos_encontrados = []
                for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                    if nombre_corto in texto_completo:
                        equipos_encontrados.append(nombre_corto)
                
                if len(equipos_encontrados) < 2:
                    hermano = hermano.find_next_sibling()
                    continue
                
                visitante = equipos_encontrados[0]
                local = equipos_encontrados[1]
                
                clave = f"{visitante}-{local}"
                if clave in juegos_procesados:
                    hermano = hermano.find_next_sibling()
                    continue
                juegos_procesados.add(clave)
                
                # Extraer scores
                scores = []
                lines = texto_completo.split('\n')
                
                for i, line in enumerate(lines):
                    if 'R' in line and 'H' in line and 'E' in line:
                        for j in range(i+1, min(i+4, len(lines))):
                            numeros = re.findall(r'\b(\d+)\b', lines[j])
                            if numeros and len(numeros) >= 2:
                                scores = [numeros[0], numeros[1]]
                                break
                        break
                
                if len(scores) < 2:
                    for line in lines:
                        numeros = re.findall(r'\b(\d+)\s+(\d+)\s+(\d+)\b', line)
                        if numeros:
                            scores = [numeros[0][0], numeros[0][1]]
                            break
                
                score_visitante = scores[0] if len(scores) > 0 else "0"
                score_local = scores[1] if len(scores) > 1 else "0"
                
                # Innings
                innings = "9"
                inning_match = re.search(r'Inning\s*(\d+)', texto_completo, re.IGNORECASE)
                if inning_match:
                    innings = inning_match.group(1)
                
                # Pitchers
                pitcher_ganador = pitcher_perdedor = pitcher_salvador = ""
                
                match_g = re.search(r'G:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+P:|\s+S:|\s+BOXSCORE|\n|$)', texto_completo, re.IGNORECASE)
                if match_g:
                    pitcher_ganador = match_g.group(1).strip()
                
                match_p = re.search(r'P:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+S:|\s+BOXSCORE|\n|$)', texto_completo, re.IGNORECASE)
                if match_p:
                    pitcher_perdedor = match_p.group(1).strip()
                
                match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+?)(?:\s*\||\s+BOXSCORE|\n|$)', texto_completo, re.IGNORECASE)
                if match_s:
                    pitcher_salvador = match_s.group(1).strip()
                
                datos.append({
                    'fecha': fecha_ayer.strftime("%Y-%m-%d"),
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
                juegos_encontrados += 1
                
            except Exception as e:
                logger.warning(f"⚠️ Error procesando: {e}")
            
            hermano = hermano.find_next_sibling()
        
        if len(datos) == 0:
            logger.error("❌ No se extrajeron juegos de ayer")
            return None
        
        logger.info(f"✅ Extraídos {len(datos)} resultados ESTRICTOS de ayer ({fecha_ayer.strftime('%d/%m/%Y')})")
        return datos
        
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
        resultados = extraer_resultados(driver)
        if resultados:
            actualizar_github('js/datos/resultados.js', resultados, "🤖 Bot: Resultados")
        else:
            logger.error("❌ Resultados: NO se actualiza")
        logger.info("🏁 Bot finalizado")
    except Exception as e:
        logger.exception(f"❌ Error fatal: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    main()
