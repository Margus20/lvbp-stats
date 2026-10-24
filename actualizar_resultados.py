import os
import requests
import base64
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'
URL_FLASHSCORE = 'https://www.flashscore.com.ve/beisbol/venezuela/lvbp/resultados/'

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

VENEZUELA_OFFSET = timezone(timedelta(hours=-4))

def obtener_nombre_corto(nombre_completo):
    if not nombre_completo:
        return ''
    for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
        if nombre_largo.lower() in nombre_completo.lower():
            return nombre_corto
    return nombre_completo.split()[0] if nombre_completo else ''

def extraer_resultados_flashscore(page):
    """Extrae resultados de Flashscore - Versión mejorada"""
    logger.info("🏆 Extrayendo resultados de Flashscore...")
    
    try:
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(5000)
        
        # Hacer scroll para cargar más contenido
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(2000)
        
        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar todas las filas de partidos (Flashscore usa tablas)
        filas = soup.find_all('div', class_=re.compile(r'event__row|matchRow'))
        
        logger.info(f" Total de filas encontradas: {len(filas)}")
        
        if len(filas) == 0:
            # Intentar buscar por estructura alternativa
            filas = soup.find_all('tr', class_=re.compile(r'tr__match|match'))
            logger.info(f"🔍 Buscando alternativa: {len(filas)} filas")
        
        juegos = []
        juegos_procesados = set()
        ayer = (datetime.now(VENEZUELA_OFFSET) - timedelta(days=1)).strftime("%Y-%m-%d")
        
        for fila in filas:
            try:
                texto_completo = fila.get_text()
                
                # Buscar si es juego finalizado
                if 'finalizado' not in texto_completo.lower() and 'finished' not in texto_completo.lower():
                    # Verificar si tiene scores numéricos (juego terminado)
                    if not re.search(r'\d+\s*-\s*\d+', texto_completo):
                        continue
                
                # Extraer equipos y scores usando expresiones regulares
                # Patrón: Equipo1 X - Y Equipo2
                equipos_pattern = re.findall(r'([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\s+(\d+)\s*-\s*(\d+)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)', texto_completo)
                
                if not equipos_pattern:
                    continue
                
                for match in equipos_pattern:
                    visitante_raw = match[0].strip()
                    score_visitante = match[1]
                    score_local = match[2]
                    local_raw = match[3].strip()
                    
                    # Convertir a nombres cortos
                    visitante = obtener_nombre_corto(visitante_raw)
                    local = obtener_nombre_corto(local_raw)
                    
                    if not visitante or not local or visitante == local:
                        continue
                    
                    clave = f"{visitante}-{local}-{score_visitante}-{score_local}"
                    if clave in juegos_procesados:
                        continue
                    juegos_procesados.add(clave)
                    
                    juegos.append({
                        'fecha': ayer,
                        'visitante': visitante,
                        'local': local,
                        'scoreVisitante': score_visitante,
                        'scoreLocal': score_local,
                        'innings': "9",
                        'finalizado': True,
                        'pitcherGanador': "",
                        'pitcherPerdedor': "",
                        'pitcherSalvador': ""
                    })
                    
                    logger.info(f"✅ Juego: {visitante} {score_visitante} - {score_local} {local}")
                
            except Exception as e:
                logger.warning(f"⚠️ Error procesando fila: {e}")
                continue
        
        logger.info(f"📊 Total extraídos: {len(juegos)}")
        return juegos if juegos else None
        
    except Exception as e:
        logger.error(f"❌ Error crítico: {e}")
        import traceback
        traceback.print_exc()
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
    logger.info("🚀 Iniciando Bot de Resultados (Flashscore)...")
    if not TOKEN:
        logger.error("❌ No hay GITHUB_TOKEN")
        return
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                timezone_id='America/Caracas'
            )
            page = context.new_page()
            
            logger.info("🌐 Navegando a Flashscore...")
            page.goto(URL_FLASHSCORE, wait_until='networkidle', timeout=60000)
            
            resultados = extraer_resultados_flashscore(page)
            
            if resultados and len(resultados) > 0:
                logger.info(f"✅ Extraídos {len(resultados)} juegos")
                actualizar_github('js/datos/resultados.js', resultados, "🤖 Bot: Resultados")
            else:
                logger.error("❌ No se extrajeron juegos")
            
            browser.close()
            logger.info("🏁 Bot finalizado")
            
    except Exception as e:
        logger.exception(f"❌ Error fatal: {e}")

if __name__ == '__main__':
    main()
