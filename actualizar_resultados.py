import os
import requests
import base64
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import cv2
import numpy as np
from PIL import Image
import io

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
                var elementos = document.querySelectorAll('div, span, h2, h3, button');
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
                    logger.info(f" Fecha detectada: {fecha.strftime('%d/%m/%Y')} (texto: '{fecha_texto}')")
                    return fecha
        
        logger.warning("️ No se pudo detectar la fecha")
        return None
        
    except Exception as e:
        logger.error(f"❌ Error leyendo fecha: {e}")
        return None

def buscar_flechas_con_vision(page, direccion):
    """
    ESTRATEGIA DE VISIÓN: Toma un screenshot y busca visualmente las flechas
    usando OpenCV (detección de patrones visuales)
    """
    try:
        logger.info(f"👁️ Estrategia VISIÓN: Buscando flecha {direccion}...")
        
        # 1. Tomar screenshot
        screenshot_bytes = page.screenshot()
        img_array = np.frombuffer(screenshot_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            logger.error(" No se pudo procesar el screenshot")
            return False
        
        alto, ancho = img.shape[:2]
        logger.info(f" Screenshot: {ancho}x{alto} píxeles")
        
        # 2. Convertir a escala de grises
        gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. Buscar la zona de la fecha (parte superior central)
        # Las flechas suelen estar en la franja superior, a los lados de la fecha
        zona_superior = gris[0:int(alto*0.25), :]  # Primer 25% de la imagen
        
        # 4. Buscar zonas oscuras (las flechas suelen ser oscuras sobre fondo claro)
        _, umbral = cv2.threshold(zona_superior, 100, 255, cv2.THRESH_BINARY_INV)
        
        # 5. Encontrar contornos (formas)
        contornos, _ = cv2.findContours(umbral, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 6. Filtrar contornos que parezcan flechas (tamaño y forma específicos)
        flechas_candidatas = []
        for contorno in contornos:
            area = cv2.contourArea(contorno)
            if 50 < area < 2000:  # Tamaño típico de una flecha
                x, y, w, h = cv2.boundingRect(contorno)
                aspect_ratio = float(w) / h if h > 0 else 0
                
                # Las flechas suelen ser más anchas que altas
                if 0.5 < aspect_ratio < 3.0:
                    flechas_candidatas.append((x, y, w, h, area))
        
        logger.info(f" Encontradas {len(flechas_candidatas)} formas candidatas a flechas")
        
        if len(flechas_candidatas) == 0:
            logger.warning("️ No se encontraron flechas visualmente")
            return False
        
        # 7. Ordenar por posición horizontal (x)
        flechas_candidatas.sort(key=lambda f: f[0])
        
        # 8. Seleccionar la flecha correcta
        # La flecha IZQUIERDA (<) suele estar a la izquierda del centro
        # La flecha DERECHA (>) suele estar a la derecha del centro
        centro_x = ancho // 2
        
        if direccion == "izquierda":
            # Buscar flecha a la izquierda del centro
            flechas_izq = [f for f in flechas_candidatas if f[0] < centro_x]
            if flechas_izq:
                # Tomar la más a la izquierda
                flecha = flechas_izq[0]
            else:
                flecha = flechas_candidatas[0]
        else:
            # Buscar flecha a la derecha del centro
            flechas_der = [f for f in flechas_candidatas if f[0] > centro_x]
            if flechas_der:
                # Tomar la más a la derecha
                flecha = flechas_der[-1]
            else:
                flecha = flechas_candidatas[-1]
        
        x, y, w, h, area = flecha
        centro_flecha_x = x + w // 2
        centro_flecha_y = y + h // 2
        
        logger.info(f"✅ Flecha encontrada en ({centro_flecha_x}, {centro_flecha_y}) - área: {area}")
        
        # 9. Hacer clic en las coordenadas
        page.mouse.click(centro_flecha_x, centro_flecha_y)
        logger.info(f"✅ Clic visual en ({centro_flecha_x}, {centro_flecha_y})")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error en visión: {e}")
        import traceback
        traceback.print_exc()
        return False

def buscar_flechas_con_template(page, direccion):
    """
    ESTRATEGIA AVANZADA DE VISIÓN: Usa plantillas (templates) de flechas
    para hacer matching de patrones
    """
    try:
        logger.info(f"🎯 Estrategia TEMPLATE: Buscando flecha {direccion}...")
        
        # Crear plantillas de flechas (imágenes pequeñas de < y >)
        # Flecha izquierda: <
        template_izq = np.zeros((40, 40), dtype=np.uint8)
        cv2.arrowedLine(template_izq, (30, 20), (10, 20), 255, 3, tipLength=0.5)
        
        # Flecha derecha: >
        template_der = np.zeros((40, 40), dtype=np.uint8)
        cv2.arrowedLine(template_der, (10, 20), (30, 20), 255, 3, tipLength=0.5)
        
        template = template_izq if direccion == "izquierda" else template_der
        
        # Tomar screenshot
        screenshot_bytes = page.screenshot()
        img_array = np.frombuffer(screenshot_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Aplicar template matching
        resultado = cv2.matchTemplate(gris, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(resultado)
        
        logger.info(f"📊 Coincidencia máxima: {max_val:.3f}")
        
        # Si la coincidencia es buena (>0.5), hacer clic
        if max_val > 0.5:
            h, w = template.shape
            centro_x = max_loc[0] + w // 2
            centro_y = max_loc[1] + h // 2
            page.mouse.click(centro_x, centro_y)
            logger.info(f"✅ Clic template en ({centro_x}, {centro_y})")
            return True
        else:
            logger.info(f"⚠️ Coincidencia muy baja ({max_val:.3f})")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error en template: {e}")
        return False

def intentar_clic_flecha(page, direccion):
    """Intenta múltiples estrategias en orden de efectividad"""
    
    # ESTRATEGIA 1: Teclas de flecha (la más simple)
    try:
        tecla = 'ArrowLeft' if direccion == 'izquierda' else 'ArrowRight'
        page.keyboard.press(tecla)
        logger.info(f"✅ Estrategia 1: Tecla {tecla}")
        return True
    except:
        pass
    
    # ESTRATEGIA 2: Buscar por texto
    try:
        selector = 'button:has-text("<"), a:has-text("<")' if direccion == 'izquierda' else 'button:has-text(">"), a:has-text(">")'
        page.click(selector, timeout=2000)
        logger.info(f"✅ Estrategia 2: Clic por texto")
        return True
    except:
        pass
    
    # ESTRATEGIA 3: JavaScript por posición
    try:
        resultado = page.evaluate(f"""
            () => {{
                var fechaElem = null;
                var elementos = document.querySelectorAll('div, span, h2, h3, button');
                for (var i = 0; i < elementos.length; i++) {{
                    var texto = elementos[i].innerText.trim();
                    if (texto.match(/\d{{1,2}}\s+de\s+\w+\s+\d{{4}}/) && texto.length < 50) {{
                        fechaElem = elementos[i];
                        break;
                    }}
                }}
                
                if (fechaElem) {{
                    var padre = fechaElem.parentElement;
                    var hijos = padre.children;
                    var indiceFecha = Array.from(hijos).indexOf(fechaElem);
                    
                    if ('{direccion}' === 'izquierda' && indiceFecha > 0) {{
                        var botonIzq = hijos[indiceFecha - 1];
                        var botones = botonIzq.querySelectorAll('button, a, [role="button"]');
                        if (botones.length > 0) {{ botones[0].click(); return 'ok'; }}
                        botonIzq.click();
                        return 'ok';
                    }}
                    if ('{direccion}' === 'derecha' && indiceFecha < hijos.length - 1) {{
                        var botonDer = hijos[indiceFecha + 1];
                        var botones = botonDer.querySelectorAll('button, a, [role="button"]');
                        if (botones.length > 0) {{ botones[0].click(); return 'ok'; }}
                        botonDer.click();
                        return 'ok';
                    }}
                }}
                return null;
            }}
        """)
        
        if resultado:
            logger.info(f"✅ Estrategia 3 (JS): {resultado}")
            return True
    except:
        pass
    
    # ESTRATEGIA 4: VISIÓN con OpenCV (detección de formas)
    if buscar_flechas_con_vision(page, direccion):
        return True
    
    # ESTRATEGIA 5: VISIÓN con template matching
    if buscar_flechas_con_template(page, direccion):
        return True
    
    logger.error(f"❌ Ninguna estrategia funcionó para {direccion}")
    return False

def navegar_a_ayer(page):
    try:
        ahora_vzla = obtener_fecha_venezuela()
        hoy_vzla_naive = datetime(ahora_vzla.year, ahora_vzla.month, ahora_vzla.day)
        ayer_vzla_naive = hoy_vzla_naive - timedelta(days=1)
        
        logger.info(f"🇻🇪 Hora Venezuela: {ahora_vzla.strftime('%d/%m/%Y %H:%M')}")
        logger.info(f"📅 Hoy: {hoy_vzla_naive.strftime('%d/%m/%Y')}")
        logger.info(f"🎯 Ayer: {ayer_vzla_naive.strftime('%d/%m/%Y')}")
        
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        
        # ESTRATEGIA 0: URL directa
        logger.info("🔍 Estrategia 0: URL directa...")
        fecha_url = ayer_vzla_naive.strftime('%Y-%m-%d')
        url_directa = f"{URL_RESULTADOS}?fecha={fecha_url}"
        
        try:
            page.goto(url_directa, wait_until='networkidle', timeout=10000)
            fecha_despues = leer_fecha_principal(page)
            if fecha_despues and fecha_despues == ayer_vzla_naive:
                logger.info(f"✅ URL directa funcionó")
                return True
            else:
                page.goto(URL_RESULTADOS, wait_until='networkidle', timeout=10000)
                page.wait_for_timeout(2000)
        except:
            pass
        
        # Leer fecha actual
        fecha_pagina = leer_fecha_principal(page)
        
        if not fecha_pagina:
            logger.warning("⚠️ No se pudo leer la fecha")
            if intentar_clic_flecha(page, "izquierda"):
                page.wait_for_timeout(3000)
                return True
            return False
        
        diferencia = (fecha_pagina - hoy_vzla_naive).days
        
        logger.info(f"📊 Fecha página: {fecha_pagina.strftime('%d/%m/%Y')}")
        logger.info(f"📊 Diferencia: {diferencia} días")
        
        if diferencia == 0:
            logger.info(" Página muestra HOY, retrocediendo 1 día")
            diferencia_clics = 1
            direccion = "izquierda"
        elif diferencia > 0:
            logger.info(f"📍 Página muestra {diferencia} días en el futuro")
            diferencia_clics = diferencia + 1
            direccion = "izquierda"
        elif diferencia == -1:
            logger.info("✅ Página ya muestra ayer")
            return True
        else:
            dias_atras = abs(diferencia)
            logger.info(f"📍 Página muestra {dias_atras} días en el pasado")
            diferencia_clics = dias_atras - 1
            direccion = "derecha"
        
        logger.info(f"👉 {diferencia_clics} clics hacia la {direccion}")
        
        if diferencia_clics > 10:
            diferencia_clics = 10
        
        for i in range(diferencia_clics):
            if intentar_clic_flecha(page, direccion):
                logger.info(f"✅ Clic {i+1}/{diferencia_clics}")
                page.wait_for_timeout(3000)
                
                fecha_actual = leer_fecha_principal(page)
                if fecha_actual and fecha_actual == ayer_vzla_naive:
                    logger.info(f"✅ Llegamos a ayer en {i+1} clics")
                    return True
            else:
                logger.error(f"❌ No se pudo hacer clic {i+1}")
                break
        
        fecha_final = leer_fecha_principal(page)
        if fecha_final and fecha_final == ayer_vzla_naive:
            logger.info(f"✅ Fecha confirmada: {fecha_final.strftime('%d/%m/%Y')}")
            return True
        else:
            logger.warning(f"⚠️ Fecha final: {fecha_final}")
            return False
        
    except Exception as e:
        logger.error(f"❌ Error en navegación: {e}")
        import traceback
        traceback.print_exc()
        return False

def extraer_resultados(page):
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
        
        logger.info("🔍 Buscando 'Finalizado' o 'final':")
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
            logger.info("️ No se encontró 'Finalizado'")
            logger.info("🔍 Divs grandes:")
            for i, div in enumerate(todos_divs[:30]):
                texto = div.get_text()
                if len(texto) > 100:
                    logger.info(f"  Div {i} ({len(texto)} chars): '{texto[:150]}...'")
        
        juegos = []
        juegos_procesados = set()
        
        for div in todos_divs:
            try:
                texto = div.get_text()
                
                if 'Finalizado' not in texto and 'finalizado' not in texto:
                    continue
                
                equipos_encontrados = []
                for nombre_largo, nombre_corto in NOMBRES_EQUIPOS.items():
                    if nombre_corto in texto:
                        equipos_encontrados.append(nombre_corto)
                
                if len(equipos_encontrados) < 2:
                    continue
                
                for i in range(0, len(equipos_encontrados), 2):
                    if i + 1 >= len(equipos_encontrados):
                        break
                    
                    visitante = equipos_encontrados[i]
                    local = equipos_encontrados[i + 1]
                    
                    clave = f"{visitante}-{local}"
                    if clave in juegos_procesados:
                        continue
                    juegos_procesados.add(clave)
                    
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
                    
                    innings = "9"
                    inning_match = re.search(r'Inning\s*(\d+)', texto, re.IGNORECASE)
                    if inning_match:
                        innings = inning_match.group(1)
                    
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
                    
                    ayer_vzla = datetime.now(timezone.utc).astimezone(VENEZUELA_OFFSET)
                    ayer_naive = datetime(ayer_vzla.year, ayer_vzla.month, ayer_vzla.day)
                    
                    juegos.append({
                        'fecha': ayer_naive.strftime("%Y-%m-%d"),
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
    logger.info("🚀 Iniciando Bot de Resultados (Playwright + Visión)...")
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
