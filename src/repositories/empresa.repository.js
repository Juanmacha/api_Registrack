import Empresa from "../models/Empresa.js";
import Cliente from "../models/Cliente.js";

// Buscar empresa por NIT
export const findByNit = async (nit) => {
  return await Empresa.findOne({ where: { nit } });
};

// Crear empresa
export const createEmpresa = async (empresaData) => {
  return await Empresa.create(empresaData);
};

// Actualizar empresa
export const updateEmpresa = async (id_empresa, updateData) => {
  const empresa = await Empresa.findByPk(id_empresa);
  
  if (!empresa) {
    return null;
  }
  
  return await empresa.update(updateData);
};

// Obtener todas las empresas
export const getAllEmpresas = async () => {
  return await Empresa.findAll();
};

// Obtener clientes de una empresa por ID
export const getClientesByEmpresaId = async (id_empresa) => {
  return await Empresa.findByPk(id_empresa, {
    include: {
      model: Cliente,
      as: 'Clientes', // ✅ Alias requerido según associations.js
      through: { attributes: [] } // Oculta la tabla intermedia
    }
  });
};

// O también por NIT
export const getClientesByNit = async (nit) => {
  return await Empresa.findOne({
    where: { nit },
    include: {
      model: Cliente,
      as: 'Clientes', // ✅ Alias requerido según associations.js
      through: { attributes: [] }
    }
  });
};
