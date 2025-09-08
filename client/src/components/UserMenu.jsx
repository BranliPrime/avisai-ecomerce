"use client"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import { logout } from "../store/userSlice"
import toast from "react-hot-toast"
import AxiosToastError from "../utils/AxiosToastError"
import isAdmin from "../utils/isAdmin"
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlineCollection,
  HiOutlineViewGrid,
  HiOutlineUpload,
  HiOutlineClipboardList,
  HiOutlineExternalLink,
  HiOutlineCog,
  HiX,
  HiOutlineChartBar,
  HiOutlineUsers,
} from "react-icons/hi"
import { useState } from "react"

const UserMenu = ({ close, isDashboard = false }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await Axios({
        ...SummaryApi.logout,
      })
      if (response.data.success) {
        if (close) {
          close()
        }
        dispatch(logout())
        localStorage.clear()
        toast.success(response.data.message)
        navigate("/")
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleClose = () => {
    if (close) {
      close()
    }
  }

  // Función para verificar si una ruta está activa
  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  // Si es dashboard, usar layout integrado (sin posición fixed)
  if (isDashboard) {
    return (
      <div className="w-full h-full bg-white">
        {/* Header del sidebar para dashboard */}
        <div className="bg-gradient-to-r from-green-600 to-green-700  px-4 py-3 text-white mb-4 rounded-lg sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mi Cuenta</h3>
              <p className="text-white text-sm">Panel de usuario</p>
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="bg-slate-50 px-4 py-3 border border-gray-200 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.name || user.mobile}</p>
            <p className="text-gray-600 text-xs">{user.email}</p>
            {user.role === "ADMIN" && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mt-1 inline-block">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="space-y-6">
          {/* Sección Admin */}
          {isAdmin(user.role) && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Panel de Control</h4>
              </div>
              <div className="space-y-1">
                <Link
                  to={"/dashboard/category"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute("/dashboard/category")
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute("/dashboard/category") ? "bg-yellow-200" : "bg-yellow-100 group-hover:bg-yellow-200"
                    }`}
                  >
                    <HiOutlineCollection className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Categorías</span>
                </Link>
                <Link
                  to={"/dashboard/subcategory"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute("/dashboard/subcategory")
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute("/dashboard/subcategory") ? "bg-yellow-200" : "bg-yellow-100 group-hover:bg-yellow-200"
                    }`}
                  >
                    <HiOutlineViewGrid className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Subcategorías</span>
                </Link>
                <Link
                  to={"/dashboard/upload-product"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute("/dashboard/upload-product")
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute("/dashboard/upload-product")
                        ? "bg-amber-200"
                        : "bg-amber-100 group-hover:bg-amber-200"
                    }`}
                  >
                    <HiOutlineUpload className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Subir Producto</span>
                </Link>
                <Link
                  to={"/dashboard/product"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute("/dashboard/product")
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute("/dashboard/product") ? "bg-yellow-200" : "bg-yellow-100 group-hover:bg-yellow-200"
                    }`}
                  >
                    <HiOutlineClipboardList className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Productos</span>
                </Link>
                <Link
                  to={"/dashboard/sales-report"}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute("/dashboard/sales-report")
                      ? "bg-amber-100 text-amber-800 border-l-4 border-amber-600"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute("/dashboard/sales-report")
                        ? "bg-amber-200"
                        : "bg-amber-100 group-hover:bg-amber-200"
                    }`}
                  >
                    <HiOutlineChartBar className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Reportes de Ventas</span>
                </Link>
                <Link
                  to={`/dashboard/customer-orders`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                    isActiveRoute(`/dashboard/customer-orders/${user._id}`)
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                  }`}
                >
                  {/* <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isActiveRoute(`/dashboard/customer-orders`)
                        ? "bg-yellow-200"
                        : "bg-yellow-100 group-hover:bg-yellow-200"
                    }`}
                  >
                    <HiOutlineUsers className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Pedidos de Clientes</span> */}
                </Link>
              </div>
            </div>
          )}

          {/* Separador */}
          {isAdmin(user.role) && <div className="border-t border-gray-200"></div>}

          {/* Sección Usuario */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mi Cuenta</h4>
            </div>
            <div className="space-y-1">
              <Link
                to={"/dashboard/myorders"}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                  isActiveRoute("/dashboard/myorders")
                    ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                    : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isActiveRoute("/dashboard/myorders")
                      ? "bg-yellow-200"
                      : "bg-yellow-100 group-hover:bg-yellow-200"
                  }`}
                >
                  <HiOutlineShoppingBag className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium">Mis Pedidos</span>
              </Link>
              <Link
                to={"/dashboard/address"}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm ${
                  isActiveRoute("/dashboard/address")
                    ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600"
                    : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isActiveRoute("/dashboard/address") ? "bg-yellow-200" : "bg-yellow-100 group-hover:bg-yellow-200"
                  }`}
                >
                  <HiOutlineLocationMarker className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium">Direcciones Guardadas</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer con cerrar sesión */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group disabled:opacity-50 text-sm"
          >
            <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center group-hover:bg-red-200 transition-colors">
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineLogout className="w-4 h-4 text-red-600" />
              )}
            </div>
            <span className="font-medium">{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
          </button>
        </div>
      </div>
    )
  }

  // Layout para sidebar (páginas normales)
  return (
    <section className="fixed top-0 right-0 bottom-0 z-50 bg-white w-96 shadow-2xl transform transition-transform duration-300 ease-in-out">
      {/* Header del sidebar */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <HiOutlineUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mi Cuenta</h3>
            <p className="text-green-100 text-sm">Panel de usuario</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <HiX className="w-6 h-6" />
        </button>
      </div>

      {/* Información del usuario */}
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{user.name || user.mobile}</p>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "ADMIN" && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <HiOutlineCog className="w-3 h-3" />
                Admin
              </span>
            )}
            <Link
              onClick={handleClose}
              to={"/dashboard/profile"}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
            >
              <HiOutlineExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Sección Admin */}
        {isAdmin(user.role) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-black uppercase tracking-wide">Panel de Control</h4>
            </div>
            <div className="space-y-2">
              <Link
                onClick={handleClose}
                to={"/dashboard/category"}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineCollection className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Categorías</span>
              </Link>
              <Link
                onClick={handleClose}
                to={"/dashboard/subcategory"}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineViewGrid className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Subcategorías</span>
              </Link>
              <Link
                onClick={handleClose}
                to={"/dashboard/upload-product"}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineUpload className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Subir Producto</span>
              </Link>
              <Link
                onClick={handleClose}
                to={"/dashboard/product"}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineClipboardList className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Productos</span>
              </Link>
              <Link
                onClick={handleClose}
                to={"/dashboard/sales-report"}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineChartBar className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Reportes de Ventas</span>
              </Link>
              <Link
                onClick={handleClose}
                to={`/dashboard/customer-orders`}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
              >
                {/* <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <HiOutlineUsers className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold">Pedidos de Clientes</span> */}
              </Link>
            </div>
          </div>
        )}

        {/* Separador */}
        {isAdmin(user.role) && <div className="border-t border-gray-200 my-6"></div>}

        {/* Sección Usuario */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-black uppercase tracking-wide">Mi Cuenta</h4>
          </div>
          <div className="space-y-2">
            <Link
              onClick={handleClose}
              to={"/dashboard/myorders"}
              className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <HiOutlineShoppingBag className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="font-semibold">Mis Pedidos</span>
            </Link>
            <Link
              onClick={handleClose}
              to={"/dashboard/address"}
              className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <HiOutlineLocationMarker className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="font-semibold">Direcciones Guardadas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer fijo con cerrar sesión */}
      <div className="border-t border-gray-200 p-6">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group disabled:opacity-50"
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <HiOutlineLogout className="w-5 h-5 text-red-600" />
            )}
          </div>
          <span className="font-semibold">{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
        </button>
      </div>
    </section>
  )
}

export default UserMenu
