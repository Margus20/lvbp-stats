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

def leer_fecha_principal(page):
    try:
        fecha_texto = page.evaluate("""
            () => {
                var elementos = document.querySelectorAll('div, span, h2, h3, button, p');
                for (var i = 0; i < elementos.length; i++) {
                    var texto = elementos[i].innerText.trim();
                    if (texto.match(/\d{1,2}\s+de\s+\w+\s+\d{4}/) && texto.length < 50) {
                        return texto;
                    }
                }
                return null;
            }
        """)
        
        if fecha_texto:
            match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+(\d{4})', fecha_texto, re.IGNORECASE)
            if match:
                dia = int(match.group(1))
                mes_texto = match.group(2).lower()
                anio = int(match.group(3))
                mes = MESES_ESPANOL.get(mes_texto)
                if mes:
                    fecha = datetime(anio, mes, dia)
                    logger.info(f"📅 Fecha detectada: {fecha.strftime('%d/%m/%Y')} (texto: '{fecha_texto}')")
                    return fecha
        return None
    except Exception as e:
        logger.error(f"❌ Error leyendo fecha: {e}")
        return None

def navegar_a_ayer(page):
    """Navegación inteligente buscando selectores específicos del DOM"""
    try:
        ahora_vzla = obtener_fecha_venezuela()
        hoy_vzla_naive = datetime(ahora_vzla.year, ahora_vzla.month, ahora_vzla.day)
        ayer_vzla_naive = hoy_vzla_naive - timedelta(days=1)
        
        logger.info(f"🇻🇪 Hora Venezuela: {ahora_vzla.strftime('%d/%m/%Y %H:%M')}")
        logger.info(f"🎯 Buscando fecha de ayer: {ayer_vzla_naive.strftime('%d/%m/%Y')}")
        
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)

        for intento in range(3):
            locator_str = "a.fc-prev-button, button.prev, .fecha-prev, [class*='prev'], button:has-text('‹'), div:has-text('‹'), button:has-text('<')"
            flecha_izquierda = page.locator(locator_str).first
            
            if flecha_izquierda.count() > 0:
                flecha_izquierda.click()
                logger.info(f"✅ Intento {intento+1}: Clic en botón de fecha anterior del DOM")
            else:
                page.keyboard.press('ArrowLeft')
                logger.info(f"✅ Intento {intento+1}: Tecla ArrowLeft presionada (fallback)")
            
            page.wait_for_timeout(3000)
            
            fecha_actual = leer_fecha_principal(page)
            if fecha_actual and fecha_actual == ayer_vzla_naive:
                logger.info(f"✅ ¡Navegación exitosa a ayer: {fecha_actual.strftime('%d/%m/%Y')}!")
                return True
            elif fecha_actual:
                logger.info(f"⚠️ Intento {intento+1}: La fecha sigue siendo {fecha_actual.strftime('%d/%m/%Y')}")

        logger.warning("⚠️ No se pudo asegurar el cambio al día de ayer mediante clics estándar.")
        return False
        
    except Exception as e:
        logger.error(f" Error en navegación a ayer: {e}")
        return False

def extraer_resultados(page):
    """Versión robusta que detecta juegos en progreso y finalizados"""
    logger.info("🏆 Extrayendo resultados...")

    try:
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')

        fecha_pagina = leer_fecha_principal(page)
        if fecha_pagina:
            logger.info(f"📅 Fecha en página: {fecha_pagina.strftime('%d/%m/%Y')}")

        todos_divs = soup.find_all('div')
        logger.info(f"📊 Total de divs: {len(todos_divs)}")

        juegos = []
        juegos_procesados = set()

        for div in todos_divs:
            texto = div.get_text(separator="\n").strip()

            # Detectar bloques que tengan R/H/E y dos equipos
            if "R" in texto and "H" in texto and "E" in texto:

                lineas = [l.strip() for l in texto.split("\n") if l.strip()]

                # Buscar equipos
                equipos = []
                for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                    for idx, linea in enumerate(lineas):
                        if nombre_corto.lower() in linea.lower():
                            equipos.append((nombre_corto, idx))

                if len(equipos) < 2:
                    continue

                # Ordenar por aparición
                equipos = sorted(equipos, key=lambda x: x[1])
                visitante = equipos[0][0]
                local = equipos[1][0]

                clave = f"{visitante}-{local}"
                if clave in juegos_procesados:
                    continue
                juegos_procesados.add(clave)

                # Buscar números después de R/H/E
                try:
                    idx_r = lineas.index("R")
                    score_visitante = re.findall(r"\d+", lineas[idx_r + 1])[0]
                    score_local = re.findall(r"\d+", lineas[idx_r + 2])[0]
                except:
                    score_visitante = "0"
                    score_local = "0"

                # Detectar inning
                inning = "Final"
                for linea in lineas:
                    m = re.search(r"Inning\s*(\d+)", linea, re.IGNORECASE)
                    if m:
                        inning = m.group(1)
                        break

                # Detectar si está en vivo o finalizado
                finalizado = "final" in texto.lower() or "finalizado" in texto.lower()

                ayer_vzla = datetime.now(timezone.utc).astimezone(VENEZUELA_OFFSET)
                fecha_naive = datetime(ayer_vzla.year, ayer_vzla.month, ayer_vzla.day)

                juegos.append({
                    "fecha": fecha_naive.strftime("%Y-%m-%d"),
                    "visitante": visitante,
                    "local": local,
                    "scoreVisitante": score_visitante,
                    "scoreLocal": score_local,
                    "innings": inning,
                    "finalizado": finalizado
                })

                logger.info(f"✅ Juego detectado: {visitante} {score_visitante} - {score_local} {local} (Inning {inning})")

        logger.info(f"📊 Total extraídos: {len(juegos)}")
        return juegos if juegos else None

    except Exception as e:
        logger.error(f" Error crítico: {e}")
        return None

def actualizar_github(file_path, datos, mensaje):
    if not datos:
        logger.warning(f"️ Lista vacía para {file_path}")
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
    logger.info("🚀 Iniciando Bot de Resultados LVBP...")
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
            
            logger.info("🌐 Navegando a stats.lvbp.com...")
            page.goto(URL_RESULTADOS, wait_until='networkidle', timeout=30000)
            
            if not navegar_a_ayer(page):
                logger.warning("⚠️ No se pudo navegar a ayer con certeza")
            
            resultados = extraer_resultados(page)
            
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
