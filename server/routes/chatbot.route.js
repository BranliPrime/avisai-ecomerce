import express from "express";
import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message, language = "es" } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje requerido" });

    const text = message.toLowerCase();

    // 📌 Caso especial: ¿Qué producto cuesta más?
    if (
      text.includes("producto más caro") ||
      text.includes("producto mas caro") ||
      text.includes("producto más costoso") ||
      text.includes("producto mas costoso") ||
      text.includes("cuál es el más caro") ||
      text.includes("cual es el mas caro")
    ) {
      return res.json({
        reply: "🔝 El producto más costoso actualmente es la **baranda de acero**.",
      });
    }

    // 📌 Caso 1: Preguntas por precio de un producto específico
    const priceTriggers = ["precio", "cuánto cuesta", "cuanto cuesta", "vale", "cuesta"];
    const isPriceQuestion = priceTriggers.some((k) => text.includes(k));

    if (isPriceQuestion) {
      // Buscar productos cuyo nombre se menciona en el mensaje
      const allProducts = await ProductModel.find({ publish: true });
      const matchedProducts = allProducts.filter((product) =>
        text.includes(product.name.toLowerCase())
      );

      if (matchedProducts.length) {
        const list = matchedProducts
          .map((p) => `- ${p.name}: S/ ${p.price}`)
          .join("\n");

        return res.json({
          reply: `Aquí tienes productos disponibles con sus precios:\n${list}`,
        });
      } else {
        return res.json({
          reply: `💬 Parece que estás interesado en precios. Para conocer el costo de un producto específico, te invitamos a contactarnos directamente:\n\n📞 WhatsApp: 901670452\n📧 Correo: mutiserviciosavisai@gmail.com\n🏬 Dirección: Plaza de Huancán, Huancayo, Junín.\n\nEstaremos encantados de ayudarte con información personalizada.`,
        });
      }
    }

    // 📌 Caso 2: Productos en general
    if (text.includes("productos")) {
      const products = await ProductModel.find({ publish: true }).limit(5);
      if (!products.length) {
        return res.json({ reply: "Actualmente no tenemos productos disponibles." });
      }
      const list = products.map((p) => `- ${p.name}`).join("\n");
      return res.json({
        reply: `Estos son algunos productos que tenemos:\n${list}\n\nConsulta precios directamente en nuestra tienda.`,
      });
    }

    // 📌 Caso 3: Categorías
    if (text.includes("categorías") || text.includes("categorias")) {
      const categories = await CategoryModel.find({ active: true }).limit(5);
      if (!categories.length) {
        return res.json({ reply: "No tenemos categorías activas en este momento." });
      }
      const catList = categories.map((c) => `- ${c.name}`).join("\n");
      return res.json({ reply: `Nuestras categorías populares son:\n${catList}` });
    }

    // 📌 Caso 4: Producto MÁS vendido
    if (
      text.includes("más vendido") ||
      text.includes("mas vendido") ||
      text.includes("más comprado") ||
      text.includes("mas comprado")
    ) {
      const topProduct = await ProductModel.findOne({ publish: true }).sort({ sales: -1 });
      if (!topProduct) {
        return res.json({ reply: "Aún no tenemos datos de ventas suficientes." });
      }
      return res.json({
        reply: `📈 El producto más vendido actualmente es: **${topProduct.name}**.`,
      });
    }

    // 📌 Caso 5: Productos MENOS vendidos
    if (
      text.includes("menos vendido") ||
      text.includes("no se venden") ||
      text.includes("menos comprado") ||
      text.includes("no se compran")
    ) {
      const lowProducts = await ProductModel.find({ publish: true })
        .sort({ sales: 1 })
        .limit(3);

      if (!lowProducts.length) {
        return res.json({ reply: "No tengo datos de ventas para determinar productos poco vendidos." });
      }

      const list = lowProducts.map((p) => `- ${p.name}`).join("\n");
      return res.json({
        reply: `📉 Estos son algunos productos con pocas ventas:\n${list}`,
      });
    }

    // 📌 Caso 6: Predicciones
    if (text.includes("predicción") || text.includes("prediccion") || text.includes("pronóstico")) {
      const topProducts = await ProductModel.find({ publish: true })
        .sort({ sales: -1 })
        .limit(5);

      if (!topProducts.length) {
        return res.json({ reply: "No tengo suficientes datos históricos para generar predicciones." });
      }

      const productList = topProducts.map((p) => `- ${p.name}`).join("\n");

      const aiPrediction = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres un analista de ventas en una tienda online. 
            Usa la lista de productos más vendidos para hacer un pronóstico simple y amigable.`,
          },
          {
            role: "user",
            content: `Los productos más vendidos hasta ahora son:\n${productList}.
            Por favor genera un pronóstico en ${language === "en" ? "English" : "Spanish"}.`,
          },
        ],
      });

      return res.json({ reply: aiPrediction.choices[0].message.content });
    }

    // 📌 Caso 7: Consulta general (IA)
    const categories = await CategoryModel.find({ active: true }).limit(10);
    const categoryNames = categories.map((c) => c.name).join(", ");

    const products = await ProductModel.find({ publish: true }).limit(10);
    const productNames = products.map((p) => p.name).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente para una tienda online. 
          Categorías: ${categoryNames}.
          Productos destacados: ${productNames}.
          Datos de la tienda:
          - Envíos: Lima, Arequipa, Cusco, Trujillo.
          - Pagos: tarjeta, transferencia, contra entrega.
          - Devoluciones: 7 días.
          - Contacto: WhatsApp 901670452, correo mutiserviciosavisai@gmail.com
          - Tienda física: Plaza de Huancán, Huancayo, Junín.
          - No des precios exactos, invita a consultar en tienda.
          Responde SIEMPRE en ${language === "en" ? "inglés" : "español"} de forma clara y profesional.`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error en chatbot:", error);
    res.status(500).json({ error: "Error en el chatbot" });
  }
});

export default router;
