#!/bin/bash

# Ruta al archivo Markdown de entrada
INPUT_FILE="VecinosExpress_Manual_Tecnico.md"

# Ruta al archivo DOCX de salida
OUTPUT_FILE="VecinosExpress_Manual_Tecnico.docx"

# Comprobar si existe el archivo de entrada
if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: No se encuentra el archivo $INPUT_FILE"
  exit 1
fi

echo "Generando documento Word a partir de $INPUT_FILE..."

# Usar pandoc para convertir de Markdown a DOCX
pandoc "$INPUT_FILE" \
  -o "$OUTPUT_FILE" \
  --toc \
  --toc-depth=3 \
  --highlight-style=tango \
  --variable mainfont="Helvetica" \
  --variable sansfont="Helvetica" \
  --variable monofont="Consolas" \
  --variable fontsize=11pt \
  --variable documentclass=report \
  --variable geometry=margin=1in

# Verificar si la conversión fue exitosa
if [ $? -eq 0 ]; then
  echo "Conversión exitosa. Documento generado: $OUTPUT_FILE"
  ls -lh "$OUTPUT_FILE"
else
  echo "Error: No se pudo generar el documento DOCX."
  exit 1
fi