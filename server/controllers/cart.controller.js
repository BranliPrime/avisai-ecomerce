import CartProductModel from "../models/cartProduct.model.js";
import UserModel from "../models/user.model.js";

export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.userId
    const { productId } = req.body

    if (!productId) {
      return res.status(402).json({
        message: "Proporcionar productId",
        error: true,
        success: false
      })
    }

    const checkItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId
    })

    if (checkItemCart) {
      return res.status(400).json({
        message: "Artículo ya está en el carrito"
      })
    }

    const cartItem = new CartProductModel({
      quantity: 1,
      userId: userId,
      productId: productId
    })
    const save = await cartItem.save()

    const updateCartUser = await UserModel.updateOne({ _id: userId }, {
      $push: {
        shopping_cart: productId
      }
    })

    return res.json({
      data: save,
      message: "Artículo agregado con éxito",
      error: false,
      success: true
    })


  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


export const getCartItemController = async (req, res) => {
  try {
    const userId = req.userId

    const cartItem = await CartProductModel.find({
      userId: userId
    }).populate('productId')

    return res.json({
      data: cartItem,
      error: false,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId
    const { _id, qty } = req.body

    if (!_id || !qty) {
      return res.status(400).json({
        message: "Proporcionar _id y qty"
      })
    }

    const updateCartitem = await CartProductModel.updateOne({
      _id: _id,
      userId: userId
    }, {
      quantity: qty
    })

    return res.json({
      message: "Carrito actualizado",
      success: true,
      error: false,
      data: updateCartitem
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const deleteCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId // middleware
    const { _id } = req.body

    if (!_id) {
      return res.status(400).json({
        message: "Proporcionar _id",
        error: true,
        success: false
      })
    }

    const deleteCartItem = await CartProductModel.deleteOne({ _id: _id, userId: userId })

    return res.json({
      message: "Artículo eliminado del carrito",
      error: false,
      success: true,
      data: deleteCartItem
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}