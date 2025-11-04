import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrdenServicio = sequelize.define(
  "OrdenServicio",
  {
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_expediente: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_empleado_asignado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    total_estimado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    codigo_postal: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Campos editables para "¿Quién solicita el servicio?"
    tipodepersona: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tipodedocumento: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    numerodedocumento: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nombrecompleto: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    correoelectronico: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Campos editables para información de la empresa
    tipodeentidadrazonsocial: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nombredelaempresa: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Campos editables para documentos de poder
    poderdelrepresentanteautorizado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    poderparaelregistrodelamarca: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // *** FASE 1: CAMPOS CRÍTICOS (28 Oct 2025) ***
    // Campos de Marca/Producto
    nombredelamarca: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre de la marca a registrar, renovar, ceder, etc.'
    },
    clase_niza: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Clasificación internacional de productos y servicios'
    },
    tipo_producto_servicio: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo: Productos o Servicios'
    },
    // Campos de Documentos
    logotipo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Logotipo de la marca en base64 o URL'
    },
    // Campos de Representantes
    representante_legal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre completo del representante legal'
    },
    // *** FASE 2: CAMPOS IMPORTANTES (28 Oct 2025) ***
    // Campos de Documentos
    certificado_camara_comercio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Certificado de cámara de comercio'
    },
    certificado_renovacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Certificado de renovación de marca'
    },
    documento_cesion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Documento de cesión de marca'
    },
    documentos_oposicion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Documentos de oposición'
    },
    soportes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Documentos adicionales de soporte'
    },
    // Campos de Expedientes/Referencias
    numero_expediente_marca: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de expediente de marca existente'
    },
    marca_a_oponerse: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Marca contra la que se opone'
    },
    marca_opositora: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Marca que presenta oposición'
    },
    numero_registro_existente: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de registro actual'
    },
    // Campos de auditoría para anulaciones
    anulado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      },
      comment: 'ID del usuario que anuló la solicitud'
    },
    fecha_anulacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de anulación'
    },
    motivo_anulacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo de la anulación'
    },

    // *** FASE 3: CAMPOS ESPECÍFICOS (28 Oct 2025) ***
    // Campos de Cesionario
    nombre_razon_social_cesionario: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre o razón social del cesionario'
    },
    nit_cesionario: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'NIT del cesionario'
    },
    tipo_documento_cesionario: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Tipo documento cesionario'
    },
    numero_documento_cesionario: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número documento cesionario'
    },
    correo_cesionario: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Correo del cesionario'
    },
    telefono_cesionario: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Teléfono del cesionario'
    },
    direccion_cesionario: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección del cesionario'
    },
    representante_legal_cesionario: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Representante legal del cesionario'
    },
    // Campos de Argumentos/Descripción
    argumentos_respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Argumentos legales de respuesta a oposición'
    },
    descripcion_nuevos_productos_servicios: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de nuevos productos/servicios (ampliación)'
    },
    // Campos de Clases Niza
    clase_niza_actual: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Clase Niza actual del registro'
    },
    nuevas_clases_niza: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Nuevas clases Niza a agregar'
    },
    // Otros campos
    documento_nit_titular: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Documento o NIT del titular'
    },
    numero_nit_cedula: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número NIT o Cédula'
    }
  },
  {
    tableName: "ordenes_de_servicios",
    timestamps: false,
  }
);

export default OrdenServicio;
