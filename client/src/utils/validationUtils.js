export const validationUtils = {
  /**
   * Valida campos de facturación
   * @param {Object} datos - Datos a validar
   * @returns {Object} Resultado de validación
   */
  validarDatosFacturacion: (datos) => {
    const errores = {}

    // Validar número de documento
    if (!datos.numeroDocumento?.trim()) {
      errores.numeroDocumento = "Ingrese un número de documento"
    } else {
      if (datos.tipoDocumento === "1" && datos.numeroDocumento.length !== 8) {
        errores.numeroDocumento = "El DNI debe tener exactamente 8 dígitos"
      }
      if (datos.tipoDocumento === "6" && datos.numeroDocumento.length !== 11) {
        errores.numeroDocumento = "El RUC debe tener exactamente 11 dígitos"
      }
    }

    // Validar razón social
    if (!datos.razonSocial?.trim()) {
      errores.razonSocial = "Ingrese un nombre o razón social"
    }

    // Validar dirección fiscal
    if (!datos.direccionFiscal?.trim()) {
      errores.direccionFiscal = "Ingrese una dirección fiscal"
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores,
    }
  },

  /**
   * Valida que el carrito no esté vacío
   * @param {Array} cartItems - Items del carrito
   * @returns {boolean} True si el carrito es válido
   */
  validarCarrito: (cartItems) => {
    return cartItems && cartItems.length > 0
  },

  /**
   * Valida que haya una dirección seleccionada
   * @param {Array} addressList - Lista de direcciones
   * @param {number} selectedIndex - Índice seleccionado
   * @returns {boolean} True si hay dirección válida
   */
  validarDireccion: (addressList, selectedIndex) => {
    return addressList && addressList[selectedIndex] && addressList[selectedIndex].status
  },
}
