"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import AxiosToastError from "../utils/AxiosToastError"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import CardProduct from "./CardProduct"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6"
import { useSelector } from "react-redux"
import { valideURLConvert } from "../utils/valideURLConvert"

const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()
  const subCategoryData = useSelector((state) => state.product.allSubCategory)
  const loadingCardNumber = new Array(6).fill(null)

  const fetchCategoryWiseProduct = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategory,
        data: {
          id: id,
        },
      })

      const { data: responseData } = response

      if (responseData.success) {
        setData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoryWiseProduct()
  }, [])

  const handleScrollRight = () => {
    containerRef.current.scrollLeft += 200
  }

  const handleScrollLeft = () => {
    containerRef.current.scrollLeft -= 200
  }

  const handleRedirectProductListpage = () => {
    const subcategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => {
        return c._id == id
      })

      return filterData ? true : null
    })
    const url = `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory?.name)}-${subcategory?._id}`

    return url
  }

  const redirectURL = handleRedirectProductListpage()

  return (
    <div className="container mx-auto py-8">
      <div className="px-4 mb-6 flex items-center justify-between">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{name}</h3>
        <Link
          to={redirectURL}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:underline"
        >
          Ver Todo
          <FaAngleRight className="text-xs" />
        </Link>
      </div>

      <div className="relative">
        <div
          className="flex gap-3 px-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          ref={containerRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading &&
            loadingCardNumber.map((_, index) => (
              <div key={"CategorywiseProductDisplay123" + index} className="w-48 lg:w-52 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
                  <div className="bg-gray-200 h-32 lg:h-36 rounded-lg mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-5 rounded w-1/2"></div>
                </div>
              </div>
            ))}

          {data.map((p, index) => (
            <div key={p._id + "CategorywiseProductDisplay" + index} className="w-48 lg:w-52 flex-shrink-0">
              <CardProduct data={p} />
            </div>
          ))}
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2 hidden lg:flex justify-between pointer-events-none">
          <button
            onClick={handleScrollLeft}
            className="pointer-events-auto bg-white shadow-lg text-lg p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-xl"
          >
            <FaAngleLeft className="text-gray-600" />
          </button>
          <button
            onClick={handleScrollRight}
            className="pointer-events-auto bg-white shadow-lg text-lg p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-xl"
          >
            <FaAngleRight className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryWiseProductDisplay
