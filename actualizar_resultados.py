def extraer_tarjetas_juego(driver):
    logger.info("🏆 Extrayendo resultados (DEBUG)...")
    
    try:
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Buscar TODOS los divs
        todos_divs = soup.find_all('div')
        logger.info(f"📊 Total de divs encontrados: {len(todos_divs)}")
        
        # Muestra los primeros 10 divs con "Finalizado"
        logger.info("🔍 Buscando divs con 'Finalizado':")
        contador = 0
        for i, div in enumerate(todos_divs[:50]):  # Primeros 50 divs
            texto = div.get_text()
            if 'finalizado' in texto.lower() or 'final' in texto.lower():
                logger.info(f"  ✅ Div {i}: '{texto[:150]}...'")
                contador += 1
                if contador >= 5:
                    break
        
        # Si no encontró, muestra algunos divs grandes
        if contador == 0:
            logger.info("⚠️ No se encontró 'Finalizado'. Muestra divs grandes:")
            for i, div in enumerate(todos_divs[:20]):
                texto = div.get_text()
                if len(texto) > 200:  # Solo divs grandes
                    logger.info(f"  Div {i} ({len(texto)} chars): '{texto[:100]}...'")
        
        # Continuar con la extracción normal...
        # (el resto del código que ya tenías)
