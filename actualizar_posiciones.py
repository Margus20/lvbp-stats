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
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
URL_POSICIONES = 'https://stats.lvbp.com/posiciones.php'

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
    nombre_lower = nombre_completo.lower()
    mapeo = {
        'navegantes': 'Magallanes', 'magallanes': 'Magallanes',
        'caribes': 'Caribes', 'tigres': 'Tigres', 'aragua': 'Tigres',
        'cardenales': 'Cardenales', 'lara': 'Cardenales',
        'bravos': 'Bravos', 'margarita': 'Bravos',
        'tiburones': 'Tiburones', 'guaira': 'Tiburones',
        'aguilas': 'Águilas', 'zulia': 'Águilas',
        'leones': 'Leones', 'caracas': 'Leones'
    }
    for clave, corto in mapeo.items():
        if clave in nombre_lower:
            return corto
    return nombre_completo.split()[0] if nombre_completo else ''

def extraer_posiciones(driver):
    logger.info("📊 Extrayendo Posiciones...")
    try:
        driver.get(URL_POSICIONES)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        
        try:
            tabs = driver.find_elements(By.CSS_SELECTOR, "button, a, [role='tab'], .nav-link")
            for tab in tabs:
                if 'temporada regular' in tab.text.lower():
                    driver.execute_script("arguments[0].click();", tab)
                    break
            selects = driver.find_elements(By.TAG_NAME, "select")
            for select_elem in selects:
                options = select_elem.find_elements(By.TAG_NAME, "option")
                for option in options:
                    if '2026' in option.text:
                        Select(select_elem).select_by_visible_text('2026')
                        break
        except Exception as e:
            logger.warning(f"Aviso en filtros: {e}")
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        tablas = soup.find_all('table')
        if not tablas:
            logger.error("❌ No se encontró tabla")
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
                    nombre = tds[idx_eq].get_text(strip=True)
                    datos.append({
                        'numero': i,
                        'nombre': obtener_nombre_corto(nombre),
                        'jj': tds[idx_jj].get_text(strip=True) if idx_jj < len(tds) else '0',
                        'jg': tds[idx_jg].get_text(strip=True) if idx_jg < len(tds) else '0',
                        'jp': tds[idx_jp].get_text(strip=True) if idx_jp < len(tds) else '0',
                        'pct': tds[idx_pct].get_text(strip=True) if idx_pct < len(tds) else '.000',
                        'dif': tds[idx_dif].get_text(strip=True) if idx_dif < len(tds) else '-',
                        'racha': tds[idx_racha].get_text(strip=True) if idx_racha < len(tds) else ''
                    })
            except Exception as e:
                logger.warning(f"Error en fila {i}: {e}")
        
        if len(datos) < 8:
            logger.error(f"❌ Datos incompletos: {len(datos)} equipos")
            return []
        
        logger.info(f"✅ Extraídas {len(datos)} posiciones")
        return datos
    except Exception as e:
        logger.error(f"❌ Error crítico: {e}")
        return []

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
    logger.info("🚀 Iniciando Bot de Posiciones...")
    if not TOKEN:
        logger.error("❌ No hay GITHUB_TOKEN")
        return
    
    driver = None
    try:
        driver = iniciar_driver()
        posiciones = extraer_posiciones(driver)
        if posiciones:
            actualizar_github('js/datos/posiciones.js', posiciones, "🤖 Bot: Posiciones")
        else:
            logger.error("❌ Posiciones: NO se actualiza")
        logger.info("🏁 Bot finalizado")
    except Exception as e:
        logger.exception(f"❌ Error fatal: {e}")
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    main()
