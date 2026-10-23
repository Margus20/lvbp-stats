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

# Regex compilados
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
