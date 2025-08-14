export class Pago {
  constructor({ id_pago, monto, fecha_pago, metodo_pago, estado, comprobante_url, id_orden_servicio }) {
    // Validación de ID
    if (id_pago !== undefined && (typeof id_pago !== "number" || id_pago <= 0)) {
      throw new Error("El id_pago debe ser un número positivo");
    }

    // Validación de monto
    if (typeof monto !== "number" || monto <= 0) {
      throw new Error("El monto debe ser un número mayor que 0");
    }

    // Validación de fecha
    if (fecha_pago && isNaN(Date.parse(fecha_pago))) {
      throw new Error("La fecha_pago no es válida");
    }

    // Validación de método de pago
    const metodosValidos = ["Efectivo", "Transferencia", "Tarjeta", "Cheque"];
    if (!metodosValidos.includes(metodo_pago)) {
      throw new Error(`El metodo_pago debe ser uno de: ${metodosValidos.join(", ")}`);
    }

    // Validación de estado
    if (![0, 1].includes(estado)) {
      throw new Error("El estado debe ser 0 (inactivo) o 1 (activo)");
    }

    // Validación de comprobante_url
    if (comprobante_url && !/^https?:\/\/[^\s]+$/.test(comprobante_url)) {
      throw new Error("El comprobante_url debe ser una URL válida");
    }

    // Validación de id_orden_servicio
    if (typeof id_orden_servicio !== "number" || id_orden_servicio <= 0) {
      throw new Error("El id_orden_servicio debe ser un número positivo");
    }

    // Asignaciones
    this.id_pago = id_pago;
    this.monto = monto;
    this.fecha_pago = fecha_pago || new Date().toISOString();
    this.metodo_pago = metodo_pago;
    this.estado = estado;
    this.comprobante_url = comprobante_url;
    this.id_orden_servicio = id_orden_servicio;
  }
}
