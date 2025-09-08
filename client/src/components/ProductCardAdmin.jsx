"use client"

import { useState } from "react"
import EditProductAdmin from "./EditProductAdmin"
import ConfirmBox from "./ConfirmBox"
import { MdEdit, MdDelete, MdInventory } from "react-icons/md"
import SummaryApi from "../common/SummaryApi"
import Axios from "../utils/Axios"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { Percent } from "lucide-react"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"
import { pricewithDiscount } from "../utils/PriceWithDiscount"

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleDeleteCancel = () => {
    setOpenDelete(false)
  }

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: data._id },
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        fetchProductData?.()
        setOpenDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Imagen */}
      <div className="bg-gray-50 flex items-center justify-center h-32 w-full overflow-hidden relative">
        <img
          src={data?.image[0] || "/placeholder.svg"}
          alt={data?.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
        />

        {/* Stock */}
        {data?.stock !== undefined && (
          <div className="absolute top-2 right-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-sm font-semibold transition-all duration-300 ${
                data.stock > 10
                  ? "bg-green-100 text-green-700"
                  : data.stock > 0
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              <MdInventory className="text-base" />
              <span className="capitalize">Stock:</span>
              <span className="font-bold">{data.stock}</span>
            </div>
          </div>
        )}

        {/* Descuento */}
        {Boolean(data.discount) && (
          <div className="absolute top-1.5 left-1.5">
            <div className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
              <Percent className="w-2.5 h-2.5" />
              {data.discount}% OFF
            </div>
          </div>
        )}
      </div>

      {/* Contenido + Botones */}
      <div className="p-3 flex flex-col justify-between flex-1">
        {/* Info */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
            {data?.name}
          </h3>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Unidad: {data?.unit}</span>
              {data?.category?.length > 0 && (
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  {data.category.length} cat.
                </span>
              )}
            </div>

            {data?.price && (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  {Boolean(data.discount) && (
                    <span className="text-gray-500 text-xs line-through">
                      {DisplayPriceInSoles(data.price)}
                    </span>
                  )}
                  <span className="font-bold text-gray-600 text-lg">
                    {DisplayPriceInSoles(pricewithDiscount(data.price, data.discount))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <MdEdit className="text-sm" />
            Editar
          </button>
          <button
            onClick={() => setOpenDelete(true)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <MdDelete className="text-sm" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Modales */}
      {editOpen && (
        <EditProductAdmin
          fetchProductData={fetchProductData}
          data={data}
          close={() => setEditOpen(false)}
        />
      )}

      {openDelete && (
        <ConfirmBox
          cancel={handleDeleteCancel}
          confirm={handleDelete}
          close={() => setOpenDelete(false)}
        />
      )}
    </div>
  )
}

export default ProductCardAdmin
