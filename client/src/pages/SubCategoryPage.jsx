"use client"

import { useEffect, useState } from "react"
import UploadSubCategoryModel from "../components/UploadSubCategoryModel"
import AxiosToastError from "../utils/AxiosToastError"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import DisplayTable from "../components/DisplayTable"
import { createColumnHelper } from "@tanstack/react-table"
import ViewImage from "../components/ViewImage"
import { MdDelete, MdAdd, MdClear } from "react-icons/md"
import { HiPencil } from "react-icons/hi"
import { FiSearch, FiLayers, FiFilter, FiArrowUp, FiArrowDown, FiX } from "react-icons/fi"
import EditSubCategory from "../components/EditSubCategory"
import toast from "react-hot-toast"
import ConfirmBox from "../components/ConfirmBox"

const SubCategoryPage = () => {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  //  Estados para filtros y ordenamiento mejorados
  const [sortOrder, setSortOrder] = useState("asc") // asc o desc
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const columnHelper = createColumnHelper()
  const [ImageURL, setImageURL] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ _id: "" })
  const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  //  Función para obtener categorías únicas para el filtro
  const getUniqueCategories = () => {
    const categories = []
    data.forEach((subCategory) => {
      subCategory.category.forEach((cat) => {
        if (!categories.find((c) => c._id === cat._id)) {
          categories.push(cat)
        }
      })
    })
    return categories.sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchSubCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getSubCategory,
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
    fetchSubCategory()
  }, [])

  //  Efecto mejorado para filtrar y ordenar datos (eliminado filtro confuso)
  useEffect(() => {
    let filtered = data.filter(
      (subCategory) =>
        subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subCategory.category.some((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Filtro por categoría específica
    if (selectedCategory) {
      filtered = filtered.filter((subCategory) => subCategory.category.some((cat) => cat._id === selectedCategory))
    }

    //  Ordenamiento alfabético mejorado
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data, sortOrder, selectedCategory])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  //  Función para limpiar filtros simplificada
  const clearFilters = () => {
    setSelectedCategory("")
    setSearchTerm("")
    setSortOrder("asc")
  }

  //  Contar filtros activos simplificado
  const activeFiltersCount = [selectedCategory].filter(Boolean).length

  //  Función para alternar ordenamiento
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const column = [
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium text-gray-900">{row.original.name}</div>,
    }),
    columnHelper.accessor("image", {
      header: "Imagen",
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={row.original.image || "/placeholder.svg"}
              alt={row.original.name}
              className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setImageURL(row.original.image)}
            />
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Categorías",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.category.map((c) => (
            <span
              key={c._id + "table"}
              className="inline-block bg-green-100 text-blue-800 font-medium px-2 py-1 rounded-full"
            >
              {c.name}
            </span>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("_id", {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setOpenEdit(true)
              setEditData(row.original)
            }}
            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 hover:text-green-800 transition-colors"
            title="Editar subcategoría"
          >
            <HiPencil size={16} />
          </button>
          <button
            onClick={() => {
              setOpenDeleteConfirmBox(true)
              setDeleteSubCategory(row.original)
            }}
            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors"
            title="Eliminar subcategoría"
          >
            <MdDelete size={16} />
          </button>
        </div>
      ),
    }),
  ]

  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: deleteSubCategory,
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchSubCategory()
        setOpenDeleteConfirmBox(false)
        setDeleteSubCategory({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const renderPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i, i === currentPage))
      }
    } else {
      // Always show first page
      pages.push(renderPaginationButton(1, currentPage === 1))

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust range to always show 3 middle pages when possible
      if (end - start < 2) {
        if (start === 2) {
          end = Math.min(totalPages - 1, start + 2)
        } else {
          start = Math.max(2, end - 2)
        }
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>,
        )
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(renderPaginationButton(i, i === currentPage))
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>,
        )
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(renderPaginationButton(totalPages, currentPage === totalPages))
      }
    }

    return pages
  }

  const renderPaginationButton = (pageNumber, isCurrent = false) => (
    <button
      key={pageNumber}
      onClick={() => setCurrentPage(pageNumber)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isCurrent
          ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300"
      }`}
    >
      {pageNumber}
    </button>
  )

  return (
    <div className="p-4 pt-28 lg:pt-24">
      {/* Header con título y botón agregar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiLayers className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subcategorías</h1>
              <p className="text-sm text-gray-600">Gestiona las subcategorías de productos ({data.length} total)</p>
            </div>
          </div>
          <button
            onClick={() => setOpenAddSubCategory(true)}
            className="inline-flex items-center gap-2 text-sm border border-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <MdAdd className="w-5 h-5" />
            Agregar Sub Categoría
          </button>
        </div>

        {/*  Barra de búsqueda y controles mejorados */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar subcategorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/*  Controles de ordenamiento y filtros mejorados */}
          <div className="flex items-center gap-2">
            {/* Botón de ordenamiento alfabético */}
            <button
              onClick={toggleSortOrder}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                sortOrder === "desc"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
              title={`Ordenar ${sortOrder === "asc" ? "Z-A" : "A-Z"}`}
            >
              {sortOrder === "asc" ? (
                <>
                  <FiArrowUp className="w-4 h-4" />
                  <span className="text-sm">A-Z</span>
                </>
              ) : (
                <>
                  <FiArrowDown className="w-4 h-4" />
                  <span className="text-sm">Z-A</span>
                </>
              )}
            </button>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/*  Panel de filtros simplificado */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                >
                  <option value="">Todas las categorías</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/*  Chips de filtros activos y botón limpiar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Categoría: {getUniqueCategories().find((cat) => cat._id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory("")} className="ml-1 hover:text-green-600">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <MdClear className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-gray-600">Cargando subcategorías...</span>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <FiLayers className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || activeFiltersCount > 0
                  ? "No se encontraron subcategorías"
                  : "No hay subcategorías disponibles"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || activeFiltersCount > 0
                  ? "No se encontraron subcategorías que coincidan con los filtros aplicados"
                  : "Comienza agregando tu primera subcategoría para organizar mejor tus productos"}
              </p>
              {!searchTerm && activeFiltersCount === 0 && (
                <button
                  onClick={() => setOpenAddSubCategory(true)}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <MdAdd className="w-5 h-5" />
                  Agregar Primera Subcategoría
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/*  Información de resultados y ordenamiento */}
          {/* <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredData.length} subcategorías encontradas
              {sortOrder === "desc" && " (ordenadas Z-A)"}
              {sortOrder === "asc" && " (ordenadas A-Z)"}
            </div>
          </div> */}

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <DisplayTable data={currentData} column={column} />
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de{" "}
                {filteredData.length} subcategorías
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                <div className="flex gap-1">{renderPaginationNumbers()}</div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {openAddSubCategory && (
        <UploadSubCategoryModel close={() => setOpenAddSubCategory(false)} fetchData={fetchSubCategory} />
      )}
      {ImageURL && <ViewImage url={ImageURL} close={() => setImageURL("")} />}
      {openEdit && <EditSubCategory data={editData} close={() => setOpenEdit(false)} fetchData={fetchSubCategory} />}
      {openDeleteConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirmBox(false)}
          close={() => setOpenDeleteConfirmBox(false)}
          confirm={handleDeleteSubCategory}
        />
      )}
    </div>
  )
}

export default SubCategoryPage
