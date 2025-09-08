import axios from "axios";

const API_URL = "http://localhost:3002/api/orders"; // Ajusta al puerto de tu backend

// Pago Contra Entrega
export const createCashOnDeliveryOrder = async (orderData, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/cash-on-delivery`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Error al crear orden" };
  }
};

// Pago con Stripe
export const createStripeOrder = async (orderData, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/stripe`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Error al crear orden Stripe" };
  }
};
