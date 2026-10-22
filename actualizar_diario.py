.import os
import requests
import base64
import time
import json
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ==========================================
# CONFIGURACIÓN DEL BOT DIARIO
# ==========================================
TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = 'Margus20'
REPO_NAME = 'lvbp-stats'

URL_POSICIONES = 'https://stats.lvbp.com/posiciones.php'
URL_RESULTADOS = 'https://stats.lvbp.com/resultados.php'
URL_CALENDARIO = 'https://stats.lvbp.com/calendario.php'

def iniciar_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=chrome_options)

def extraer_posiciones(driver):
    print("📊 Extrayendo Posiciones...")
    driver.get(URL_POSICIONES)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    time.sleep(2)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tablas = soup.find_all('table')
    if not tablas: return []
    
    tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
    ths = [th.get_text(strip=True).upper() for th in tabla.find_all('th')]
    
    # Mapeo inteligente de columnas
    idx_eq = next((i for i, th in enumerate(ths) if 'EQUIPO' in th or 'CLUB' in th), 1)
    idx_jj = next((i for i, th in enumerate(ths) if 'JJ' in th), 2)
    idx_jg = next((i for i, th in enumerate(ths) if 'JG' in th), 3)
    idx_jp = next((i for i, th in enumerate(ths) if 'JP' in th), 4)
    idx_pct = next((i for i, th in enumerate(ths) if 'PCT' in th or '%' in th), 5)
    idx_dif = next((i for i, th in enumerate(ths) if 'DIF' in th or 'GB' in th), 6)
    idx_racha = next((i for i, th in enumerate(ths) if 'RACHA' in th or 'STR' in th), 7)
    
    datos = []
    for tr in tabla.find_all('tr')[1:]:
        tds = tr.find_all('td')
        if len(tds) > idx_eq:
            datos.append({
                'nombre': tds[idx_eq].get_text(strip=True) if idx_eq < len(tds) else '',
                'jj': tds[idx_jj].get_text(strip=True) if idx_jj < len(tds) else '0',
                'jg': tds[idx_jg].get_text(strip=True) if idx_jg < len(tds) else '0',
                'jp': tds[idx_jp].get_text(strip=True) if idx_jp < len(tds) else '0',
                'pct': tds[idx_pct].get_text(strip=True) if idx_pct < len(tds) else '.000',
                'dif': tds[idx_dif].get_text(strip=True) if idx_dif < len(tds) else '-',
                'racha': tds[idx_racha].get_text(strip=True) if idx_racha < len(tds) else ''
            })
    return datos

def extraer_resultados(driver):
    print("📊 Extrayendo Resultados...")
    driver.get(URL_RESULTADOS)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    time.sleep(2)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tablas = soup.find_all('table')
    if not tablas: return []
    
    tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
    ths = [th.get_text(strip=True).upper() for th in tabla.find_all('th')]
    
    idx_fecha = next((i for i, th in enumerate(ths) if 'FECHA' in th or 'DIA' in th), 0)
    idx_vis = next((i for i, th in enumerate(ths) if 'VISITANTE' in th), 1)
    idx_rvis = next((i for i, th in enumerate(ths) if 'R' in th or 'C' in th), 2) # A veces es R o C
    idx_loc = next((i for i, th in enumerate(ths) if 'LOCAL' in th), 3)
    idx_rloc = next((i for i, th in enumerate(ths) if 'R' in th or 'C' in th), 4)
    idx_inn = next((i for i, th in enumerate(ths) if 'INN' in th), 5)
    
    datos = []
    for tr in tabla.find_all('tr')[1:]:
        tds = tr.find_all('td')
        if len(tds) > max(idx_vis, idx_loc):
            # Intentar encontrar el segundo "R" o "C" para el local
            rloc_idx = idx_rloc
            for i in range(idx_loc + 1, len(tds)):
                if ths[i] in ['R', 'C', 'RUNS', 'CARRERAS']:
                    rloc_idx = i
                    break
                    
            datos.append({
                'fecha': tds[idx_fecha].get_text(strip=True) if idx_fecha < len(tds) else '',
                'visitante': tds[idx_vis].get_text(strip=True) if idx_vis < len(tds) else '',
                'scoreVisitante': tds[idx_rvis].get_text(strip=True) if idx_rvis < len(tds) else '0',
                'local': tds[idx_loc].get_text(strip=True) if idx_loc < len(tds) else '',
                'scoreLocal': tds[rloc_idx].get_text(strip=True) if rloc_idx < len(tds) else '0',
                'innings': tds[idx_inn].get_text(strip=True) if idx_inn < len(tds) else '9',
                'finalizado': True
            })
    return datos

def extraer_calendario(driver):
    print("📊 Extrayendo Calendario...")
    driver.get(URL_CALENDARIO)
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "table")))
    time.sleep(2)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tablas = soup.find_all('table')
    if not tablas: return []
    
    tabla = max(tablas, key=lambda t: len(t.find_all('tr')))
    ths = [th.get_text(strip=True).upper() for th in tabla.find_all('th')]
    
    idx_fecha = next((i for i, th in enumerate(ths) if 'FECHA' in th or 'DIA' in th), 0)
    idx_hora = next((i for i, th in enumerate(ths) if 'HORA' in th), 1)
    idx_vis = next((i for i, th in enumerate(ths) if 'VISITANTE' in th), 2)
    idx_loc = next((i for i, th in enumerate(ths) if 'LOCAL' in th), 3)
    idx_est = next((i for i, th in enumerate(ths) if 'ESTADIO' in th or 'LUGAR' in th), 4)
    idx_trans = next((i for i, th in enumerate(ths) if 'TV' in th or 'TRANSMIS' in th or 'CANAL' in th), 5)
    
    datos = []
    for tr in tabla.find_all('tr')[1:]:
        tds = tr.find_all('td')
        if len(tds) > max(idx_vis, idx_loc):
            datos.append({
                'fecha': tds[idx_fecha].get_text(strip=True) if idx_fecha < len(tds) else '',
                'hora': tds[idx_hora].get_text(strip=True) if idx_hora < len(tds) else '',
                'visitante': tds[idx_vis].get_text(strip=True) if idx_vis < len(tds) else '',
                'local': tds[idx_loc].get_text(strip=True) if idx_loc < len(tds) else '',
                'lugar': tds[idx_est].get_text(strip=True) if idx_est < len(tds) else 'Por confirmar',
                'transmision': tds[idx_trans].get_text(strip=True) if idx_trans < len(tds) else 'Por confirmar',
                'enVivo': False,
                'finalizado': False
            })
    return datos

def actualizar_archivo_github(file_path, datos_lista, mensaje_commit):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{file_path}"
    headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
    
    # Obtener SHA actual o crear nuevo
    response = requests.get(url, headers=headers)
    sha = response.json().get('sha') if response.status_code == 200 else None
    
    # Formatear a JS
    js_content = f"export const {file_path.split('/')[-1].replace('.js', '').upper()} = {json.dumps(datos_lista, indent=4, ensure_ascii=False)};\n"
    
    data = {
        "message": mensaje_commit,
        "content": base64.b64encode(js_content.encode('utf-8')).decode('utf-8'),
    }
    if sha:
        data["sha"] = sha
        
    response = requests.put(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print(f"✅ {file_path} actualizado correctamente.")
    else:
        print(f"❌ Error al actualizar {file_path}: {response.text}")

def main():
    print("🚀 Iniciando Bot Diario LVBP...")
    if not TOKEN:
        print("❌ ERROR: No se encontró el GITHUB_TOKEN")
        return
        
    driver = iniciar_driver()
    try:
        posiciones = extraer_posiciones(driver)
        if posiciones:
            actualizar_archivo_github('js/datos/posiciones.js', posiciones, "🤖 Bot: Actualización diaria de Posiciones")
            
        resultados = extraer_resultados(driver)
        if resultados:
            actualizar_archivo_github('js/datos/resultados.js', resultados, "🤖 Bot: Actualización diaria de Resultados")
            
        calendario = extraer_calendario(driver)
        if calendario:
            actualizar_archivo_github('js/datos/calendario.js', calendario, "🤖 Bot: Actualización diaria de Calendario")
            
    except Exception as e:
        print(f"❌ Error fatal: {e}")
    finally:
        driver.quit()
        print("🏁 Bot Diario finalizado.")

if __name__ == '__main__':
    main()
