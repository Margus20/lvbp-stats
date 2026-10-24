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
                    logger.info(f"📅 Fecha detectada: {fecha.strftime('%d/%m/%Y')} (texto: '{fecha_texto}')")
                    return fecha
        
        logger.warning("⚠️ No se pudo detectar la fecha")
        return None
        
    except Exception as e:
        logger.error(f"❌ Error leyendo fecha: {e}")
        return None

def intentar_clic_flecha(page, direccion, fecha_antes):
    """
    Intenta hacer clic y VERIFICA si la fecha cambió.
    Si no cambió, prueba la siguiente estrategia.
    """
    estrategias = [
        ("Tecla ArrowLeft/Right", lambda: _estrategia_tecla(page, direccion)),
        ("Texto < o >", lambda: _estrategia_texto(page, direccion)),
        ("JavaScript por posición", lambda: _estrategia_js_posicion(page, direccion)),
        ("JavaScript por aria-label", lambda: _estrategia_js_aria(page, direccion)),
        ("JavaScript por clase CSS", lambda: _estrategia_js_clase(page, direccion)),
    ]
    
    for nombre_estrategia, func in estrategias:
        try:
            logger.info(f" Probando: {nombre_estrategia}...")
            func()
            page.wait_for_timeout(3000)
            
            # VERIFICAR si la fecha cambió
            fecha_despues = leer_fecha_principal(page)
            if fecha_despues and fecha_despues != fecha_antes:
                logger.info(f"✅ {nombre_estrategia} funcionó! Fecha cambió a {fecha_despues.strftime('%d/%m/%Y')}")
                return True
            else:
                logger.info(f"⚠️ {nombre_estrategia} no cambió la fecha, probando siguiente...")
        except Exception as e:
            logger.info(f"⚠️ {nombre_estrategia} falló: {e}")
            continue
    
    logger.error(f"❌ Ninguna estrategia funcionó")
    return False

def _estrategia_tecla(page, direccion):
    tecla = 'ArrowLeft' if direccion == 'izquierda' else 'ArrowRight'
    page.keyboard.press(tecla)

def _estrategia_texto(page, direccion):
    if direccion == 'izquierda':
        page.click('button:has-text("<"), a:has-text("<")', timeout=3000)
    else:
        page.click('button:has-text(">"), a:has-text(">")', timeout=3000)

def _estrategia_js_posicion(page, direccion):
    resultado = page.evaluate(f"""
        () => {{
            var fechaElem = null;
            var elementos = document.querySelectorAll('div, span, h2, h3, button, p');
            for (var i = 0; i < elementos.length; i++) {{
                var texto = elementos[i].innerText.trim();
                if (texto.match(/\d{{1,2}}\s+de\s+\w+\s+\d{{4}}/) && texto.length < 50) {{
                    fechaElem = elementos[i];
                    break;
                }}
            }}
            
            if (!fechaElem) return null;
            
            var padre = fechaElem.parentElement;
            if (!padre) return null;
            
            var hijos = padre.children;
            var indiceFecha = Array.from(hijos).indexOf(fechaElem);
            
            if ('{direccion}' === 'izquierda' && indiceFecha > 0) {{
                var elem = hijos[indiceFecha - 1];
                var botones = elem.querySelectorAll('button, a, [role="button"], span, div');
                if (botones.length > 0) {{ botones[0].click(); return 'ok'; }}
                elem.click();
                return 'ok';
            }}
            if ('{direccion}' === 'derecha' && indiceFecha < hijos.length - 1) {{
                var elem = hijos[indiceFecha + 1];
                var botones = elem.querySelectorAll('button, a, [role="button"], span, div');
                if (botones.length > 0) {{ botones[0].click(); return 'ok'; }}
                elem.click();
                return 'ok';
            }}
            return null;
        }}
    """)
    if not resultado:
        raise Exception("No encontró elemento por posición")

def _estrategia_js_aria(page, direccion):
    if direccion == 'izquierda':
        page.click('[aria-label*="anterior"], [aria-label*="Previous"], [aria-label*="prev"], [title*="anterior"]', timeout=3000)
    else:
        page.click('[aria-label*="siguiente"], [aria-label*="Next"], [aria-label*="next"], [title*="siguiente"]', timeout=3000)

def _estrategia_js_clase(page, direccion):
    if direccion == 'izquierda':
        page.click('.prev, .previous, .arrow-left, .btn-prev, .nav-prev, [class*="prev"]', timeout=3000)
    else:
        page.click('.next, .arrow-right, .btn-next, .nav-next, [class*="next"]', timeout=3000)

def probar_urls_directas(page, fecha_objetivo):
    """Prueba varios formatos de URL para ir directo a la fecha"""
    fecha_str = fecha_objetivo.strftime('%Y-%m-%d')
    dia = fecha_objetivo.day
    mes = fecha_objetivo.month
    anio = fecha_objetivo.year
    
    urls_a_probar = [
        f"{URL_RESULTADOS}?fecha={fecha_str}",
        f"{URL_RESULTADOS}?date={fecha_str}",
        f"{URL_RESULTADOS}?d={dia}&m={mes}&y={anio}",
        f"{URL_RESULTADOS}?day={dia}&month={mes}&year={anio}",
        f"{URL_RESULTADOS}?dia={dia}&mes={mes}&anio={anio}",
        f"{URL_RESULTADOS}?fecha={dia}/{mes}/{anio}",
        f"{URL_RESULTADOS}?fecha={dia:02d}-{mes:02d}-{anio}",
    ]
    
    for url in urls_a_probar:
        try:
            logger.info(f"🔍 Probando URL: {url}")
            page.goto(url, wait_until='networkidle', timeout=10000)
            page.wait_for_timeout(2000)
            
            fecha_despues = leer_fecha_principal(page)
            if fecha_despues and fecha_despues == fecha_objetivo:
                logger.info(f"✅ URL directa funcionó: {url}")
                return True
            else:
                logger.info(f"⚠️ URL no cambió la fecha")
        except:
            continue
    
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
        
        # ESTRATEGIA 0: URLs directas
        logger.info(" Estrategia 0: Probando URLs directas...")
        if probar_urls_directas(page, ayer_vzla_naive):
            return True
        
        # Volver a la página principal
        page.goto(URL_RESULTADOS, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)
        
        # Leer fecha actual
        fecha_pagina = leer_fecha_principal(page)
        
        if not fecha_pagina:
            logger.warning("⚠️ No se pudo leer la fecha")
            return False
        
        diferencia = (fecha_pagina - hoy_vzla_naive).days
        
        logger.info(f"📊 Fecha página: {fecha_pagina.strftime('%d/%m/%Y')}")
        logger.info(f"📊 Diferencia con hoy: {diferencia} días")
        
        if diferencia == 0:
            logger.info("📍 Página muestra HOY, necesito 1 clic izquierda")
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
        
        logger.info(f"👉 Necesito {diferencia_clics} clic(s) hacia la {direccion}")
        
        if diferencia_clics > 10:
            diferencia_clics = 10
        
        # Hacer clics verificando cada uno
        for i in range(diferencia_clics):
            fecha_antes = leer_fecha_principal(page)
            logger.info(f"🔄 Clic {i+1}/{diferencia_clics} - Fecha antes: {fecha_antes.strftime('%d/%m/%Y') if fecha_antes else 'desconocida'}")
            
            if intentar_clic_flecha(page, direccion, fecha_antes):
                logger.info(f"✅ Clic {i+1} exitoso")
            else:
                logger.error(f"❌ No pude hacer clic {i+1}")
                break
            
            # Verificar si ya llegamos
            fecha_actual = leer_fecha_principal(page)
            if fecha_actual and fecha_actual == ayer_vzla_naive:
                logger.info(f"✅ ¡Llegamos a ayer después de {i+1} clic(s)!")
                return True
        
        # Verificación final
        fecha_final = leer_fecha_principal(page)
        if fecha_final and fecha_final == ayer_vzla_naive:
            logger.info(f"✅ Fecha confirmada: {fecha_final.strftime('%d/%m/%Y')}")
            return True
        else:
            logger.warning(f"⚠️ No llegué a ayer. Fecha final: {fecha_final}")
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
            logger.info("⚠️ No se encontró 'Finalizado'")
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
    logger.info(" Iniciando Bot de Resultados...")
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
