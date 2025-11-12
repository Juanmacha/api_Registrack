-- =============================================
-- SCRIPT: Asignar Permisos al Rol Empleado (Ejemplo)
-- Fecha: Enero 2026
-- Descripción: Asigna permisos específicos al rol 'empleado' como ejemplo
-- NOTA: Este es solo un ejemplo. Ajusta los permisos según tus necesidades.
-- NOTA: Este script es idempotente y seguro ejecutarlo múltiples veces
-- =============================================

USE registrack_db;

-- =============================================
-- VERIFICACIONES PREVIAS
-- =============================================
-- Verificar que existen privilegios básicos
SET @privilegios_count = (SELECT COUNT(*) FROM privilegios);
SELECT 
    CASE 
        WHEN @privilegios_count = 0 THEN '⚠️ ADVERTENCIA: No se encontraron privilegios. Ejecuta primero el script 001_crear_permisos_privilegios_basicos.sql'
        ELSE CONCAT('✅ Privilegios encontrados: ', @privilegios_count)
    END as verificacion_privilegios;

-- Verificar que existen permisos básicos
SET @permisos_count = (SELECT COUNT(*) FROM permisos);
SELECT 
    CASE 
        WHEN @permisos_count = 0 THEN '⚠️ ADVERTENCIA: No se encontraron permisos. Ejecuta primero el script 001_crear_permisos_privilegios_basicos.sql'
        ELSE CONCAT('✅ Permisos encontrados: ', @permisos_count)
    END as verificacion_permisos;

-- =============================================
-- OBTENER IDs DE ROL, PERMISOS Y PRIVILEGIOS
-- =============================================
SET @id_rol_empleado = (SELECT id_rol FROM roles WHERE nombre = 'empleado' LIMIT 1);

-- Verificar que el rol existe
SELECT 
    CASE 
        WHEN @id_rol_empleado IS NULL THEN '❌ ERROR: No se encontró el rol "empleado". Asegúrate de que exista en la tabla roles.'
        ELSE CONCAT('✅ Rol empleado encontrado con ID: ', @id_rol_empleado)
    END as verificacion_rol;

-- =============================================
-- ASIGNAR PERMISOS AL ROL EMPLEADO
-- =============================================
-- Ejemplo: Empleado puede LEER usuarios, pero NO crear, actualizar ni eliminar

-- Permiso: Leer usuarios
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_usuarios' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer solicitudes
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_solicitudes' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Crear y leer citas
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_citas' AND pr.nombre IN ('crear', 'leer')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer y actualizar seguimiento
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_seguimiento' AND pr.nombre IN ('leer', 'crear', 'actualizar')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer dashboard
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_dashboard' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- =============================================
-- VERIFICACIÓN
-- =============================================
-- Ver permisos asignados al rol empleado
SELECT 
    r.nombre as rol,
    p.nombre as permiso,
    pr.nombre as privilegio
FROM rol_permisos_privilegios rpp
JOIN roles r ON rpp.id_rol = r.id_rol
JOIN permisos p ON rpp.id_permiso = p.id_permiso
JOIN privilegios pr ON rpp.id_privilegio = pr.id_privilegio
WHERE r.nombre = 'empleado'
ORDER BY p.nombre, pr.nombre;

-- =============================================
-- NOTAS
-- =============================================
/*
IMPORTANTE:
1. Este script es solo un EJEMPLO. Ajusta los permisos según las necesidades de tu negocio.
2. El rol 'administrador' NO necesita permisos (tiene bypass automático).
3. El rol 'cliente' mantiene su lógica actual (no requiere permisos aquí).
4. Puedes crear roles personalizados y asignarles permisos específicos.
5. Para asignar todos los permisos a un rol, ejecuta:
   INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
   SELECT @id_rol, p.id_permiso, pr.id_privilegio
   FROM permisos p, privilegios pr
   WHERE p.nombre LIKE 'gestion_%' AND pr.nombre IN ('crear', 'leer', 'actualizar', 'eliminar');
*/

