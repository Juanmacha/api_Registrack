#!/bin/bash

# Script de prueba cURL para validar la corrección del error 500
# Fecha: 28 de Septiembre de 2025

echo "🧪 [TEST CURL] Iniciando prueba de corrección del error 500..."

# Configuración
SERVICIO_ID=1
BASE_URL="http://localhost:3000"
TOKEN="YOUR_TOKEN_HERE"  # Reemplazar con token válido

# Datos de prueba simples
TEST_DATA='{
  "visible_en_landing": false
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
  -w "🧪 [TEST CURL] Time Connect: %{time_connect}s\n" \
  -w "🧪 [TEST CURL] Time Start Transfer: %{time_starttransfer}s\n" \
  -s | jq .

echo "🧪 [TEST CURL] Prueba completada"

# Verificar si el servidor está respondiendo
echo "🔍 [TEST CURL] Verificando estado del servidor..."
curl -s -o /dev/null -w "🧪 [TEST CURL] Servidor respondiendo: %{http_code}\n" "${BASE_URL}/api/servicios"
