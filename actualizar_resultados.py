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
URL_MERIDIANO = 'https://meridiano.net/beisbol/lvbp/resultados-y-calendario/'

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

def obtener_fecha_venezuela():
    ahora_utc = datetime.now(timezone.utc)
    return ahora_utc.astimezone(VENEZUELA_OFFSET)

def extraer_resultados_meridiano(page):
    """Extrae resultados de Meridiano.net - fuente confiable"""
    logger.info(" Extrayendo resultados de Meridiano...")
    
    try:
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)
        
        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar secciones "FINAL" (juegos terminados)
        secciones_final = soup.find_all(string=lambda text: text and 'FINAL' in text.upper())
        
        logger.info(f"🔍 Secciones FINAL encontradas: {len(secciones_final)}")
        
        if len(secciones_final) == 0:
            logger.warning("️ No hay juegos finalizados en Meridiano")
            return None
        
        juegos = []
        juegos_procesados = set()
        
        for seccion in secciones_final:
            try:
                # Encontrar el contenedor padre del juego
                contenedor = seccion.find_parent()
                if not contenedor:
                    continue
                
                # Buscar el contenedor más grande que tenga los dos equipos
                for _ in range(5):
                    if contenedor and contenedor.parent:
                        texto_padre = contenedor.parent.get_text()
                        equipos_count = sum(1 for eq in NOMBRES_EQUIPOS.values() if eq in texto_padre)
                        if equipos_count >= 2:
                            contenedor = contenedor.parent
                        else:
                            break
                    else:
                        break
                
                texto = contenedor.get_text() if contenedor else seccion.get_text()
                
                # Buscar equipos en orden de aparición
                equipos_encontrados = []
                for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                    if nombre_corto in texto and nombre_corto not in equipos_encontrados:
                        equipos_encontrados.append(nombre_corto)
                
                if len(equipos_encontrados) < 2:
                    continue
                
                visitante = equipos_encontrados[0]
                local = equipos_encontrados[1]
                
                clave = f"{visitante}-{local}"
                if clave in juegos_procesados:
                    continue
                juegos_procesados.add(clave)
                
                # Extraer scores del formato "Equipo X - Y" o similar
                score_visitante = "0"
                score_local = "0"
                
                # Buscar patrón "Equipo1 3 - 6 Equipo2" o similar
                match_score = re.search(rf'{re.escape(visitante)}\s+(\d+)\s*-\s*(\d+)\s*{re.escape(local)}', texto, re.IGNORECASE)
                if match_score:
                    score_visitante = match_score.group(1)
                    score_local = match_score.group(2)
                else:
                    # Buscar números cerca de los equipos
                    lines = texto.split('\n')
                    for i, line in enumerate(lines):
                        if visitante in line:
                            numeros = re.findall(r'\b(\d+)\b', line)
                            if numeros:
                                score_visitante = numeros[0]
                        if local in line:
                            numeros = re.findall(r'\b(\d+)\b', line)
                            if numeros:
                                score_local = numeros[0]
                
                # Extraer pitchers (W: y L:)
                pitcher_ganador = ""
                pitcher_perdedor = ""
                pitcher_salvador = ""
                
                match_w = re.search(r'W:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+\d|\n|$)', texto)
                if match_w:
                    pitcher_ganador = match_w.group(1).strip()
                
                match_l = re.search(r'L:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+\d|\n|$)', texto)
                if match_l:
                    pitcher_perdedor = match_l.group(1).strip()
                
                match_s = re.search(r'S:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?:\s+\d|\n|$)', texto)
                if match_s:
                    pitcher_salvador = match_s.group(1).strip()
                
                # Fecha de ayer
                ahora_vzla = datetime.now(timezone.utc).astimezone(VENEZUELA_OFFSET)
                ayer_naive = datetime(ahora_vzla.year, ahora_vzla.month, ahora_vzla.day) - timedelta(days=1)
                
                juegos.append({
                    'fecha': ayer_naive.strftime("%Y-%m-%d"),
                    'visitante': visitante,
                    'local': local,
                    'scoreVisitante': score_visitante,
                    'scoreLocal': score_local,
                    'innings': "9",
                    'finalizado': True,
                    'pitcherGanador': pitcher_ganador,
                    'pitcherPerdedor': pitcher_perdedor,
                    'pitcherSalvador': pitcher_salvador
                })
                
                logger.info(f"✅ Juego: {visitante} {score_visitante} - {score_local} {local}")
                
            except Exception as e:
                logger.warning(f"⚠️ Error procesando juego: {e}")
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
    logger.info("🚀 Iniciando Bot de Resultados (Meridiano)...")
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
            
            logger.info("🌐 Navegando a Meridiano.net...")
            page.goto(URL_MERIDIANO, wait_until='networkidle', timeout=30000)
            
            resultados = extraer_resultados_meridiano(page)
            
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
