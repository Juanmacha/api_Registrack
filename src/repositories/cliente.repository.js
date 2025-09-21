import Cliente from "../models/Cliente.js";
import Empresa from "../models/Empresa.js";
import User from "../models/user.js";

// Crear cliente
export const createCliente = async (clienteData) => {
  return await Cliente.create(clienteData);
};

// Obtener todos los clientes (con sus empresas y usuarios)
export const getAllClientes = async () => {
  return await Cliente.findAll({
    include: [
      { model: Empresa, through: { attributes: [] } },
      { model: User, as: "Usuario" }
    ]
  });
};

// Obtener cliente por ID
export const getClienteById = async (id_cliente) => {
  return await Cliente.findByPk(id_cliente, {
    include: [
      { model: Empresa, through: { attributes: [] } },
      { model: User, as: "Usuario" }
    ]
  });
};

// Actualizar cliente
export const updateCliente = async (id_cliente, updateData) => {
  const cliente = await Cliente.findByPk(id_cliente);
  if (!cliente) return null;
  return await cliente.update(updateData);
};

// Eliminar cliente
export const deleteCliente = async (id_cliente) => {
  const cliente = await Cliente.findByPk(id_cliente);
  if (!cliente) return null;
  await cliente.destroy();
  return cliente;
};
