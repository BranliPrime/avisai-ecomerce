import { useEffect, useState } from "react"
import UploadCategoryModel from "../components/UploadCategoryModel"
import Loading from "../components/Loading"
import NoData from "../components/NoData"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import EditCategory from "../components/EditCategory"
import CofirmBox from "../components/ConfirmBox"
import toast from "react-hot-toast"
import AxiosToastError from "../utils/AxiosToastError"
import { MdAdd, MdEdit, MdDelete, MdCategory } from "react-icons/md"
import { FiSearch } from "react-icons/fi"

const CategoryPage = () => {
  const [openUploadCategory, setOpenUploadCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryData, setCategoryData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ name: "", image: "" })
  const [openConfimBoxDelete, setOpenConfirmBoxDelete] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState({ _id: "" })
  const [headerHeight, setHeaderHeight] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('asc')
  const itemsPerPage = 12

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({ ...SummaryApi.getCategory })
      const { data: responseData } = response
      if (responseData.success) {
        setCategoryData(responseData.data)
        setFilteredData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [])

  useEffect(() => {
    let filtered = categoryData.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered = filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      } else {
        return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' })
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, categoryData, sortOrder])

  const handleDeleteCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCategory,
        data: deleteCategory,
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchCategory()
        setOpenConfirmBoxDelete(false)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  useEffect(() => {
    const headerEl = document.querySelector("header")
    if (headerEl) {
      const updateHeight = () => setHeaderHeight(headerEl.getBoundingClientRect().height)
      updateHeight()
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }
  }, [])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  //  Función para renderizar botones de paginación
  const renderPaginationButton = (pageNumber, isCurrent = false) => (
    <button
      key={pageNumber}
      onClick={() => setCurrentPage(pageNumber)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out 
    focus:outline-none focus:ring-2 focus:ring-yellow-400
    ${isCurrent
          ? "bg-yellow-500 text-white shadow-md hover:bg-yellow-600"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300"
        }`}
    >
      {pageNumber}
    </button>

  )

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i, i === currentPage))
      }
    } else {
      pages.push(renderPaginationButton(1, currentPage === 1))

      if (currentPage > 3) {
        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>)
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(renderPaginationButton(i, i === currentPage))
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>)
      }

      if (totalPages > 1) {
        pages.push(renderPaginationButton(totalPages, currentPage === totalPages))
      }
    }

    return pages
  }

  return (
    <div className="p-4" style={{ paddingTop: headerHeight + 16 }}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MdCategory className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
              <p className="text-sm text-gray-600">
                Gestiona las categorías de productos ({categoryData.length} total)
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenUploadCategory(true)}
            className="inline-flex items-center gap-2 text-sm border border-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <MdAdd className="w-5 h-5" />
            Agregar Categoría
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="max-w-md flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <button
            onClick={toggleSortOrder}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${sortOrder === 'asc'
                ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
              }`}
          >
            <span className="font-bold text-lg">
              {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <div>
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron categorías
              </h3>
              <p className="text-gray-600">
                No hay categorías que coincidan con "{searchTerm}"
              </p>
            </div>
          ) : (
            <NoData />
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {currentItems.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group h-full flex flex-col min-h-[280px]"
              >
                <div className="bg-gray-50 flex items-center justify-center h-32 w-full overflow-hidden">
                  <img
                    alt={category.name}
                    src={category.image || "/placeholder.svg"}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow flex items-center justify-center min-h-[3rem] mb-3">
                    <h3 className="font-semibold text-gray-900 text-center line-clamp-2 text-sm leading-tight">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => {
                        setOpenEdit(true)
                        setEditData(category)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <MdEdit className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setOpenConfirmBoxDelete(true)
                        setDeleteCategory(category)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <MdDelete className="w-4 h-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/*  Paginación horizontal personalizada */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} categorías
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {openUploadCategory && (
        <UploadCategoryModel fetchData={fetchCategory} close={() => setOpenUploadCategory(false)} />
      )}
      {openEdit && (
        <EditCategory
          data={editData}
          close={() => setOpenEdit(false)}
          fetchData={fetchCategory}
        />
      )}
      {openConfimBoxDelete && (
        <CofirmBox
          close={() => setOpenConfirmBoxDelete(false)}
          cancel={() => setOpenConfirmBoxDelete(false)}
          confirm={handleDeleteCategory}
        />
      )}
    </div>
  )
}

export default CategoryPage
