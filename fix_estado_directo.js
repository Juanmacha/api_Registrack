/**
 * 🔧 CORRECCIÓN DIRECTA DEL ESTADO DE SOLICITUD
 * 
 * Este script corrige directamente en la base de datos el problema de "Sin estado"
 */

import sequelize from './src/config/db.js';
import { OrdenServicio, Servicio, Proceso, DetalleOrdenServicio } from './src/models/associations.js';

async function fixEstadoDirecto() {
  try {
    console.log('🔧 INICIANDO CORRECCIÓN DIRECTA DEL ESTADO\n');
    
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // 2. Buscar todas las órdenes de servicio sin estado
    console.log('\n📋 2. Buscando órdenes sin estado...');
    
    const ordenesSinEstado = await OrdenServicio.findAll({
      include: [{
        model: Servicio,
        as: 'servicio',
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      }]
    });
    
    console.log(`📊 Órdenes encontradas: ${ordenesSinEstado.length}`);
    
    for (const orden of ordenesSinEstado) {
      console.log(`\n🔍 Procesando orden ${orden.id_orden_servicio}...`);
      
      // Verificar si ya tiene un estado
      const estadoExistente = await DetalleOrdenServicio.findOne({
        where: { id_orden_servicio: orden.id_orden_servicio },
        order: [['fecha_estado', 'DESC']]
      });
      
      if (estadoExistente) {
        console.log(`   ✅ Ya tiene estado: ${estadoExistente.estado}`);
        continue;
      }
      
      // Buscar el primer proceso del servicio
      if (orden.servicio && orden.servicio.process_states && orden.servicio.process_states.length > 0) {
        const primerProceso = orden.servicio.process_states[0];
        console.log(`   🔄 Asignando estado: ${primerProceso.nombre}`);
        
        // Crear registro en DetalleOrdenServicio
        await DetalleOrdenServicio.create({
          id_orden_servicio: orden.id_orden_servicio,
          id_servicio: orden.id_servicio,
          estado: primerProceso.nombre,
          fecha_estado: new Date()
        });
        
        // Actualizar el estado de la orden principal
        await orden.update({ estado: primerProceso.nombre });
        
        console.log(`   ✅ Estado asignado: ${primerProceso.nombre}`);
      } else {
        console.log(`   ⚠️ Servicio sin process_states, usando estado por defecto`);
        
        // Crear estado por defecto
        await DetalleOrdenServicio.create({
          id_orden_servicio: orden.id_orden_servicio,
          id_servicio: orden.id_servicio,
          estado: "Pendiente",
          fecha_estado: new Date()
        });
        
        await orden.update({ estado: "Pendiente" });
        console.log(`   ✅ Estado por defecto asignado: Pendiente`);
      }
    }
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA');
    console.log('========================');
    console.log('✅ Todas las órdenes ahora tienen estado asignado');
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar corrección
fixEstadoDirecto();
