import { v4 as uuidv4 } from "uuid"

export const nubefactService = {
  /**
   * Prepara items del carrito para Nubefact
   * @param {Array} cartItems - Items del carrito
   * @returns {Array} Items formateados para Nubefact
   */
  prepararItems: (cartItems) => {
    return cartItems
      .filter((item) => item?.productId && item?.quantity > 0)
      .map((item) => {
        const cantidad = Number(item.quantity)
        const precioOriginal = Number(item.productId.price || 0)
        const descuento = Number(item.productId.discount || 0)
        const valorUnitarioBruto = precioOriginal * (1 - descuento / 100)
        const valor_unitario = +(valorUnitarioBruto / 1.18).toFixed(2)
        const subtotal = +(valor_unitario * cantidad).toFixed(2)
        const igv = +(subtotal * 0.18).toFixed(2)
        const total = +(subtotal + igv).toFixed(2)

        return {
          unidad_de_medida: "NIU",
          codigo: String(item.productId._id),
          descripcion: item.productId.name || "Producto sin nombre",
          cantidad,
          valor_unitario,
          precio_unitario: +(valor_unitario * 1.18).toFixed(2),
          subtotal,
          tipo_de_igv: 1,
          igv,
          total,
          total_base_igv: subtotal,
          codigo_unico: uuidv4(),
          codigo_unico_por_item: uuidv4(),
        }
      })
  },

  /**
   * Emite comprobante en Nubefact
   * @param {Object} datosFacturacion - Datos de facturación
   * @param {Array} items - Items del pedido
   * @returns {Promise<Object>} Resultado de la emisión
   */
  emitirComprobante: async (datosFacturacion, items, Axios) => {
    try {
      const response = await Axios.post("/api/facturacion", {
        tipo_comprobante: datosFacturacion.tipoDocumento === "6" ? "1" : "2",
        tipo_documento: datosFacturacion.tipoDocumento,
        numero_documento: datosFacturacion.numeroDocumento,
        razon_social: datosFacturacion.razonSocial,
        direccion: datosFacturacion.direccionFiscal,
        items,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },
}
