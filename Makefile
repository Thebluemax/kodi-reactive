# --- Variables de empaquetado ---
ADDON_ID   := webinterface.reactive
DIST_DIR   := ./dist
BUILD_DIR  := ./www
ADDON_DIR  := ./build
PACKAGE_DIR := ./${ADDON_DIR}/$(ADDON_ID)
ZIP_FILE   := ./${ADDON_DIR}/$(ADDON_ID).zip

.PHONY: package
package: clean-package ## Prepara el contenido y genera el archivo .zip para Kodi
	@echo "Creando estructura de carpetas..."
	mkdir -p $(PACKAGE_DIR)
	
	@echo "Copiando archivos de build y addon.xml..."
	cp -r $(BUILD_DIR)/* $(PACKAGE_DIR)/
	cp ./logo.png $(PACKAGE_DIR)/icon.png
	cp addon.xml $(PACKAGE_DIR)/
	
	@echo "Comprimiendo en $(ZIP_FILE)..."
	zip -r $(ZIP_FILE) $(PACKAGE_DIR)
	
	@echo "Limpiando archivos temporales..."
	#rm -rf $(PACKAGE_DIR)
	@echo "¡Paquete listo!"

.PHONY: clean-package
clean-package: ## Elimina el zip y la carpeta temporal del paquete
	rm -f $(ZIP_FILE)
	rm -rf $(PACKAGE_DIR)