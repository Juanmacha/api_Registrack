import EmpresaCliente from "../models/EmpresaCliente.js";

// Relacionar cliente con empresa
export const createEmpresaCliente = async (id_cliente, id_empresa) => {
  return await EmpresaCliente.create({ id_cliente, id_empresa });
};

// Eliminar relación cliente-empresa
export const deleteEmpresaCliente = async (id_cliente, id_empresa) => {
  return await EmpresaCliente.destroy({ where: { id_cliente, id_empresa } });
};
