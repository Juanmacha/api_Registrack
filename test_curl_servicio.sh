#!/bin/bash

# Script de prueba cURL para validar la corrección del bug en updateServicio
# Fecha: 28 de Septiembre de 2025

echo "🧪 [TEST CURL] Iniciando prueba de actualización de servicio..."

# Configuración
SERVICIO_ID=1
BASE_URL="http://localhost:3000"
TOKEN="YOUR_TOKEN_HERE"  # Reemplazar con token válido

# Datos de prueba
TEST_DATA='{
  "landing_data": {
    "titulo": "Nuevo Título de Prueba - '$(date -Iseconds)'",
    "resumen": "Nuevo resumen de prueba actualizado",
    "imagen": "nueva_imagen_test.jpg"
  },
  "visible_en_landing": true
}'

echo "🧪 [TEST CURL] Datos de prueba:"
echo "$TEST_DATA" | jq .

echo "🧪 [TEST CURL] Enviando petición PUT..."

# Ejecutar cURL
curl -X PUT "${BASE_URL}/api/servicios/${SERVICIO_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "$TEST_DATA" \
  -w "\n\n🧪 [TEST CURL] Status Code: %{http_code}\n" \
  -s | jq .

echo "🧪 [TEST CURL] Prueba completada"
