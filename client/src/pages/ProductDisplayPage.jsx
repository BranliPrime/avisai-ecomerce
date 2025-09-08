"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import SummaryApi from "../common/SummaryApi"
import Axios from "../utils/Axios"
import AxiosToastError from "../utils/AxiosToastError"
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"
import Divider from "../components/Divider"
import image1 from "../assets/minute_delivery.png"
import image2 from "../assets/Best_Prices_Offers.png"
import image3 from "../assets/Wide_Assortment.png"
import { pricewithDiscount } from "../utils/PriceWithDiscount"
import AddToCartButton from "../components/AddToCartButton"
import { toast } from "react-toastify"

const ProductDisplayPage = () => {
  const params = useParams()
  const productId = params?.product?.split("-")?.slice(-1)[0]
  const [data, setData] = useState({
    name: "",
    image: [],
    requiresInstallation: false,
    withInstallation: false,
    description: "",
    unit: "",
    more_details: {},
    stock: 0,
    price: 0,
    discount: 0,
  })

  const [image, setImage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageContainer = useRef()
  const mainImageRef = useRef()
  const [hasSelectedInstallation, setHasSelectedInstallation] = useState(false)

  const fetchProductDetails = async () => {
    try {
      console.log("[v0] Antes de fetch - data.withInstallation:", data.withInstallation)

      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      })

      const { data: responseData } = response

      if (responseData.success) {
        console.log("[v0] Respuesta del servidor - withInstallation:", responseData.data.withInstallation)
        console.log("[v0] Estado previo - withInstallation:", data.withInstallation)

        const preservedInstallationState = data.withInstallation || responseData.data.withInstallation || false
        console.log("[v0] Estado preservado - withInstallation:", preservedInstallationState)

        setData((prev) => ({
          ...responseData.data,
          withInstallation: preservedInstallationState,
        }))
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstallationChange = (value) => {
    console.log("[v0] handleInstallationChange llamado con:", value)
    console.log("[v0] Estado actual data.withInstallation:", data.withInstallation)

    setData((prev) => ({
      ...prev,
      withInstallation: value,
    }))

    setHasSelectedInstallation(value)

    if (value) {
      toast.success("✓ Instalación profesional incluida", {
        duration: 2000,
        style: {
          background: "#10B981",
          color: "white",
        },
      })
    } else {
      toast.info("Instalación profesional removida", {
        duration: 2000,
        style: {
          background: "#6B7280",
          color: "white",
        },
      })
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [params])

  useEffect(() => {
    console.log("[v0] useEffect - data.withInstallation cambió a:", data.withInstallation)
    console.log("[v0] useEffect - hasSelectedInstallation actual:", hasSelectedInstallation)
    setHasSelectedInstallation(data.withInstallation)
  }, [data.withInstallation])

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100
  }
  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100
  }

  const handleMouseEnter = () => {
    setIsZoomed(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return

    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  return (
    <section className="container mx-auto p-4 pt-24 lg:pt-20 grid lg:grid-cols-2">
      {/* --- Columna izquierda: imágenes --- */}
      <div>
        <div
          className="bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full relative overflow-hidden cursor-zoom-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <img
            ref={mainImageRef}
            src={data.image[image] || "/placeholder.svg"}
            className={`w-full h-full object-scale-down transition-transform duration-300 ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            alt="main-product"
            style={{
              transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : "center",
            }}
          />
          {isZoomed && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle 100px at ${zoomPosition.x}% ${zoomPosition.y}%, transparent 0%, rgba(0,0,0,0.1) 100%)`,
              }}
            />
          )}
        </div>
        <div className="flex items-center justify-center gap-3 my-2">
          {data.image.map((img, index) => (
            <div
              key={`${index}_carousel`}
              className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${index === image && "bg-slate-300"}`}
            ></div>
          ))}
        </div>
        <div className="grid relative">
          <div ref={imageContainer} className="flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none">
            {data.image.map((img, index) => (
              <div className="w-20 h-20 min-h-20 min-w-20 cursor-pointer shadow-md" key={`${index}_thumbnail`}>
                <img
                  src={img || "/placeholder.svg"}
                  alt="min-product"
                  onClick={() => setImage(index)}
                  className="w-full h-full object-scale-down"
                />
              </div>
            ))}
          </div>
          <div className="w-full -ml-3 h-full hidden lg:flex justify-between absolute items-center">
            <button onClick={handleScrollLeft} className="z-10 bg-white relative p-1 rounded-full shadow-lg">
              <FaAngleLeft />
            </button>
            <button onClick={handleScrollRight} className="z-10 bg-white relative p-1 rounded-full shadow-lg">
              <FaAngleRight />
            </button>
          </div>
        </div>
        <div className="my-4 hidden lg:grid gap-3">
          <div>
            <p className="font-semibold">Descripción</p>
            <p className="text-base">{data.description}</p>
          </div>
          <div>
            <p className="font-semibold">Unidad</p>
            <p className="text-base">{data.unit}</p>
          </div>
          {data?.more_details &&
            Object.keys(data?.more_details).map((element, index) => (
              <div key={`${index}_detail`}>
                <p className="font-semibold">{element}</p>
                <p className="text-base">{data?.more_details[element]}</p>
              </div>
            ))}
        </div>
      </div>

      {/* --- Columna derecha: detalles --- */}
      <div className="p-4 lg:pl-7 text-base lg:text-lg">
        <p className="bg-gray-300 w-fit px-2 rounded-full">10 Min</p>
        <h2 className="text-lg font-semibold lg:text-3xl">{data.name}</h2>
        <p>{data.unit}</p>
        <Divider />
        <div>
          <p>Precio</p>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="border border-yellow-600 px-4 py-2 rounded bg-yellow-50 w-fit">
              <p className="font-semibold text-lg lg:text-xl">
                {DisplayPriceInSoles(pricewithDiscount(data.price, data.discount))}
              </p>
            </div>
            {data.discount && <p className="line-through">{DisplayPriceInSoles(data.price)}</p>}
            {data.discount && (
              <p className="font-bold text-gray-600 lg:text-2xl">
                {data.discount}% <span className="text-base text-neutral-500">Descuento</span>
              </p>
            )}
          </div>
        </div>

        {/* --- Instalación y botón --- */}
        {data.stock === 0 ? (
          <p className="text-lg text-red-500 my-2">Agotado</p>
        ) : (
          <div className="my-4">
            <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
              <p>DEBUG - data.withInstallation: {data.withInstallation.toString()}</p>
              <p>DEBUG - hasSelectedInstallation: {hasSelectedInstallation.toString()}</p>
              <p>DEBUG - data.requiresInstallation: {data.requiresInstallation.toString()}</p>
            </div>

            {data.requiresInstallation && !data.withInstallation && (
              <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 text-amber-800 mb-2">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-base">Este producto requiere instalación profesional</span>
                </div>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Puedes elegir si deseas incluir el servicio de instalación con tu compra. Nuestros técnicos
                  certificados garantizan una instalación perfecta.
                </p>
              </div>
            )}

            <AddToCartButton
              data={data}
              onInstallationChange={handleInstallationChange}
              installationState={data.withInstallation}
            />

            {data.requiresInstallation && data.withInstallation && (
              <div
                className={`mt-4 p-5 border-2 rounded-xl transition-all duration-300 ${
                  data.withInstallation
                    ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="withInstallation"
                      checked={data.withInstallation || false}
                      onChange={(e) => {
                        console.log("[v0] Checkbox cambiado a:", e.target.checked)
                        handleInstallationChange(e.target.checked)
                      }}
                      className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                    />
                    {data.withInstallation && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="withInstallation"
                      className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      Incluir instalación profesional
                    </label>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Nuestros técnicos especializados instalarán el producto en tu hogar con garantía completa
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Garantía de instalación
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Técnicos certificados
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Servicio incluido
                      </span>
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-700">
                        + $50.000 COP adicionales por instalación profesional
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Razones de compra --- */}
        <h2 className="font-semibold">¿Por qué comprar en MULTISERVICIOS AVISAI?</h2>
        <div>
          <div className="flex items-center gap-4 my-4">
            <img src={image1 || "/placeholder.svg"} alt="superfast delivery" className="w-20 h-20" />
            <div className="text-sm">
              <div className="font-semibold">Entrega Súper Rápida</div>
              <p>Recibe tu pedido en la puerta de tu casa lo antes posible desde tiendas cercanas a ti.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 my-4">
            <img src={image2 || "/placeholder.svg"} alt="Best prices offers" className="w-20 h-20" />
            <div className="text-sm">
              <div className="font-semibold">Mejores Precios y Ofertas.</div>
              <p>El mejor destino de precios con ofertas directamente de los fabricantes.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 my-4">
            <img src={image3 || "/placeholder.svg"} alt="Wide Assortment" className="w-20 h-20" />
            <div className="text-sm">
              <div className="font-semibold">Amplia Variedad.</div>
              <p>
                Elige entre más de 1000 productos en ventanas, puertas, mamparas y otros artículos, con servicio de
                venta e instalación.
              </p>
            </div>
          </div>
        </div>

        {/* --- Detalles móviles --- */}
        <div className="my-4 grid gap-3 lg:hidden">
          <div>
            <p className="font-semibold">Descripción</p>
            <p className="text-base">{data.description}</p>
          </div>
          <div>
            <p className="font-semibold">Unidad</p>
            <p className="text-base">{data.unit}</p>
          </div>
          {data?.more_details &&
            Object.keys(data?.more_details).map((element, index) => (
              <div key={`${index}_mobile_detail`}>
                <p className="font-semibold">{element}</p>
                <p className="text-base">{data?.more_details[element]}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default ProductDisplayPage
