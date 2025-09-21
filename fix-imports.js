#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de correcciones de case sensitivity
const corrections = {
  // Modelos con case sensitivity incorrecto
  'user.js': 'user.js', // Correcto
  'User.js': 'user.js', // Corregir
  'Role.js': 'Role.js', // Correcto
  'Permiso.js': 'Permiso.js', // Correcto
  'Privilegio.js': 'Privilegio.js', // Correcto
  'Cliente.js': 'Cliente.js', // Correcto
  'Empresa.js': 'Empresa.js', // Correcto
  'Servicio.js': 'Servicio.js', // Correcto
  'OrdenServicio.js': 'OrdenServicio.js', // Correcto
  'Empleado.js': 'Empleado.js', // Correcto
  'Seguimiento.js': 'Seguimiento.js', // Correcto
  'TipoArchivo.js': 'TipoArchivo.js', // Correcto
  'Archivo.js': 'Archivo.js', // Correcto
  'Proceso.js': 'Proceso.js', // Correcto
  'DetalleOrdenServicio.js': 'DetalleOrdenServicio.js', // Correcto
  'DetalleServicioOrdenProceso.js': 'DetalleServicioOrdenProceso.js', // Correcto
  'EmpresaCliente.js': 'EmpresaCliente.js', // Correcto
  'citas.js': 'citas.js', // Correcto
  'solicitud_cita.js': 'solicitud_cita.js', // Correcto
  'orden_servico_Servicio.js': 'orden_servico_Servicio.js', // Correcto
  'rol_permiso_privilegio.js': 'rol_permiso_privilegio.js', // Correcto
  'user_rol.js': 'user_rol.js', // Correcto
};

// Función para corregir imports en un archivo
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corregir imports de modelos
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const wrongImport = `from "../models/${wrong}"`;
      const correctImport = `from "../models/${correct}"`;
      
      if (content.includes(wrongImport)) {
        content = content.replace(new RegExp(wrongImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correctImport);
        modified = true;
        console.log(`✅ Corregido: ${filePath} - ${wrong} → ${correct}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFixed = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Excluir node_modules y otros directorios
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        totalFixed += processDirectory(filePath);
      }
    } else if (file.endsWith('.js')) {
      if (fixImportsInFile(filePath)) {
        totalFixed++;
      }
    }
  });

  return totalFixed;
}

// Ejecutar correcciones
console.log('🔧 Iniciando corrección masiva de imports...\n');

const srcDir = path.join(__dirname, 'src');
const totalFixed = processDirectory(srcDir);

console.log(`\n✅ Corrección completada! ${totalFixed} archivos modificados.`);
console.log('🚀 Ahora puedes hacer commit y push de los cambios.');
