import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone'; 

dotenv.config();

export const emitirComprobante = async (req, res) => {
  const {
    tipo_comprobante,
    tipo_documento,
    numero_documento,
    razon_social,
    direccion,
    items
  } = req.body;

  if (!['1', '2', '3', '4'].includes(tipo_comprobante)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de comprobante inválido'
    });
  }

  if (!['1', '6'].includes(tipo_documento)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de documento inválido. Debe ser 1 (DNI) o 6 (RUC).'
    });
  }

  if (!numero_documento || !razon_social || !direccion || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios o items vacíos'
    });
  }

  try {
    const formattedItems = items.map((item, index) => {
      const cantidad = Number(item.cantidad);
      const valor_unitario = Number(item.valor_unitario);
      const igv = Number(item.igv);
      const subtotal = Number(item.total_base_igv);
      const total = Number(item.total);

      if (
        isNaN(cantidad) || isNaN(valor_unitario) || isNaN(igv) ||
        isNaN(subtotal) || isNaN(total) ||
        cantidad <= 0 || valor_unitario <= 0 || total <= 0
      ) {
        throw new Error(`El item #${index + 1} tiene datos inválidos.`);
      }

      return {
        unidad_de_medida: 'NIU',
        codigo: item.codigo || `P-${index + 1}`,
        codigo_unico: item.codigo_unico || uuidv4(),
        codigo_unico_por_item: item.codigo_unico_por_item || uuidv4(),
        descripcion: item.descripcion || 'Producto',
        cantidad,
        valor_unitario,
        precio_unitario: +(valor_unitario * 1.18).toFixed(2),
        subtotal,
        tipo_de_igv: 1,
        igv,
        total,
        total_base_igv: subtotal
      };
    });

    const payload = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: tipo_comprobante,
      serie: tipo_comprobante === '1' ? 'FFF1' : 'BBB1',
      numero: '',
      codigo_unico: uuidv4(),
      sunat_transaction: 1,
      cliente_tipo_de_documento: tipo_documento,
      cliente_numero_de_documento: numero_documento,
      cliente_denominacion: razon_social,
      cliente_direccion: direccion,
      cliente_email: '',
      fecha_de_emision: moment().tz('America/Lima').format('YYYY-MM-DD'), // ✅ FECHA LOCAL DE PERÚ
      moneda: 1,
      tipo_de_cambio: '',
      porcentaje_de_igv: 18,
      total_gravada: formattedItems.reduce((acc, i) => acc + i.total_base_igv, 0),
      total_igv: formattedItems.reduce((acc, i) => acc + i.igv, 0),
      total: formattedItems.reduce((acc, i) => acc + i.total, 0),
      total_letras: '',
      items: formattedItems
    };

    console.log('📦 Enviando payload a Nubefact:', JSON.stringify(payload, null, 2));

    const response = await axios.post(process.env.NUBEFACT_API_URL, payload, {
      headers: {
        Authorization: `Token token=${process.env.NUBEFACT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Comprobante emitido correctamente',
      data: response.data
    });

  } catch (error) {
    console.error('❌ ERROR AL EMITIR COMPROBANTE');
    console.error('🧾 Request BODY:', JSON.stringify(req.body, null, 2));
    console.error('💥 Error Nubefact:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Error al emitir comprobante',
      error: error.response?.data || error.message
    });
  }
};
