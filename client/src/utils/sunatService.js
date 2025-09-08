import Axios from "./Axios" // Asegúrate de que este Axios esté configurado para apuntar a tu backend Express

export const sunatService = {
  consultarDNI: async (dni) => {
    if (!dni || dni.length !== 8) {
      return { success: false, error: "El DNI debe tener exactamente 8 dígitos" }
    }
    try {
      // Llama a tu propio backend Express en el endpoint /api/validar/dni/:numero
      const response = await Axios.get(`/api/validar/dni/${dni}`)
      const data = response.data.data

      if (!data || !data.nombres) {
        return { success: false, error: "No se encontraron datos para este DNI" }
      }

      return {
        success: true,
        data: {
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          nombreCompleto: `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al consultar DNI",
      }
    }
  },

  consultarRUC: async (ruc) => {
    if (!ruc || ruc.length !== 11) {
      return { success: false, error: "El RUC debe tener exactamente 11 dígitos" }
    }
    try {
      // Llama a tu propio backend Express en el endpoint /api/validar/ruc/:numero
      const response = await Axios.get(`/api/validar/ruc/${ruc}`)
      const data = response.data.data

      if (!data || !data.razonSocial) {
        return { success: false, error: "No se encontraron datos para este RUC" }
      }

      return {
        success: true,
        data: {
          razonSocial: data.razonSocial,
          direccion: data.direccion,
          estado: data.estado,
          condicion: data.condicion,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al consultar RUC",
      }
    }
  },

  validarFormato: (tipo, numero) => {
    if (!numero || !numero.trim()) {
      return {
        valido: false,
        mensaje: "Ingrese un número de documento",
      }
    }

    if (tipo === "1") {
      if (numero.length !== 8) {
        return {
          valido: false,
          mensaje: "El DNI debe tener exactamente 8 dígitos",
        }
      }
    } else if (tipo === "6") {
      if (numero.length !== 11) {
        return {
          valido: false,
          mensaje: "El RUC debe tener exactamente 11 dígitos",
        }
      }
    }

    return {
      valido: true,
      mensaje: "Formato válido",
    }
  },
}
