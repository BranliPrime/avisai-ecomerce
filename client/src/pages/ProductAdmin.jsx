"use client"

import { useEffect, useState } from "react"
import SummaryApi from "../common/SummaryApi"
import AxiosToastError from "../utils/AxiosToastError"
import Axios from "../utils/Axios"
import Loading from "../components/Loading"
import ProductCardAdmin from "../components/ProductCardAdmin"
import { MdInventory, MdFilterList, MdClear } from "react-icons/md"
import { FiSearch } from "react-icons/fi"

const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [headerHeight, setHeaderHeight] = useState(0)

  // Filtros mejorados con rango de precios en soles
  const [filters, setFilters] = useState({
    priceRange: "all", // all, low, medium, high
    stock: "all", // all, inStock, lowStock, outOfStock
    discount: "all", // all, withDiscount, withoutDiscount
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length)
  const currentItems = filteredData.slice(startIndex, endIndex)

  //  Función para renderizar botones de paginación personalizada
  const renderPaginationButton = (pageNumber, isCurrent = false) => (
    <button
      key={pageNumber}
      onClick={() => setCurrentPage(pageNumber)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isCurrent
          ? "bg-yellow-500 text-white shadow-sm"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-600"
      }`}
    >
      {pageNumber}
    </button>
  )

  //  Función para renderizar paginación inteligente
  const renderPagination = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i, i === currentPage))
      }
    } else {
      // Lógica inteligente para páginas con puntos suspensivos
      pages.push(renderPaginationButton(1, currentPage === 1))

      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>,
        )
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(renderPaginationButton(i, i === currentPage))
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>,
        )
      }

      if (totalPages > 1) {
        pages.push(renderPaginationButton(totalPages, currentPage === totalPages))
      }
    }

    return pages
  }

  // Obtener productos
  const fetchProductData = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: { page: 1, limit: 1000 },
      })

      const { data: responseData } = response
      if (responseData.success) {
        setProductData(responseData.data)
        setFilteredData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [])

  // Filtrado con rangos de precios ajustados para soles peruanos
  useEffect(() => {
    let filtered = productData.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by price range
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = product.price || 0
        switch (filters.priceRange) {
          case "low":
            return price < 200
          case "medium":
            return price >= 200 && price <= 800
          case "high":
            return price > 800
          default:
            return true
        }
      })
    }

    // Filter by stock status
    if (filters.stock !== "all") {
      filtered = filtered.filter((product) => {
        const stock = product.stock || 0
        switch (filters.stock) {
          case "inStock":
            return stock > 10
          case "lowStock":
            return stock > 0 && stock <= 10
          case "outOfStock":
            return stock === 0
          default:
            return true
        }
      })
    }

    // Filter by discount
    if (filters.discount !== "all") {
      filtered = filtered.filter((product) =>
        filters.discount === "withDiscount" ? (product.discount || 0) > 0 : (product.discount || 0) === 0,
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, productData, filters])

  const clearFilters = () => {
    setFilters({
      priceRange: "all",
      stock: "all",
      discount: "all",
    })
    setSearchTerm("")
  }

  const hasActiveFilters =
    filters.priceRange !== "all" || filters.stock !== "all" || filters.discount !== "all" || searchTerm

  // Medir altura del header para evitar solapamiento
  useEffect(() => {
    const headerEl = document.querySelector("header")
    if (headerEl) {
      const updateHeight = () => setHeaderHeight(headerEl.getBoundingClientRect().height)
      updateHeight()
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }
  }, [])

  return (
    <div className="w-full space-y-4" style={{ paddingTop: headerHeight + 16 }}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Product Management Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MdInventory className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
              <p className="text-sm text-gray-600">Administra el inventario ({productData.length} total)</p>
            </div>
          </div>

          {/* Center: Search Bar - Increased size and width */}
          <div className="flex-1 max-w-lg w-full lg:mx-8">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
              />
            </div>
          </div>

          {/* Right: Filters - Increased size of filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-gray-600">
              <MdFilterList className="w-5 h-5" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            {/* Filtro de rango de precios */}
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceRange: e.target.value }))}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
            >
              <option value="all">Todos los precios</option>
              <option value="low">Bajo (S/ 200)</option>
              <option value="medium">Medio (S/ 200-800)</option>
              <option value="high">Alto (S/ 800)</option>
            </select>

            {/* Filtro de stock */}
            <select
              value={filters.stock}
              onChange={(e) => setFilters((prev) => ({ ...prev, stock: e.target.value }))}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[110px]"
            >
              <option value="all">Todo el stock</option>
              <option value="inStock">Stock alto</option>
              <option value="lowStock">Stock bajo</option>
              <option value="outOfStock"> Sin stock</option>
            </select>

            {/* Filtro de descuentos */}
            <select
              value={filters.discount}
              onChange={(e) => setFilters((prev) => ({ ...prev, discount: e.target.value }))}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[130px]"
            >
              <option value="all">Todos los descuentos</option>
              <option value="withDiscount">Con descuento</option>
              <option value="withoutDiscount">Sin descuento</option>
            </select>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <MdClear className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Filter Results Summary */}
        {hasActiveFilters && (
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
            Mostrando {filteredData.length} de {productData.length} productos
            {searchTerm && ` que coinciden con "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          {hasActiveFilters ? (
            <div>
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-4">No hay productos que coincidan con los filtros aplicados</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div>
              <MdInventory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-600">No hay productos disponibles en este momento</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {currentItems.map((p, index) => (
              <ProductCardAdmin key={p._id || index} data={p} fetchProductData={fetchProductData} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Información de elementos a la izquierda */}
                <p className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {endIndex} de {filteredData.length} productos
                  {hasActiveFilters && ` (filtrados de ${productData.length} total)`}
                </p>

                {/* Controles de paginación a la derecha */}
                <div className="flex items-center gap-2">
                  {/* Botón Anterior */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-600"
                    }`}
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1">{renderPagination()}</div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-600"
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductAdmin
