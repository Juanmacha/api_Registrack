export class Pago {
  constructor({ 
    id_pago, 
    monto, 
    fecha_pago, 
    metodo_pago, 
    estado, 
    comprobante_url, 
    id_orden_servicio,
    // Nuevos campos para pasarela de pago
    transaction_id,
    gateway,
    gateway_data,
    verified_at,
    verified_by,
    verification_method,
    numero_comprobante
  }) {
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

    // ✅ CORREGIDO: Validación de estado para coincidir con BD
    const estadosValidos = ['Pendiente', 'Pagado', 'Rechazado', 'Reembolsado'];
    if (estado && !estadosValidos.includes(estado)) {
      throw new Error(`El estado debe ser uno de: ${estadosValidos.join(", ")}`);
    }

    // Validación de comprobante_url
    if (comprobante_url && !/^https?:\/\/[^\s]+$/.test(comprobante_url)) {
      throw new Error("El comprobante_url debe ser una URL válida");
    }

    // Validación de id_orden_servicio
    if (typeof id_orden_servicio !== "number" || id_orden_servicio <= 0) {
      throw new Error("El id_orden_servicio debe ser un número positivo");
    }

    // ✅ NUEVO: Validación de gateway
    const gatewaysValidos = ['paypal', 'stripe', 'wompi', 'manual', 'mock'];
    if (gateway && !gatewaysValidos.includes(gateway)) {
      throw new Error(`El gateway debe ser uno de: ${gatewaysValidos.join(", ")}`);
    }

    // ✅ NUEVO: Validación de verification_method
    const methodsValidos = ['gateway', 'manual', 'mock'];
    if (verification_method && !methodsValidos.includes(verification_method)) {
      throw new Error(`El verification_method debe ser uno de: ${methodsValidos.join(", ")}`);
    }

    // Asignaciones originales
    this.id_pago = id_pago;
    this.monto = monto;
    this.fecha_pago = fecha_pago || new Date().toISOString();
    this.metodo_pago = metodo_pago;
    this.estado = estado || 'Pendiente';
    this.comprobante_url = comprobante_url;
    this.id_orden_servicio = id_orden_servicio;

    // ✅ NUEVOS campos para pasarela de pago
    this.transaction_id = transaction_id;
    this.gateway = gateway || 'mock';
    this.gateway_data = gateway_data;
    this.verified_at = verified_at;
    this.verified_by = verified_by;
    this.verification_method = verification_method || 'mock';
    this.numero_comprobante = numero_comprobante;
  }
}
