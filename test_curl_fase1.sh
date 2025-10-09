#!/bin/bash

# 🚀 SCRIPT DE PRUEBA CURL - FASE 1 IMPLEMENTACIÓN
# 
# Este script prueba la implementación completa usando cURL

# Configuración
BASE_URL="http://localhost:3000/api"
AUTH_TOKEN="tu_token_aqui"  # Reemplazar con token válido

echo "🚀 INICIANDO PRUEBAS DE FASE 1 IMPLEMENTACIÓN"
echo "=============================================="

# 1. Crear solicitud (debería asignar primer estado automáticamente)
echo ""
echo "📝 1. Creando solicitud..."
echo "-------------------------"

RESPONSE_CREACION=$(curl -s -X POST "${BASE_URL}/solicitudes/1" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_titular": "Juan",
    "apellido_titular": "Pérez",
    "tipo_titular": "Persona Natural",
    "tipo_documento": "Cédula",
    "documento": "12345678",
    "correo": "juan@ejemplo.com",
    "telefono": "3001234567",
    "nombre_marca": "Marca Test",
    "descripcion_servicio": "Descripción de prueba"
  }')

echo "Respuesta de creación:"
echo "$RESPONSE_CREACION" | jq '.'

# Extraer ID de la orden
ORDEN_ID=$(echo "$RESPONSE_CREACION" | jq -r '.data.orden_id')
echo "ID de orden extraído: $ORDEN_ID"

if [ "$ORDEN_ID" = "null" ] || [ -z "$ORDEN_ID" ]; then
  echo "❌ No se pudo extraer el ID de la orden. Terminando pruebas."
  exit 1
fi

# 2. Obtener estados disponibles
echo ""
echo "📋 2. Obteniendo estados disponibles..."
echo "--------------------------------------"

curl -s -X GET "${BASE_URL}/solicitudes/${ORDEN_ID}/estados-disponibles" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'

# 3. Obtener estado actual
echo ""
echo "📊 3. Obteniendo estado actual..."
echo "--------------------------------"

curl -s -X GET "${BASE_URL}/solicitudes/${ORDEN_ID}/estado-actual" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'

# 4. Crear seguimiento con cambio de estado
echo ""
echo "🔄 4. Creando seguimiento con cambio de estado..."
echo "------------------------------------------------"

# Primero obtener los estados disponibles para seleccionar uno
ESTADOS_RESPONSE=$(curl -s -X GET "${BASE_URL}/solicitudes/${ORDEN_ID}/estados-disponibles" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

ESTADOS_COUNT=$(echo "$ESTADOS_RESPONSE" | jq '.data.estados_disponibles | length')
echo "Estados disponibles: $ESTADOS_COUNT"

if [ "$ESTADOS_COUNT" -gt 1 ]; then
  # Tomar el segundo estado (índice 1)
  NUEVO_ESTADO=$(echo "$ESTADOS_RESPONSE" | jq -r '.data.estados_disponibles[1].nombre')
  echo "Nuevo estado seleccionado: $NUEVO_ESTADO"
  
  curl -s -X POST "${BASE_URL}/seguimientos" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"id_orden_servicio\": ${ORDEN_ID},
      \"titulo\": \"Cambio de estado de prueba\",
      \"descripcion\": \"Probando cambio de estado desde seguimiento\",
      \"nuevo_estado\": \"${NUEVO_ESTADO}\"
    }" | jq '.'
else
  echo "⚠️ Solo hay un estado disponible, no se puede probar el cambio"
fi

# 5. Verificar que el estado se cambió
echo ""
echo "✅ 5. Verificando cambio de estado..."
echo "------------------------------------"

curl -s -X GET "${BASE_URL}/solicitudes/${ORDEN_ID}/estado-actual" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'

# 6. Obtener estados disponibles desde seguimiento
echo ""
echo "📋 6. Obteniendo estados desde seguimiento..."
echo "--------------------------------------------"

curl -s -X GET "${BASE_URL}/seguimientos/${ORDEN_ID}/estados-disponibles" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'

echo ""
echo "🎉 PRUEBAS COMPLETADAS"
echo "====================="
