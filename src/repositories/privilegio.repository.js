// src/repositories/privilegioRepository.js
import Privilegio from '../models/Privilegio.js';

export const createPrivilegio = (data) => Privilegio.create(data);

export const getAllPrivilegios = () => Privilegio.findAll();

export const getPrivilegioById = (id) => Privilegio.findByPk(id);

export const updatePrivilegio = (id, data) =>
  Privilegio.update(data, { where: { id_privilegio: id } });

export const deletePrivilegio = (id) =>
  Privilegio.destroy({ where: { id_privilegio: id } });
