"use client"

import { useEffect, useState } from "react"
import { useGlobalContext } from "../provider/GlobalProvider"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import toast from "react-hot-toast"
import AxiosToastError from "../utils/AxiosToastError"
import { useSelector } from "react-redux"
import { FaShoppingCart } from "react-icons/fa"
import InstallationModal from "./InstallationModal"

const AddToCartButton = ({ data, onInstallationChange, installationState }) => {
  const { fetchCartItem, updateCartItem, deleteCartItem, migrationInProgress } = useGlobalContext()
  const [loading, setLoading] = useState(false)
  const cartItem = useSelector((state) => state.cartItem.cart)
  const user = useSelector((state) => state.user)
  const [isAvailableCart, setIsAvailableCart] = useState(false)
  const [qty, setQty] = useState(0)
  const [cartItemDetails, setCartItemsDetails] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const availableStock = data?.stock || 0
  const isOutOfStock = availableStock <= 0

  const getLocalCart = () => {
    try {
      const localCart = localStorage.getItem("guestCart")
      return localCart ? JSON.parse(localCart) : []
    } catch (error) {
      console.error("Error reading local cart:", error)
      return []
    }
  }

  const updateLocalCart = (newCart) => {
    try {
      localStorage.setItem("guestCart", JSON.stringify(newCart))
      window.dispatchEvent(new CustomEvent("localCartUpdated", { detail: newCart }))
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    } catch (error) {
      console.error("Error updating local cart:", error)
    }
  }

  const addToLocalCart = (product) => {
    const localCart = getLocalCart()
    const existingItem = localCart.find((item) => item.productId === product._id)

    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        existingItem.quantity += 1
        existingItem.updatedAt = new Date().toISOString()
      } else {
        toast.error(`Solo quedan ${availableStock} unidades disponibles`)
        return null
      }
    } else {
      localCart.push({
        _id: `guest_${Date.now()}_${product._id}`,
        productId: product._id,
        productData: product,
        quantity: 1,
        withInstallation: product.withInstallation || false,
        addedAt: new Date().toISOString(),
      })
    }

    updateLocalCart(localCart)
    return localCart.find((item) => item.productId === product._id)
  }

  const updateLocalCartItem = (productId, newQuantity) => {
    const localCart = getLocalCart()
    const itemIndex = localCart.findIndex((item) => item.productId === productId)

    if (itemIndex !== -1) {
      if (newQuantity <= 0) {
        localCart.splice(itemIndex, 1)
      } else if (newQuantity <= availableStock) {
        localCart[itemIndex].quantity = newQuantity
        localCart[itemIndex].updatedAt = new Date().toISOString()
      } else {
        toast.error(`Solo quedan ${availableStock} unidades disponibles`)
        return { success: false }
      }
      updateLocalCart(localCart)
      return { success: true }
    }
    return { success: false }
  }

  const handleConfirmAdd = async (withInstallationValue) => {
    console.log("[v0] Confirmando instalación:", withInstallationValue)

    if (onInstallationChange) {
      onInstallationChange(withInstallationValue)
    }

    if (isOutOfStock) {
      toast.error("Producto agotado")
      return
    }

    try {
      setLoading(true)

      if (user?._id) {
        const response = await Axios({
          ...SummaryApi.addTocart,
          data: {
            productId: data?._id,
            withInstallation: withInstallationValue,
          },
        })

        const { data: responseData } = response
        if (responseData.success) {
          const message = withInstallationValue
            ? "Producto agregado con instalación profesional"
            : "Producto agregado al carrito"
          toast.success(message)

          if (fetchCartItem) {
            fetchCartItem()
          }
        }
      } else {
        const addedItem = addToLocalCart({
          ...data,
          withInstallation: withInstallationValue,
        })
        if (addedItem) {
          const message = withInstallationValue
            ? "Producto agregado con instalación profesional"
            : "Producto agregado al carrito"
          toast.success(message)
          setQty(addedItem.quantity)
          setIsAvailableCart(true)
          setCartItemsDetails(addedItem)
        }
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleADDTocart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (data.requiresInstallation) {
      setIsModalOpen(true)
      return
    }

    handleConfirmAdd(installationState || false)
  }

  useEffect(() => {
    if (user?._id) {
      const checkingitem = cartItem.some((item) => item?.productId?._id === data?._id)
      setIsAvailableCart(checkingitem)
      const product = cartItem.find((item) => item?.productId?._id === data?._id)
      setQty(product?.quantity || 0)
      setCartItemsDetails(product)
    } else {
      const localCart = getLocalCart()
      const product = localCart.find((item) => item.productId === data?._id)
      setIsAvailableCart(!!product)
      setQty(product?.quantity || 0)
      setCartItemsDetails(product)
    }
  }, [data, cartItem, user])

  const increaseQty = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (qty >= availableStock) {
      toast.error(`Solo quedan ${availableStock} unidades disponibles`)
      return
    }
    if (user?._id) {
      const response = await updateCartItem(cartItemDetails?._id, qty + 1)
      if (response.success) toast.success("Artículo agregado")
    } else {
      const response = updateLocalCartItem(data._id, qty + 1)
      if (response.success) setQty(qty + 1)
    }
  }

  const decreaseQty = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (user?._id) {
      if (qty === 1) {
        if (onInstallationChange) {
          onInstallationChange(false)
        }
        deleteCartItem(cartItemDetails?._id)
      } else {
        const response = await updateCartItem(cartItemDetails?._id, qty - 1)
        if (response.success) toast.success("Artículo eliminado")
      }
    } else {
      const newQty = qty - 1
      const response = updateLocalCartItem(data._id, newQty)
      if (response.success) {
        if (newQty === 0) {
          if (onInstallationChange) {
            onInstallationChange(false)
          }
          setIsAvailableCart(false)
          setQty(0)
          setCartItemsDetails(null)
        } else {
          setQty(newQty)
        }
      }
    }
  }

  const showLowStock = availableStock > 0 && availableStock <= 5

  if (migrationInProgress && user?._id) {
    return <div>Migrando...</div>
  }

  return (
    <div className="w-full max-w-[180px] relative">
      {showLowStock && !isAvailableCart && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md z-10 font-medium">
          Solo {availableStock}
        </div>
      )}

      {isAvailableCart ? (
        <div className="flex w-full h-10 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <button onClick={decreaseQty} className="flex-1">
            -
          </button>
          <div className="flex-1 text-center">{qty}</div>
          <button onClick={increaseQty} disabled={qty >= availableStock} className="flex-1">
            +
          </button>
        </div>
      ) : (
        <button
          onClick={handleADDTocart}
          disabled={loading || isOutOfStock}
          className={`w-full h-10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
          }`}
        >
          {loading ? (
            "..."
          ) : isOutOfStock ? (
            "Agotado"
          ) : (
            <>
              <FaShoppingCart size={14} />
              <span>Agregar</span>
            </>
          )}
        </button>
      )}

      <InstallationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={data?.name}
        currentSelection={installationState}
        onConfirm={handleConfirmAdd}
      />
    </div>
  )
}

export default AddToCartButton
