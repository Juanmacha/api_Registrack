import { obtenerClientesDeEmpresa, obtenerClientesDeEmpresaPorNit } from "../services/empresa.services.js";

// Buscar por ID de empresa
export const listarClientesDeEmpresa = async (req, res) => {
  try {
    const empresa = await obtenerClientesDeEmpresa(req.params.id);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.status(200).json({
      empresa: empresa.nombre,
      nit: empresa.nit,
      clientes: empresa.Clientes
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes de empresa", error: error.message });
  }
};

// Buscar por NIT
export const listarClientesDeEmpresaPorNit = async (req, res) => {
  try {
    const empresa = await obtenerClientesDeEmpresaPorNit(req.params.nit);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.status(200).json({
      empresa: empresa.nombre,
      nit: empresa.nit,
      clientes: empresa.Clientes
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes de empresa por NIT", error: error.message });
  }
};
