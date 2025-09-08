import axios from "axios"

export const consultarDocumentoSunat = async (req, res) => {
  const { tipo, numero } = req.params

  if (!numero || !["dni", "ruc"].includes(tipo)) {
    return res.status(400).json({ success: false, message: "Tipo o número inválido" })
  }

  try {
    const url =
      tipo === "dni"
        ? `https://api.apis.net.pe/v2/reniec/dni?numero=${numero}`
        : `https://api.apis.net.pe/v2/sunat/ruc?numero=${numero}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SUNAT_API_KEY}`, // Usa tu token aquí
        Referer: "https://apis.net.pe/consulta-dni-api", // Puedes cambiar esto a tu dominio si lo tienes
      },
    })

    return res.json({ success: true, data: response.data })
  } catch (error) {
    console.error("Error al consultar documento en SUNAT:", error.message)
    // Para depuración, puedes loguear la respuesta completa del error de la API externa
    if (error.response) {
      console.error("SUNAT API Response Error:", error.response.data)
      console.error("SUNAT API Status:", error.response.status)
    }
    return res.status(500).json({
      success: false,
      message: "No se pudo validar el documento en SUNAT. Intente nuevamente más tarde.",
    })
  }
}
