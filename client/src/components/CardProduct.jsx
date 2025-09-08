"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, Percent, Package } from "lucide-react"
import { valideURLConvert } from "../utils/valideURLConvert"
import { pricewithDiscount } from "../utils/PriceWithDiscount"
import AddToCartButton from "./AddToCartButton"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"

const CardProduct = ({ data }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  const isOutOfStock = data.stock === 0

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full ${
        isOutOfStock ? "opacity-60" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Link wrapper para la imagen y contenido principal */}
      <Link to={url} className="flex flex-col flex-1">
        {/* Image Container - Altura fija */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gray-50 h-32 lg:h-48">
          {!imageLoaded && (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <img
            src={data.image[0] || "/placeholder.svg"}
            alt={data.name}
            className={`w-full h-full object-scale-down lg:scale-125 group-hover:scale-110 transition-transform duration-300 ${
              !imageLoaded ? "hidden" : "block"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Delivery Time Badge - Amarillo MULTISERVICIOS */}
            <div className="bg-yellow-400 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              10 min
            </div>

            {/* Discount Badge */}
            {Boolean(data.discount) && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <Percent className="w-3 h-3 mr-1" />
                {data.discount}% OFF
              </div>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">AGOTADO</div>
            </div>
          )}
        </div>

        {/* Product Info - Flex para ocupar espacio disponible */}
        <div className="p-3 lg:p-4 flex flex-col flex-1">
          {/* Product Name - Altura fija */}
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-green-600 transition-colors duration-300 h-10 lg:h-12 flex items-start">
            {data.name}
          </h3>

          {/* Unit - Altura fija */}
          <p className="text-gray-500 text-xs lg:text-sm mb-3 h-4">{data.unit}</p>

          {/* Spacer para empujar el precio hacia abajo */}
          <div className="flex-1"></div>

          {/* Price Section - Siempre al final */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-green-600 text-lg">
                {DisplayPriceInSoles(pricewithDiscount(data.price, data.discount))}
              </span>
              {Boolean(data.discount) && (
                <span className="text-gray-500 line-through text-sm">{DisplayPriceInSoles(data.price)}</span>
              )}
            </div>

            {/* Stock indicator */}
            {!isOutOfStock && data.stock < 10 && (
              <div className="text-orange-500 text-xs font-medium">¡Últimas {data.stock}!</div>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Altura fija y siempre al final */}
      <div className="px-3 lg:px-4 pb-3 lg:pb-4 mt-auto">
        {isOutOfStock ? (
          <div className="w-full h-10 bg-gray-100 text-gray-500 flex items-center justify-center rounded-lg font-semibold text-sm">
            Producto Agotado
          </div>
        ) : (
          <div onClick={(e) => e.preventDefault()} className="h-10">
            <AddToCartButton data={data} />
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div
        className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-colors duration-300 pointer-events-none ${
          isHovered && !isOutOfStock ? "border-green-200" : ""
        }`}
      />
    </div>
  )
}

export default CardProduct
