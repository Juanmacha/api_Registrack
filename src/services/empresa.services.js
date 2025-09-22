import { getClientesByEmpresaId, getClientesByNit, createEmpresa } from "../repositories/empresa.repository.js";

export const obtenerClientesDeEmpresa = async (id_empresa) => {
  return await getClientesByEmpresaId(id_empresa);
};

export const obtenerClientesDeEmpresaPorNit = async (nit) => {
  return await getClientesByNit(nit);
};

export const crearEmpresa = async (empresaData) => {
  return await createEmpresa(empresaData);
};
