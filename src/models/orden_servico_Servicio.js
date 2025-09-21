import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";

//  Relación OrdenServicio -> Servicio
OrdenServicio.belongsTo(Servicio, { foreignKey: "id_servicio", as: "servicio" });
Servicio.hasMany(OrdenServicio, { foreignKey: "id_servicio", as: "ordenes" });

export { OrdenServicio, Servicio };
