import { getClientesByEmpresaId, getClientesByNit } from "../repositories/empresa.repository.js";

export const obtenerClientesDeEmpresa = async (id_empresa) => {
  return await getClientesByEmpresaId(id_empresa);
};

export const obtenerClientesDeEmpresaPorNit = async (nit) => {
  return await getClientesByNit(nit);
};
