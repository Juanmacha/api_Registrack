#!/bin/bash

# Script de prueba cURL para validar la corrección de process_states
# Fecha: 29 de Septiembre de 2025

echo "🧪 [TEST CURL] Iniciando prueba de corrección de process_states..."

# Configuración
SERVICIO_ID=1
BASE_URL="http://localhost:3000"
TOKEN="YOUR_TOKEN_HERE"  # Reemplazar con token válido

# Datos de prueba con process_states
TEST_DATA='{
  "visible_en_landing": true,
  "landing_data": {
    "titulo": "Test Process States",
    "resumen": "Prueba de corrección de process_states"
  },
  "process_states": [
    {
      "id": "test1",
      "name": "Solicitud Inicial",
      "order": 1,
      "status_key": "solicitud_inicial"
    },
    {
      "id": "test2",
      "name": "Verificación de Documentos",
      "order": 2,
      "status_key": "verificacion_documentos"
    },
    {
      "id": "test3",
      "name": "Aprobación Final",
      "order": 3,
      "status_key": "aprobacion_final"
    }
  ]
}'

echo "🧪 [TEST CURL] Datos de prueba:"
echo "$TEST_DATA" | jq .

echo "🧪 [TEST CURL] Enviando petición PUT..."

# Ejecutar cURL con logs detallados
curl -X PUT "${BASE_URL}/api/servicios/${SERVICIO_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "$TEST_DATA" \
  -w "\n\n🧪 [TEST CURL] Status Code: %{http_code}\n" \
  -w "🧪 [TEST CURL] Time Total: %{time_total}s\n" \
  -s | jq .

echo "🧪 [TEST CURL] Prueba completada"

# Verificar que el servidor está respondiendo
echo "🔍 [TEST CURL] Verificando estado del servidor..."
curl -s -o /dev/null -w "🧪 [TEST CURL] Servidor respondiendo: %{http_code}\n" "${BASE_URL}/api/servicios"
