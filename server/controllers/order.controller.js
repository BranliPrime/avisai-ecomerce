import Stripe from "../config/stripe.js"
import CartProductModel from "../models/cartProduct.model.js"
import OrderModel from "../models/order.model.js"
import UserModel from "../models/user.model.js"
import sendNotification from "../utils/sendNotification.js";

import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export async function CashOnDeliveryOrderController(req, res) {
  try {
    const userId = req.userId
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body
    const payload = list_items.map((el) => {
      return {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        withInstallation: el.withInstallation || false,
        paymentId: "",
        payment_status: "PAGO CONTRA ENTREGA",
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      }
    })
    const generatedOrder = await OrderModel.insertMany(payload)
    const io = req.app.get("io")
    io.to(userId.toString()).emit("new_order", generatedOrder)
    const removeCartItems = await CartProductModel.deleteMany({ userId: userId })
    const updateInUser = await UserModel.updateOne({ _id: userId }, { shopping_cart: [] })

    const user = await UserModel.findById(userId);
    if (user?.fcmToken) {
      await sendPushNotification({
        token: user.fcmToken,
        title: "🛒 Pedido creado",
        body: "Tu pedido con pago contra entrega fue registrado con éxito.",
        data: {
          orderId: generatedOrder[0]._id.toString(),
        },
      });
    }

    return res.json({
      message: "Pedido realizado con éxito.",
      error: false,
      success: true,
      data: generatedOrder,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
  const actualPrice = Number(price) - Number(discountAmout)
  return actualPrice
}

export async function paymentController(req, res) {
  try {
    const userId = req.userId
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body
    const user = await UserModel.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado", error: true, success: false })
    }

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: "pen",
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId._id,
              withInstallation: item.withInstallation ? "true" : "false"
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

    const session = await Stripe.checkout.sessions.create(params)
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
      const product = await Stripe.products.retrieve(item.price.product)
      const paylod = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images,
        },
        withInstallation: product.metadata.withInstallation === "true",
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

export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
        const order = await OrderModel.insertMany(orderProduct)
        const io = request.app.get("io") // 👈 recuerda que aquí tu parámetro es request, no req
        io.to(userId.toString()).emit("new_order", order)
        

        console.log(order)
        if (order?.length) {
          await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });
          await CartProductModel.deleteMany({ userId });

          // 🔔 Enviar notificación push
          const user = await UserModel.findById(userId);
          if (user?.fcmToken) {
            await sendPushNotification({
              token: user.fcmToken,
              title: "✅ Pago exitoso",
              body: "Tu pedido ha sido confirmado. Gracias por tu compra.",
              data: {
                orderId: order[0]._id.toString(),
              },
            });
          }
        }
        break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}

export async function getOrderDetailsController(req, res) {
  try {
    const userId = req.userId
    const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate("delivery_address")
    return res.json({
      message: "lista de pedidos.",
      data: orderlist,
      error: false,
      success: true,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    })
  }
}


export async function getSalesReportController(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const salesReport = await OrderModel.aggregate([
      { $match: filter },
      // Join con producto para obtener nombre, precio, etc.
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      // Join con usuario para obtener nombre y email
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      // Agrupamos por producto para saber cuánto se vendió de cada uno
      {
        $group: {
          _id: "$product._id",
          productName: { $first: "$product.name" },
          totalQuantity: { $sum: 1 },  // Si tienes cantidad en el pedido, sumar esa
          totalSales: { $sum: "$totalAmt" },
          customers: { $addToSet: "$user.name" }, // Clientes que compraron este producto
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } } // Ordena productos más vendidos primero
    ]);

    const totalSales = salesReport.reduce((acc, item) => acc + item.totalSales, 0);
    const totalOrders = salesReport.reduce((acc, item) => acc + item.totalOrders, 0);

    return res.json({
      message: "Reporte de ventas generado exitosamente.",
      totalSales,
      totalOrders,
      salesByProduct: salesReport,
      success: true,
      error: false
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al generar el reporte de ventas",
      success: false,
      error: true
    });
  }
}




export async function getCustomerOrdersController(req, res) {
  try {
    const { customerId } = req.params

    const orders = await OrderModel.find({ userId: customerId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email") 
      .populate("delivery_address") 
      .populate("productId", "name price") 

    return res.json({
      message: "Pedidos del cliente obtenidos exitosamente.",
      data: orders,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al obtener pedidos del cliente",
      success: false,
      error: true
    })
  }
}

export async function startInstallationController(req, res) {
  try {
    const { installationId } = req.body;

    if (!installationId) {
      return res.status(400).json({
        message: "Falta el ID de la instalación",
        success: false,
        error: true,
      });
    }

    const order = await OrderModel.findById(installationId);

    if (!order) {
      return res.status(404).json({
        message: "Orden no encontrada",
        success: false,
        error: true,
      });
    }

    // Actualiza el estado
    order.installation_status = "En curso";
    await order.save();

    return res.status(200).json({
      message: "Instalación iniciada correctamente.",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al iniciar la instalación",
      success: false,
      error: true,
    });
  }
}
export const finishInstallationController = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Falta el orderId" });
    }

    let order = null;

    // Buscar por _id si es válido como ObjectId
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await OrderModel.findById(orderId);
    }

    // Si no se encontró por _id, buscar por campo orderId
    if (!order) {
      order = await OrderModel.findOne({ orderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    if (order.installation_status !== "En curso") {
      return res.status(400).json({
        success: false,
        message: `No se puede finalizar. El estado actual es: ${order.installation_status}`,
      });
    }

    order.installation_status = "Completado";
    await order.save();

    req.io?.to(order.userId.toString()).emit("installation_update", {
      orderId: order._id.toString(),
      installation_status: "Completado",
    });

    return res.status(200).json({
      success: true,
      message: "Instalación finalizada correctamente",
      data: order,
    });
  } catch (error) {
    console.error("Error finalizando instalación:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};