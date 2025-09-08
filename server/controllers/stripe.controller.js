import Stripe from "stripe"
import dotenv from "dotenv"
import CartProductModel from "../models/cartProduct.model.js" // Asegúrate de que la ruta sea correcta
import OrderModel from "../models/order.model.js" // Asegúrate de que la ruta sea correcta
import UserModel from "../models/user.model.js" // Asegúrate de que la ruta sea correcta
import mongoose from "mongoose" // Necesario para mongoose.Types.ObjectId

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Función auxiliar para calcular precio con descuento (si no la tienes en otro lugar)
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
  const actualPrice = Number(price) - Number(discountAmout)
  return actualPrice
}

export async function paymentController(req, res) {
  try {
    const userId = req.userId // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body
    const user = await UserModel.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado", error: true, success: false })
    }

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: "pen", // Asegúrate de que la moneda sea correcta
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId._id,
            },
          },
          unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      }
    })

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success?locale=es`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel?locale=es`,
      locale: "es",
    }

    const session = await stripe.checkout.sessions.create(params)
    return res.status(200).json(session)
  } catch (error) {
    console.error("Error en paymentController:", error)
    return res.status(500).json({
      message: error.message || "Error al procesar el pago con Stripe",
      error: true,
      success: false,
    })
  }
}

const getOrderProductItems = async ({ lineItems, userId, addressId, paymentId, payment_status }) => {
  const productList = []
  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const productInfo = await stripe.products.retrieve(item.price.product)
      const paylod = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: productInfo.metadata.productId,
        product_details: {
          name: productInfo.name,
          image: productInfo.images,
        },
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      }
      productList.push(paylod)
    }
  }
  return productList
}

export async function webhookStripe(req, res) {
  const sig = req.headers["stripe-signature"]
  const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

  let event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endPointSecret)
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}. Signature: ${sig}. Raw Body Length: ${req.rawBody?.length}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`✅ Evento de Stripe recibido: ${event.type}`)

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object
      console.log(`🛒 Checkout Session Completed: ${session.id}`)
      console.log(`Metadata de la sesión:`, session.metadata)

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        const userId = session.metadata.userId
        const addressId = session.metadata.addressId

        console.log(`🔍 Procesando para userId: ${userId}, addressId: ${addressId}`)

        if (!userId) {
          console.error("❌ Error: userId no encontrado en la metadata de la sesión de Stripe.")
          return res.status(400).send("userId missing in metadata")
        }

        const orderProduct = await getOrderProductItems({
          lineItems: lineItems,
          userId: userId,
          addressId: addressId,
          paymentId: session.payment_intent,
          payment_status: session.payment_status,
        })

        console.log("📦 Items de la orden a insertar:", orderProduct.length, "productos")
        const order = await OrderModel.insertMany(orderProduct)
        console.log(
          "✅ Orden(es) creada(s) en DB:",
          order.map((o) => o._id),
        )

        if (order.length > 0) {
          console.log(`🧹 Iniciando limpieza de carrito para usuario: ${userId}`)

          const userUpdateResult = await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] }, { new: true })
          console.log(
            "✅ Carrito de usuario en UserModel actualizado. Nuevo shopping_cart:",
            userUpdateResult?.shopping_cart,
          )

          const cartDeleteResult = await CartProductModel.deleteMany({ userId: userId })
          console.log("✅ Productos del carrito en CartProductModel eliminados. Conteo:", cartDeleteResult.deletedCount)

          if (userUpdateResult && cartDeleteResult.deletedCount >= 0) {
            console.log(`🎉 Carrito vaciado exitosamente para el usuario: ${userId}`)
          } else {
            console.log(`⚠️ Advertencia: La limpieza del carrito para ${userId} pudo no ser completa.`)
          }
        } else {
          console.log("⚠️ No se crearon órdenes, no se vació el carrito.")
        }
      } catch (error) {
        console.error("❌ Error procesando checkout.session.completed:", error)
      }
      break
    default:
      console.log(`ℹ️ Tipo de evento no manejado: ${event.type}`)
  }

  res.json({ received: true })
}
