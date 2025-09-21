// src/services/privilegioService.js
import * as privilegioRepository from '../repositories/privilegio.repository.js';

const privilegioService = {
  createPrivilegio: (data) => privilegioRepository.createPrivilegio(data),
  getAllPrivilegios: () => privilegioRepository.getAllPrivilegios(),
  getPrivilegioById: (id) => privilegioRepository.getPrivilegioById(id),
  updatePrivilegio: (id, data) => privilegioRepository.updatePrivilegio(id, data),
  deletePrivilegio: (id) => privilegioRepository.deletePrivilegio(id),
};

export default privilegioService;
