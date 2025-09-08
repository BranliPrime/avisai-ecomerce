"use client"

import { useEffect, useState } from "react"
import { IoClose, IoWarningOutline } from "react-icons/io5"
import { Link, useNavigate } from "react-router-dom"
import { useGlobalContext } from "../provider/GlobalProvider"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"
import { FaCaretRight, FaTrash, FaShoppingCart } from "react-icons/fa"
import { useSelector } from "react-redux"
import AddToCartButton from "./AddToCartButton"
import { pricewithDiscount } from "../utils/PriceWithDiscount"
import imageEmpty from "../assets/empty_cart.webp"
import toast from "react-hot-toast"

const DisplayCartItem = ({ close }) => {
  const { notDiscountTotalPrice, totalPrice, totalQty, deleteCartItem } = useGlobalContext()
  const cartItem = useSelector((state) => state.cartItem.cart)
  const user = useSelector((state) => state.user)
  const navigate = useNavigate()

  const [localCart, setLocalCart] = useState([])
  const [localTotals, setLocalTotals] = useState({
    totalPrice: 0,
    notDiscountTotalPrice: 0,
    totalQty: 0,
  })

  const [clearingCart, setClearingCart] = useState(false)
  const [removingItems, setRemovingItems] = useState({})

  const getLocalCart = () => {
    try {
      const localCartData = localStorage.getItem("guestCart")
      return localCartData ? JSON.parse(localCartData) : []
    } catch (error) {
      console.error("Error reading local cart:", error)
      return []
    }
  }

  const calculateLocalTotals = (cart) => {
    let totalPrice = 0
    let notDiscountTotalPrice = 0
    let totalQty = 0

    cart.forEach((item) => {
      const product = item.productData
      const quantity = item.quantity
      const discountedPrice = pricewithDiscount(product.price, product.discount || 0)
      const originalPrice = product.price

      totalPrice += discountedPrice * quantity
      notDiscountTotalPrice += originalPrice * quantity
      totalQty += quantity
    })

    return { totalPrice, notDiscountTotalPrice, totalQty }
  }

  useEffect(() => {
    if (!user?._id) {
      const cart = getLocalCart()
      setLocalCart(cart)
      setLocalTotals(calculateLocalTotals(cart))
    }
  }, [user])

  useEffect(() => {
    const handleLocalCartUpdate = (event) => {
      if (!user?._id) {
        const updatedCart = event.detail || getLocalCart()
        setLocalCart(updatedCart)
        setLocalTotals(calculateLocalTotals(updatedCart))
      }
    }

    window.addEventListener("localCartUpdated", handleLocalCartUpdate)
    return () => window.removeEventListener("localCartUpdated", handleLocalCartUpdate)
  }, [user])

  const currentCart = user?._id ? cartItem : localCart
  const currentTotals = user?._id ? { totalPrice, notDiscountTotalPrice, totalQty } : localTotals

  // IGV ya incluido en el precio (no se suma aparte)
  const subtotalSinIGV = currentTotals.totalPrice / 1.18 // Precio sin IGV
  const IGV = currentTotals.totalPrice - subtotalSinIGV // IGV incluido
  const envio = 15
  const totalFinal = currentTotals.totalPrice + envio

  const savings = currentTotals.notDiscountTotalPrice - currentTotals.totalPrice

  // Verificar productos fuera de stock
  const outOfStockItems = currentCart.filter((item) => {
    const product = user?._id ? item?.productId : item?.productData
    return product?.stock === 0 || (product?.stock && item.quantity > product.stock)
  })

  const redirectToCheckoutPage = () => {
    if (user?._id) {
      navigate("/checkout")
      if (close) close()
    } else {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Inicia sesión para completar tu compra",
        },
      })
      if (close) close()
    }
  }

  const clearAllCart = async () => {
    setClearingCart(true)
    try {
      if (user?._id) {
        // Eliminar todos los productos sin mostrar toast individual
        const deletePromises = cartItem.map(
          (item) => deleteCartItem(item._id, true), // Pasar true para suprimir toast individual
        )
        await Promise.all(deletePromises)

        // Mostrar solo un mensaje consolidado
        toast.success(`Carrito vaciado (${cartItem.length} productos eliminados)`, {
          duration: 3000,
        })
      } else {
        const itemCount = localCart.length
        localStorage.removeItem("guestCart")
        setLocalCart([])
        setLocalTotals({ totalPrice: 0, notDiscountTotalPrice: 0, totalQty: 0 })
        window.dispatchEvent(new CustomEvent("localCartUpdated", { detail: [] }))
        window.dispatchEvent(new CustomEvent("cartUpdated"))

        // Mostrar solo un mensaje consolidado
        toast.success(`Carrito vaciado (${itemCount} productos eliminados)`, {
          duration: 3000,
          icon: "🗑️",
        })
      }
    } catch (error) {
      toast.error("Error al vaciar el carrito")
    } finally {
      setClearingCart(false)
    }
  }

  const removeItem = async (itemId, productName) => {
    setRemovingItems((prev) => ({ ...prev, [itemId]: true }))
    try {
      if (user?._id) {
        await deleteCartItem(itemId, true)
        toast.success(`${productName} eliminado del carrito`, {
          duration: 2000,
          icon: "🗑️",
        })
      } else {
        const localCart = getLocalCart()
        const updatedCart = localCart.filter((item) => item._id !== itemId)
        localStorage.setItem("guestCart", JSON.stringify(updatedCart))
        setLocalCart(updatedCart)
        setLocalTotals(calculateLocalTotals(updatedCart))
        window.dispatchEvent(new CustomEvent("localCartUpdated", { detail: updatedCart }))
        window.dispatchEvent(new CustomEvent("cartUpdated"))
        toast.success(`${productName} eliminado del carrito`, {
          duration: 2000,
          icon: "🗑️",
        })
      }
    } catch (error) {
      toast.error("Error al eliminar el producto")
    } finally {
      setRemovingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  return (
    <section className="bg-black bg-opacity-50 fixed top-0 bottom-0 right-0 left-0 z-50">
      <div className="bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <FaShoppingCart className="text-gray-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Carrito de Compras</h2>
              <p className="text-sm text-gray-500">
                {currentTotals.totalQty} {currentTotals.totalQty === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
          <button onClick={close} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <IoClose size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {currentCart.length > 0 ? (
            <>
              {/* Alertas */}
              <div className="p-4 space-y-3 bg-gray-50">
                {/* Productos fuera de stock */}
                {outOfStockItems.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <IoWarningOutline className="text-orange-600" size={18} />
                      <div>
                        <p className="text-orange-800 font-medium text-sm">
                          {outOfStockItems.length} productos sin stock
                        </p>
                        <p className="text-orange-600 text-xs">Puedes continuar con la compra</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ahorros totales */}
                {savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium text-sm">Tus ahorros totales</span>
                      <span className="text-green-700 font-bold">{DisplayPriceInSoles(savings)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de productos */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {currentCart.map((item) => {
                    const product = user?._id ? item?.productId : item?.productData
                    const isOutOfStock = product?.stock === 0
                    const exceedsStock = product?.stock && item.quantity > product.stock

                    return (
                      <div
                        key={item._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product?.image?.[0] || "/placeholder.svg"}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{product?.name}</h3>
                            <p className="text-gray-500 text-xs mb-2">{product?.unit || "100 g"}</p>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                {DisplayPriceInSoles(pricewithDiscount(product?.price, product?.discount || 0))}
                              </span>
                              {product?.discount > 0 && (
                                <>
                                  <span className="text-gray-400 line-through text-sm">
                                    {DisplayPriceInSoles(product?.price)}
                                  </span>
                                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                                    -{product?.discount}%
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Indicadores de stock */}
                            {isOutOfStock && (
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                Sin stock
                              </span>
                            )}
                            {exceedsStock && (
                              <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                                Solo {product.stock} disponibles
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-end justify-between gap-2">
                            <AddToCartButton data={product} />
                            <button
                              onClick={() => removeItem(item._id, product?.name)}
                              disabled={removingItems[item._id]}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {removingItems[item._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <FaTrash size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer con totales */}
              <div className="bg-white border-t border-gray-200 p-4 space-y-4">
                {/* Botón limpiar carrito */}
                <button
                  onClick={clearAllCart}
                  disabled={clearingCart}
                  className="w-full text-red-600 border border-red-200 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {clearingCart ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                      Vaciando...
                    </div>
                  ) : (
                    "Limpiar todo el carrito"
                  )}
                </button>

                {/* Resumen de totales */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({currentTotals.totalQty} productos)</span>
                    <span className="font-medium text-gray-900">{DisplayPriceInSoles(subtotalSinIGV)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGV (18% incluido)</span>
                    <span className="font-medium text-gray-900">{DisplayPriceInSoles(IGV)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium text-gray-900">{DisplayPriceInSoles(envio)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{DisplayPriceInSoles(totalFinal)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">*Los precios ya incluyen IGV</p>
                </div>

                {/* Botón de checkout */}
                <button
                  onClick={redirectToCheckoutPage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="text-sm opacity-90">
                      {user?._id ? "Proceder al pago" : "Iniciar sesión para continuar"}
                    </div>
                    <div className="font-bold">{DisplayPriceInSoles(totalFinal)}</div>
                  </div>
                  <FaCaretRight />
                </button>

                {!user?._id && (
                  <p className="text-center text-xs text-gray-500">Tus productos se guardarán al iniciar sesión</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8">
              <img
                src={imageEmpty || "/placeholder.svg"}
                className="w-32 h-32 object-contain mx-auto mb-4 opacity-50"
                alt="Carrito vacío"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-6 text-center">Descubre nuestros productos y comienza a comprar</p>
              <Link
                onClick={close}
                to={"/"}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Explorar productos
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DisplayCartItem
