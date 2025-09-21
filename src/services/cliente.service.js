import { findByNit, createEmpresa } from "../repositories/empresa.repository.js";
import { createCliente, getAllClientes, getClienteById, updateCliente, deleteCliente } from "../repositories/cliente.repository.js";
import { createEmpresaCliente } from "../repositories/empresaCliente.repository.js";

export const registrarCliente = async (clienteData, empresaData) => {
  // 1. Verificar empresa
  let empresa = await findByNit(empresaData.nit);
  if (!empresa) {
    empresa = await createEmpresa(empresaData);
  }

  // 2. Crear cliente
  const cliente = await createCliente(clienteData);

  // 3. Asociar cliente ↔ empresa
  await createEmpresaCliente(cliente.id_cliente, empresa.id_empresa);

  return { cliente, empresa };
};

export const obtenerClientes = async () => {
  return await getAllClientes();
};

export const obtenerClientePorId = async (id_cliente) => {
  return await getClienteById(id_cliente);
};

export const actualizarCliente = async (id_cliente, updateData) => {
  return await updateCliente(id_cliente, updateData);
};

export const eliminarCliente = async (id_cliente) => {
  return await deleteCliente(id_cliente);
};
