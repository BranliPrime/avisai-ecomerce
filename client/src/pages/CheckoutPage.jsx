"use client"

import { useState, useEffect, useMemo } from "react"
import { useGlobalContext } from "../provider/GlobalProvider"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"
import AddAddress from "../components/AddAddress"
import { useSelector } from "react-redux"
import AxiosToastError from "../utils/AxiosToastError"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { sunatService } from "../utils/sunatService"
import { nubefactService } from "../utils/nubefactService"
import { validationUtils } from "../utils/validationUtils"
import AddToCartButton from "../components/AddToCartButton"
import { MdDelete, MdEdit } from "react-icons/md"
import { IoClose } from "react-icons/io5"
import { pricewithDiscount } from "../utils/PriceWithDiscount"
import EditAddressDetails from "../components/EditAddressDetails"

const CheckoutPage = () => {
  const { totalPrice, fetchCartItem, fetchOrder, fetchAddress, totalQty, clearUserCart } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector((state) => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector((state) => state.cartItem.cart)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    tipoDocumento: "1",
    numeroDocumento: "",
    razonSocial: "",
    direccionFiscal: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState({ validating: false, processing: false })
  const [currentStep, setCurrentStep] = useState(1)
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({})
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Cálculos memoizados
  const calculations = useMemo(() => {
    const subtotalSinIGV = +(totalPrice / 1.18).toFixed(2)
    const igv = +(totalPrice - subtotalSinIGV).toFixed(2)
    const envio = 15
    const totalFinal = +(totalPrice + envio).toFixed(2)
    const totalAhorros = cartItemsList.reduce((total, item) => {
      const precioOriginal = item?.productId?.price || 0
      const descuento = item?.productId?.discount || 0
      const ahorro = ((precioOriginal * descuento) / 100) * item.quantity
      return total + ahorro
    }, 0)

    return { subtotalSinIGV, igv, envio, totalFinal, totalAhorros }
  }, [totalPrice, cartItemsList])

  // Configuración de pasos
  const steps = useMemo(
    () => [
      {
        number: 1,
        title: "Dirección",
        completed: selectAddress !== null && addressList[selectAddress]?.status,
      },
      {
        number: 2,
        title: "Facturación",
        completed: formData.numeroDocumento && formData.razonSocial,
      },
      {
        number: 3,
        title: "Pago",
        completed: false,
      },
    ],
    [selectAddress, addressList, formData],
  )

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Prevenir redirección si carrito vacío
  useEffect(() => {
    const stripePaymentStarted = localStorage.getItem("stripe_payment_started") === "true"
    if (!isInitialLoad && cartItemsList.length === 0 && !stripePaymentStarted) {
      toast.error("Tu carrito está vacío")
      navigate("/")
    }
  }, [cartItemsList, navigate, isInitialLoad])

  // Manejo de regreso de Stripe
  useEffect(() => {
    const stripePaymentStarted = localStorage.getItem("stripe_payment_started")
    if (stripePaymentStarted === "true") {
      localStorage.removeItem("stripe_payment_started")
      const handleStripeReturn = async () => {
        try {
          await clearUserCart()
          await fetchCartItem()
          await fetchOrder()
          toast.success("Proceso de pago completado. Revisa tus órdenes y carrito.")
        } catch (error) {
          console.error("Error durante el procesamiento de regreso de Stripe:", error)
          toast.error("Hubo un problema al finalizar el proceso de pago.")
        }
      }
      handleStripeReturn()
    }
  }, [])

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validateForm = () => {
    const validation = validationUtils.validarDatosFacturacion(formData)
    setErrors(validation.errores)
    if (!validation.valido) {
      toast.error("Completa todos los campos requeridos")
    }
    return validation.valido
  }

  const consultarSunat = async () => {
    const validation = sunatService.validarFormato(formData.tipoDocumento, formData.numeroDocumento)
    if (!validation.valido) {
      toast.error(validation.mensaje)
      return
    }

    setLoading((prev) => ({ ...prev, validating: true }))
    try {
      const resultado =
        formData.tipoDocumento === "1"
          ? await sunatService.consultarDNI(formData.numeroDocumento)
          : await sunatService.consultarRUC(formData.numeroDocumento)

      if (resultado.success) {
        if (formData.tipoDocumento === "1") {
          updateFormData("razonSocial", resultado.data.nombreCompleto)
        } else {
          updateFormData("razonSocial", resultado.data.razonSocial)
          updateFormData("direccionFiscal", resultado.data.direccion)
        }
        toast.success("Documento validado correctamente")
      } else {
        toast.error(resultado.error)
      }
    } catch (error) {
      toast.error("Error al consultar el documento")
    } finally {
      setLoading((prev) => ({ ...prev, validating: false }))
    }
  }

  const processPayment = async (paymentType) => {
    if (!validationUtils.validarCarrito(cartItemsList) || !validateForm()) return

    setLoading((prev) => ({ ...prev, processing: true }))
    try {
      const orderData = {
        list_items: cartItemsList,
        addressId: addressList[selectAddress]?._id,
        subTotalAmt: totalPrice,
        totalAmt: calculations.totalFinal,
      }

      if (paymentType === "cash") {
        const response = await Axios({ ...SummaryApi.CashOnDeliveryOrder, data: orderData })
        if (response.data.success) {
          await nubefactService.emitirComprobante(formData, nubefactService.prepararItems(cartItemsList), Axios)
          toast.success("¡Orden registrada exitosamente!")
          clearUserCart()
          fetchCartItem()
          fetchOrder()
          navigate("/success", { state: { text: "Orden" } })
        }
      } else {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
        const response = await Axios({ ...SummaryApi.payment_url, data: orderData })
        await nubefactService.emitirComprobante(formData, nubefactService.prepararItems(cartItemsList), Axios)
        localStorage.setItem("stripe_payment_started", "true")
        await stripe.redirectToCheckout({ sessionId: response.data.id })
      }
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setLoading((prev) => ({ ...prev, processing: false }))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data: { _id: deleteId },
      })
      if (response.data.success) {
        toast.success("Dirección eliminada correctamente")
        fetchAddress()
        setOpenDelete(false)
        setDeleteId(null)
        if (addressList[selectAddress]?._id === deleteId) {
          setSelectAddress(0)
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  // Componente de paso
  const StepHeader = ({ step, index, isActive, onClick }) => (
    <div
      className={`px-4 sm:px-6 py-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isActive ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
              step.completed
                ? "bg-green-600 text-white"
                : isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {step.completed ? "✓" : step.number}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{step.title}</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {index === 0 && `${addressList.filter((addr) => addr.status).length} direcciones disponibles`}
              {index === 1 && "Información para tu comprobante electrónico"}
              {index === 2 && "Selecciona tu método de pago"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo con pasos */}
      <div className="bg-white border-b border-gray-200  z-50 shadow-sm">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 sm:space-x-8 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.completed
                          ? "bg-green-600 text-white"
                          : currentStep === step.number
                            ? "bg-green-100 text-green-600 border-2 border-green-600"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? "✓" : step.number}
                    </div>
                    <span
                      className={`ml-2 sm:ml-3 text-sm sm:text-base font-semibold whitespace-nowrap ${
                        step.completed || currentStep === step.number ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-1 mx-3 sm:mx-6 rounded ${
                        step.completed ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Paso 1: Dirección */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <StepHeader step={steps[0]} index={0} isActive={currentStep === 1} onClick={() => setCurrentStep(1)} />

              {currentStep === 1 && (
                <div className="p-4 sm:p-6">
                  <div className="space-y-6">
                    {addressList.filter((addr) => addr.status).length > 0 ? (
                      <>
                        <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
                          {addressList
                            .filter((address) => address.status)
                            .map((address) => {
                              const actualIndex = addressList.findIndex((addr) => addr._id === address._id)
                              return (
                                <div
                                  key={address._id}
                                  className={`border-2 rounded-xl p-4 sm:p-5 transition-all hover:shadow-md cursor-pointer ${
                                    selectAddress === actualIndex
                                      ? "border-green-500 bg-green-50 shadow-sm"
                                      : "border-gray-200 hover:border-green-300"
                                  }`}
                                  onClick={() => setSelectAddress(actualIndex)}
                                >
                                  <div className="flex items-start gap-3 sm:gap-4">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="radio"
                                        name="address"
                                        className="mt-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                        value={actualIndex}
                                        onChange={() => setSelectAddress(actualIndex)}
                                        checked={selectAddress === actualIndex}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                                            {address.address_line}
                                          </p>
                                          <p className="text-gray-600 text-sm mb-1">
                                            {address.city}, {address.state}
                                          </p>
                                          <p className="text-gray-500 text-sm mb-2">📍 {address.pincode}</p>
                                          <p className="text-sm text-gray-500 flex items-center gap-1">
                                            📞 {address.mobile}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {selectAddress === actualIndex && (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                              <span className="text-xs font-medium">✓ Seleccionada</span>
                                            </div>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setOpenEdit(true)
                                              setEditData(address)
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar dirección"
                                          >
                                            <MdEdit size={16} />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setDeleteId(address._id)
                                              setOpenDelete(true)
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar dirección"
                                          >
                                            <MdDelete size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                        <button
                          onClick={() => setOpenAddress(true)}
                          className="w-full py-4 border-2 border-dashed border-green-300 text-green-600 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">+</span>
                          Agregar nueva dirección
                        </button>
                        {selectAddress !== null && addressList[selectAddress]?.status && (
                          <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setCurrentStep(2)}
                              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                              Continuar a Facturación →
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 mb-4">No tienes direcciones guardadas</p>
                        <button
                          onClick={() => setOpenAddress(true)}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                          Agregar tu primera dirección
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep !== 1 && steps[0].completed && (
                <div className="px-4 sm:px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-600">Dirección:</span>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {addressList[selectAddress]?.address_line}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                        <span>
                          📍 {addressList[selectAddress]?.city}, {addressList[selectAddress]?.state}
                        </span>
                        <span>📞 {addressList[selectAddress]?.mobile}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm sm:text-base whitespace-nowrap"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Paso 2: Facturación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <StepHeader
                step={steps[1]}
                index={1}
                isActive={currentStep === 2}
                onClick={() => steps[0].completed && setCurrentStep(2)}
              />

              {currentStep === 2 && (
                <div className="p-4 sm:p-6">
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Documento</label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => {
                          setFormData({
                            tipoDocumento: e.target.value,
                            numeroDocumento: "",
                            razonSocial: "",
                            direccionFiscal: "",
                          })
                          setErrors({})
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      >
                        <option value="1">🆔 DNI - Persona Natural</option>
                        <option value="6">🏢 RUC - Empresa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {formData.tipoDocumento === "1" ? "Número de DNI" : "Número de RUC"}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder={
                            formData.tipoDocumento === "1"
                              ? "Ingresa tu DNI (8 dígitos)"
                              : "Ingresa tu RUC (11 dígitos)"
                          }
                          className={`flex-1 border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                            errors.numeroDocumento ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                          value={formData.numeroDocumento}
                          maxLength={formData.tipoDocumento === "1" ? 8 : 11}
                          onChange={(e) => updateFormData("numeroDocumento", e.target.value.replace(/\D/g, ""))}
                        />
                        <button
                          onClick={consultarSunat}
                          disabled={loading.validating || !formData.numeroDocumento}
                          className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
                        >
                          {loading.validating ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span className="hidden sm:inline">Validando...</span>
                            </div>
                          ) : (
                            "Validar"
                          )}
                        </button>
                      </div>
                      {errors.numeroDocumento && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">⚠️ {errors.numeroDocumento}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {formData.tipoDocumento === "1" ? "Nombre Completo" : "Razón Social"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          formData.tipoDocumento === "1" ? "Tu nombre completo" : "Razón social de la empresa"
                        }
                        className={`w-full border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.razonSocial ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        value={formData.razonSocial}
                        onChange={(e) => updateFormData("razonSocial", e.target.value)}
                      />
                      {errors.razonSocial && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">⚠️ {errors.razonSocial}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Dirección Fiscal</label>
                      <input
                        type="text"
                        placeholder="Dirección fiscal completa"
                        className={`w-full border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.direccionFiscal ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        value={formData.direccionFiscal}
                        onChange={(e) => updateFormData("direccionFiscal", e.target.value)}
                      />
                      {errors.direccionFiscal && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">⚠️ {errors.direccionFiscal}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-gray-600 hover:text-gray-800 font-medium order-2 sm:order-1"
                      >
                        ← Volver a Dirección
                      </button>
                      <button
                        onClick={() => {
                          if (validateForm()) {
                            setCurrentStep(3)
                          }
                        }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors order-1 sm:order-2"
                      >
                        Continuar al Pago →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep !== 2 && steps[1].completed && (
                <div className="px-4 sm:px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          {formData.tipoDocumento === "1" ? "Nombre:" : "Razón Social:"}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{formData.razonSocial}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.tipoDocumento === "1" ? "DNI" : "RUC"}: {formData.numeroDocumento}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm sm:text-base whitespace-nowrap"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen del pedido - Sticky */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <h2 className="text-lg sm:text-xl font-bold">Resumen del Pedido</h2>
                  <p className="text-green-100">
                    {totalQty} {totalQty === 1 ? "producto" : "productos"}
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {cartItemsList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg border flex-shrink-0 overflow-hidden">
                          <img
                            src={item?.productId?.image?.[0] || "/placeholder.svg"}
                            alt={item?.productId?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1">
                            {item?.productId?.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">Cantidad: {item.quantity}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-green-600 text-sm">
                              {DisplayPriceInSoles(
                                pricewithDiscount(item?.productId?.price, item?.productId?.discount || 0) *
                                  item.quantity,
                              )}
                            </span>
                            {item?.productId?.discount > 0 && (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  {DisplayPriceInSoles(item?.productId?.price * item.quantity)}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  -{item?.productId?.discount}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <AddToCartButton data={item?.productId} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {calculations.totalAhorros > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 text-xl">🎉</span>
                        <div>
                          <p className="font-bold text-green-800 text-sm sm:text-base">¡Excelente elección!</p>
                          <p className="text-green-700 text-xs sm:text-sm">
                            Estás ahorrando {DisplayPriceInSoles(calculations.totalAhorros)} en tu compra
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalQty} productos)</span>
                      <span className="font-semibold">{DisplayPriceInSoles(calculations.subtotalSinIGV)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGV (18% incluido)</span>
                      <span className="font-semibold">{DisplayPriceInSoles(calculations.igv)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-semibold text-green-600">
                        {calculations.envio === 0 ? "GRATIS" : DisplayPriceInSoles(calculations.envio)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">Total a Pagar</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          {DisplayPriceInSoles(calculations.totalFinal)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">*Precios incluyen IGV</p>
                    </div>
                  </div>

                  {currentStep === 3 && (
                    <div className="mt-8 space-y-4">
                      <button
                        onClick={() => processPayment("online")}
                        disabled={loading.processing}
                        className="w-full bg-green-600 text-white py-4 sm:py-5 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        {loading.processing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent"></div>
                            <span className="text-sm sm:text-base">Procesando Pago...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span>💳 Pagar en línea - {DisplayPriceInSoles(calculations.totalFinal)}</span>
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => processPayment("cash")}
                        disabled={loading.processing}
                        className="w-full border-2 border-green-600 text-green-600 py-4 sm:py-5 rounded-xl hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg transition-all"
                      >
                        {loading.processing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-green-600 border-t-transparent"></div>
                            <span className="text-sm sm:text-base">Procesando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span>🚚 Pagar Contra Entrega</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {openEdit && <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />}

      {openDelete && (
        <section className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 p-4 flex justify-center items-center">
          <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-bold text-lg text-gray-900">Eliminar Dirección</h3>
              <button
                onClick={() => setOpenDelete(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">¿Estás seguro de eliminar esta dirección?</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-sm">{addressList.find((addr) => addr._id === deleteId)?.address_line}</p>
                <p className="text-gray-600 text-sm">
                  {addressList.find((addr) => addr._id === deleteId)?.city},{" "}
                  {addressList.find((addr) => addr._id === deleteId)?.state}
                </p>
              </div>
              <p className="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOpenDelete(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </section>
      )}

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </div>
  )
}

export default CheckoutPage
