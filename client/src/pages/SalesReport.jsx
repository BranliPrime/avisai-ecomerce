"use client"

import { useEffect, useState, useMemo } from "react"
import Axios from "../utils/Axios"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { Search, Calendar, TrendingUp, Users, Package, DollarSign, Download } from "lucide-react"
import * as XLSX from "xlsx"

const ITEMS_PER_PAGE = 8

const SalesReport = () => {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchSalesReport = async () => {
      setLoading(true)
      try {
        let url = "api/order/sales-report"
        const params = []
        if (startDate) params.push(`startDate=${startDate}`)
        if (endDate) params.push(`endDate=${endDate}`)
        if (params.length) url += "?" + params.join("&")

        const response = await Axios(url)
        if (response.data.success) {
          setSalesData(response.data.salesByProduct || [])
        } else {
          toast.error("No se pudo obtener el reporte de ventas.")
        }
      } catch (err) {
        AxiosToastError(err)
        setError("Ocurrió un error al cargar el reporte de ventas.")
      } finally {
        setLoading(false)
      }
    }

    fetchSalesReport()
  }, [startDate, endDate])

  const filteredData = useMemo(() => {
    if (!searchTerm) return salesData
    return salesData.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customers.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, salesData])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [currentPage, filteredData])

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalSales, 0)
    const totalProducts = filteredData.length
    const totalQuantity = filteredData.reduce((sum, item) => sum + item.totalQuantity, 0)
    const totalOrders = filteredData.reduce((sum, item) => sum + item.totalOrders, 0)

    return { totalRevenue, totalProducts, totalQuantity, totalOrders }
  }, [filteredData])

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const exportData = filteredData.map((item, index) => ({
        Producto: item.productName,
        "Ventas Totales (S/)": item.totalSales.toFixed(2),
        "Cantidad Vendida": item.totalQuantity,
        "Órdenes Totales": item.totalOrders,
        "Número de Clientes": item.customers.length,
        Clientes: item.customers.join(", "),
      }))

      // Add summary row
      exportData.push({
        Producto: "RESUMEN TOTAL",
        "Ventas Totales (S/)": summaryStats.totalRevenue.toFixed(2),
        "Cantidad Vendida": summaryStats.totalQuantity,
        "Órdenes Totales": summaryStats.totalOrders,
        "Número de Clientes": "",
        Clientes: `${summaryStats.totalProducts} productos únicos`,
      })

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Producto
        { wch: 20 }, // Ventas Totales
        { wch: 15 }, // Cantidad Vendida
        { wch: 15 }, // Órdenes Totales
        { wch: 18 }, // Número de Clientes
        { wch: 50 }, // Clientes
      ]
      ws["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas")

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0]
      const filename = `reporte-ventas-${currentDate}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)

      toast.success("Reporte exportado exitosamente")
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast.error("Error al exportar el reporte")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">Cargando reporte de ventas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-card rounded-lg p-8 shadow-lg border border-destructive/20">
          <div className="flex items-center space-x-3 text-destructive">
            <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-sm font-bold">!</span>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 pt-32 lg:pt-28 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
            Reporte de Ventas
          </h1>
          <p className="text-xl text-slate-600 font-medium">Análisis detallado de ventas por producto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 font-medium mb-1">Ingresos Totales</p>
                <p className="text-3xl font-bold">S/ {summaryStats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium mb-1">Productos</p>
                <p className="text-3xl font-bold">{summaryStats.totalProducts}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 font-medium mb-1">Cantidad Vendida</p>
                <p className="text-3xl font-bold">{summaryStats.totalQuantity}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 font-medium mb-1">Órdenes Totales</p>
                <p className="text-3xl font-bold">{summaryStats.totalOrders}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              Filtros
            </h3>

            <button
              onClick={exportToExcel}
              disabled={filteredData.length === 0}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-xl hover:from-green-600 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Download className="w-5 h-5" />
              Exportar a Excel
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto "
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3 bg-white/60 rounded-xl p-3 border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-500" />
                <label className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-slate-700">Desde:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-700"
                  />
                </label>
              </div>

              <div className="flex items-center space-x-3 bg-white/60 rounded-xl p-3 border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-500" />
                <label className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-slate-700">Hasta:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-700"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-16 shadow-xl border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No hay ventas registradas</h3>
            <p className="text-slate-600 text-lg">No se encontraron datos para el período seleccionado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {paginatedData.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 group"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {item.productName}
                      </h3>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          S/ {item.totalSales.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">Ventas totales</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                        <p className="text-2xl font-bold text-blue-700">{item.totalQuantity}</p>
                        <p className="text-xs text-blue-600 font-medium">Cantidad</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:from-emerald-100 hover:to-teal-100 transition-colors">
                        <p className="text-2xl font-bold text-emerald-700">{item.totalOrders}</p>
                        <p className="text-xs text-emerald-600 font-medium">Órdenes</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-colors">
                        <p className="text-2xl font-bold text-purple-700">{item.customers.length}</p>
                        <p className="text-xs text-purple-600 font-medium">Clientes</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Clientes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.customers.slice(0, 3).map((customer, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow"
                          >
                            {customer}
                          </span>
                        ))}
                        {item.customers.length > 3 && (
                          <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white text-sm rounded-lg font-medium shadow-sm">
                            +{item.customers.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-xl hover:from-green-600 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <span>← Anterior</span>
                </button>

                <div className="flex items-center space-x-4 bg-white/60 rounded-xl px-6 py-3 border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <span className="text-sm text-slate-600 font-medium">({filteredData.length} resultados)</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-xl hover:from-green-600 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <span>Siguiente →</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SalesReport
