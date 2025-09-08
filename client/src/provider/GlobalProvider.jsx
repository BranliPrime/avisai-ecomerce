"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import { useDispatch, useSelector } from "react-redux"
import { handleAddItemCart } from "../store/cartProduct"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { pricewithDiscount } from "../utils/PriceWithDiscount"
import { handleAddAddress } from "../store/addressSlice"
import { setOrder } from "../store/orderSlice"

export const GlobalContext = createContext(null)
export const useGlobalContext = () => useContext(GlobalContext)

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch()
  const [totalPrice, setTotalPrice] = useState(0)
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0)
  const [totalQty, setTotalQty] = useState(0)
  const [migrationInProgress, setMigrationInProgress] = useState(false)

  const cartItem = useSelector((state) => state.cartItem.cart)
  const user = useSelector((state) => state?.user)

  const fetchCartItem = async () => {
    try {
      console.log("🔄 GlobalProvider: Iniciando fetchCartItem...")
      const response = await Axios({
        ...SummaryApi.getCartItem,
      })
      const { data: responseData } = response
      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data))
        console.log("✅ GlobalProvider: Carrito del usuario cargado:", responseData.data.length, "productos")
      } else {
        console.log("❌ GlobalProvider: Error al cargar carrito:", responseData.message)
      }
    } catch (error) {
      console.error("❌ GlobalProvider: Error fetching cart:", error)
    }
  }

  const updateCartItem = async (id, qty) => {
    try {
      console.log(`🔄 GlobalProvider: Actualizando item ${id} a cantidad ${qty}`)
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: id,
          qty: qty,
        },
      })
      const { data: responseData } = response
      if (responseData.success) {
        fetchCartItem()
        console.log(`✅ GlobalProvider: Item ${id} actualizado.`)
        return responseData
      } else {
        console.log(`❌ GlobalProvider: Fallo al actualizar item ${id}:`, responseData.message)
      }
    } catch (error) {
      AxiosToastError(error)
      console.error(`❌ GlobalProvider: Error al actualizar item ${id}:`, error)
      return error
    }
  }

  const deleteCartItem = async (cartId, suppressToast = false) => {
    try {
      console.log(`🔄 GlobalProvider: Eliminando item ${cartId}. Suppress Toast: ${suppressToast}`)
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId,
        },
      })
      const { data: responseData } = response
      if (responseData.success) {
        if (!suppressToast) {
          toast.success(responseData.message)
        }
        fetchCartItem()
        console.log(`✅ GlobalProvider: Item ${cartId} eliminado.`)
      } else {
        console.log(`❌ GlobalProvider: Fallo al eliminar item ${cartId}:`, responseData.message)
      }
    } catch (error) {
      if (!suppressToast) {
        AxiosToastError(error)
      }
      console.error(`❌ GlobalProvider: Error al eliminar item ${cartId}:`, error)
    }
  }

  const clearUserCart = async () => {
    try {
      console.log("🧹 GlobalProvider: Iniciando limpieza completa del carrito del usuario en el servidor...")

      const currentCart = cartItem || []

      if (currentCart.length === 0) {
        console.log("✅ GlobalProvider: Carrito ya está vacío, no se necesita limpieza.")
        return
      }

      const deletePromises = currentCart.map((item) =>
        Axios({
          ...SummaryApi.deleteCartItem,
          data: { _id: item._id },
        }),
      )

      await Promise.all(deletePromises)

      dispatch(handleAddItemCart([])) // Limpiar Redux inmediatamente
      console.log("✅ GlobalProvider: Estado de Redux del carrito limpiado.")

      console.log("✅ GlobalProvider: Carrito del usuario limpiado completamente en el servidor.")
    } catch (error) {
      console.error("❌ GlobalProvider: Error limpiando carrito del usuario:", error)
    }
  }

  const migrateGuestCartToUser = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")

      if (guestCart.length === 0) {
        console.log("📦 GlobalProvider: No hay productos en el carrito de invitado para migrar")
        return
      }

      console.log("🔄 GlobalProvider: Iniciando migración de carrito:", guestCart.length, "productos")
      setMigrationInProgress(true)

      await clearUserCart()
      await new Promise((resolve) => setTimeout(resolve, 500))

      let successCount = 0
      let errorCount = 0

      for (const item of guestCart) {
        try {
          console.log(`🔄 GlobalProvider: Migrando producto: ${item.productData?.name} (Cantidad: ${item.quantity})`)

          const response = await Axios({
            ...SummaryApi.addTocart,
            data: {
              productId: item.productId,
              quantity: item.quantity || 1,
            },
          })

          if (response.data.success) {
            successCount++
            console.log(`✅ GlobalProvider: Producto ${item.productData?.name} migrado exitosamente`)
          } else {
            errorCount++
            console.log(`❌ GlobalProvider: Error en respuesta para ${item.productData?.name}:`, response.data)
          }
        } catch (error) {
          errorCount++
          console.error(`❌ GlobalProvider: Error migrando producto ${item.productData?.name}:`, error)
        }
      }

      if (successCount > 0) {
        localStorage.removeItem("guestCart")
        console.log("🧹 GlobalProvider: Carrito de invitado limpiado después de migración exitosa")

        await fetchCartItem()

        window.dispatchEvent(new CustomEvent("localCartUpdated", { detail: [] }))
        window.dispatchEvent(new CustomEvent("cartUpdated"))
        window.dispatchEvent(new CustomEvent("migrationCompleted"))

        toast.success(`¡Bienvenido! ${successCount} productos migrados a tu carrito`, {
          duration: 4000,
          icon: "🛒",
        })

        console.log(
          `✅ GlobalProvider: Migración completada: ${successCount} productos exitosos, ${errorCount} errores`,
        )
      } else {
        console.log("❌ GlobalProvider: No se pudo migrar ningún producto")
        toast.error("No se pudieron migrar los productos del carrito")
      }

      if (errorCount > 0 && successCount > 0) {
        toast.error(`${errorCount} productos no pudieron ser migrados`)
      }

      setMigrationInProgress(false)
    } catch (error) {
      console.error("❌ GlobalProvider: Error en migración de carrito:", error)
      toast.error("Error al migrar el carrito de invitado")
      setMigrationInProgress(false)
    }
  }

  useEffect(() => {
    const qty = cartItem.reduce((preve, curr) => {
      return preve + curr.quantity
    }, 0)
    setTotalQty(qty)

    const tPrice = cartItem.reduce((preve, curr) => {
      const priceAfterDiscount = pricewithDiscount(curr?.productId?.price, curr?.productId?.discount)
      return preve + priceAfterDiscount * curr.quantity
    }, 0)
    setTotalPrice(tPrice)

    const notDiscountPrice = cartItem.reduce((preve, curr) => {
      return preve + curr?.productId?.price * curr.quantity
    }, 0)
    setNotDiscountTotalPrice(notDiscountPrice)
    console.log(`📊 GlobalProvider: Totales actualizados. Cantidad: ${qty}, Precio Total: ${tPrice}`)
  }, [cartItem])

  const handleLogoutOut = () => {
    console.log("🔒 GlobalProvider: Ejecutando logout...")

    const guestCart = localStorage.getItem("guestCart")
    const guestWishlist = localStorage.getItem("guestWishlist")

    localStorage.clear()

    if (guestCart) {
      localStorage.setItem("guestCart", guestCart)
      console.log("🔒 GlobalProvider: Carrito de invitado preservado durante logout")
    }

    if (guestWishlist) {
      localStorage.setItem("guestWishlist", guestWishlist)
      console.log("🔒 GlobalProvider: Wishlist de invitado preservado durante logout")
    }

    dispatch(handleAddItemCart([]))
    console.log("🔒 GlobalProvider: Estado del usuario y carrito de Redux limpiado.")
  }

  const fetchAddress = async () => {
    try {
      console.log("🔄 GlobalProvider: Iniciando fetchAddress...")
      const response = await Axios({
        ...SummaryApi.getAddress,
      })
      const { data: responseData } = response
      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data))
        console.log("✅ GlobalProvider: Direcciones cargadas:", responseData.data.length)
      }
    } catch (error) {
      console.error("❌ GlobalProvider: Error fetching addresses:", error)
    }
  }

  const fetchOrder = async () => {
    try {
      console.log("🔄 GlobalProvider: Iniciando fetchOrder...")
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      })
      const { data: responseData } = response
      if (responseData.success) {
        dispatch(setOrder(responseData.data))
        console.log("✅ GlobalProvider: Órdenes cargadas:", responseData.data.length, "órdenes")
      } else {
        console.log("❌ GlobalProvider: Error al cargar órdenes:", responseData.message)
      }
    } catch (error) {
      console.error("❌ GlobalProvider: Error fetching orders:", error)
    }
  }

  useEffect(() => {
    if (user?._id) {
      console.log("👤 GlobalProvider: Usuario logueado detectado:", user.name || user.email)

      fetchCartItem().then(() => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
        if (guestCart.length > 0 && !migrationInProgress) {
          console.log("📦 GlobalProvider: Carrito de invitado encontrado, iniciando migración...")
          setTimeout(() => {
            migrateGuestCartToUser()
          }, 1000)
        }
      })

      fetchAddress()
      fetchOrder()
    } else {
      console.log("👤 GlobalProvider: Usuario no logueado. Limpiando carrito de Redux.")
      dispatch(handleAddItemCart([]))
    }
  }, [user?._id])

  return (
    <GlobalContext.Provider
      value={{
        fetchCartItem,
        updateCartItem,
        deleteCartItem,
        fetchAddress,
        totalPrice,
        totalQty,
        notDiscountTotalPrice,
        fetchOrder,
        migrateGuestCartToUser,
        migrationInProgress,
        clearUserCart,
        handleLogoutOut,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default GlobalProvider
