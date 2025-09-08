import { useEffect, useRef, useState } from "react"
import logo from "../assets/logo.png"
import Search from "./Search"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaRegCircleUser } from "react-icons/fa6"
import { BsCart4 } from "react-icons/bs" 
import useMobile from "../hooks/useMobile"
import { useSelector } from "react-redux"
import { GoTriangleDown, GoTriangleUp } from "react-icons/go"
import UserMenu from "./UserMenu"
import { useGlobalContext } from "../provider/GlobalProvider"
import DisplayCartItem from "./DisplayCartItem"
import { DisplayPriceInSoles } from "../utils/DisplayPriceInSoles"
import { HiOutlineExternalLink } from "react-icons/hi"

const Header = () => {
  const [isMobile] = useMobile()
  const location = useLocation()
  const isSearchPage = location.pathname === "/search"
  const isDashboard = location.pathname.startsWith("/dashboard")
  const navigate = useNavigate()
  const user = useSelector((state) => state?.user)
  const { totalPrice, totalQty, migrationInProgress } = useGlobalContext()
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [openCartSection, setOpenCartSection] = useState(false)
  const userMenuRef = useRef(null)
  const buttonRef = useRef(null)

  // Estados para carrito local
  const [localCartTotals, setLocalCartTotals] = useState({
    totalPrice: 0,
    totalQty: 0,
  })

  const redirectToLoginPage = () => {
    navigate("/login")
  }

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false)
  }

  const handleMobileUser = () => {
    if (!user._id) {
      navigate("/login")
      return
    }
    navigate("/user")
  }

  // Función para calcular totales del carrito local
  const calculateLocalCartTotals = () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      let totalPrice = 0
      let totalQty = 0

      localCart.forEach((item) => {
        const product = item.productData
        const quantity = item.quantity
        const price = product.price * (1 - (product.discount || 0) / 100)
        totalPrice += price * quantity
        totalQty += quantity
      })

      return { totalPrice, totalQty }
    } catch (error) {
      return { totalPrice: 0, totalQty: 0 }
    }
  }

  // Actualizar totales del carrito local
  useEffect(() => {
    if (!user?._id) {
      setLocalCartTotals(calculateLocalCartTotals())
    }
  }, [user])

  // Escuchar cambios en el carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      if (!user?._id) {
        setLocalCartTotals(calculateLocalCartTotals())
      }
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("localCartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("localCartUpdated", handleCartUpdate)
    }
  }, [user])

  // Determinar qué totales usar
  const getCurrentTotals = () => {
    if (user?._id) {
      if (migrationInProgress) {
        return { totalPrice: 0, totalQty: 0, isMigrating: true }
      }
      return { totalPrice, totalQty, isMigrating: false }
    }
    return { ...localCartTotals, isMigrating: false }
  }

  const currentTotals = getCurrentTotals()
  const totalFinal = currentTotals.totalPrice // Removed + 15 for free shipping

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpenUserMenu(false)
      }
    }

    if (openUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openUserMenu])

  return (
    <header className="h-24 lg:h-20 lg:shadow-sm fixed top-0 left-0 right-0 z-50 flex flex-col justify-center gap-1 bg-white border-b border-gray-200">
      {!(isSearchPage && isMobile) && (
        <div className="w-full flex items-center px-6 justify-between">
          {/* Logo */}
          <div className="h-full">
            <Link to={"/"} className="h-full flex justify-center items-center">
              <img src={logo || "/placeholder.svg"} width={170} height={60} alt="logo" className="hidden lg:block" />
              <img src={logo || "/placeholder.svg"} width={120} height={60} alt="logo" className="lg:hidden" />
            </Link>
          </div>

          {/* Search */}
          <div className="hidden lg:block">
            <Search />
          </div>

          {/* Cuenta y carrito */}
          <div className="">
            {/* Móvil: ícono de usuario */}
            <button className="text-neutral-600 lg:hidden" onClick={handleMobileUser}>
              <FaRegCircleUser size={26} />
            </button>

            {/* Escritorio */}
            <div className="hidden lg:flex items-center gap-6">
              {user?._id ? (
                <div className="relative">
                  {/* Solo mostrar el botón de cuenta si NO estamos en dashboard */}
                  {!isDashboard && (
                    <div
                      ref={buttonRef}
                      onClick={() => setOpenUserMenu((prev) => !prev)}
                      className="flex select-none items-center gap-1 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <p className="font-medium">Cuenta</p>
                      {openUserMenu ? <GoTriangleUp size={20} /> : <GoTriangleDown size={20} />}
                    </div>
                  )}

                  {/* En dashboard, mostrar solo el nombre del usuario */}
                  {isDashboard && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow">
                      {/* Avatar o inicial del usuario */}
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>

                      {/* Nombre y rol */}
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-gray-800">{user.name || "Usuario"}</span>
                        {user.role === "ADMIN" && (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                            ADMIN
                          </span>
                        )}
                      </div>

                      {/* Botón ir al perfil */}
                      <Link
                        onClick={handleCloseUserMenu}
                        to={"/dashboard/profile"}
                        className="ml-2 flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <HiOutlineExternalLink className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={redirectToLoginPage}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}

              {/* Botón carrito mejorado */}
              <button
                onClick={() => setOpenCartSection(true)}
                className={`flex items-center gap-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors shadow-sm ${
                  currentTotals.isMigrating ? "opacity-75" : ""
                }`}
              >
                <div className="relative">
                  <BsCart4 size={20} /> {/* Use BsCart4 */}
                  {/* Badge de cantidad */}
                  {currentTotals.totalQty > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {currentTotals.totalQty > 99 ? "99+" : currentTotals.totalQty}
                    </div>
                  )}
                  {/* Indicador de migración */}
                  {currentTotals.isMigrating && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-3 h-3 animate-pulse"></div>
                  )}
                </div>
                <div className="text-sm">
                  {currentTotals.isMigrating ? (
                    <div>
                      <p className="font-medium">Migrando carrito...</p>
                      <p className="text-green-100 text-xs">Espera un momento</p>
                    </div>
                  ) : currentTotals.totalQty > 0 ? (
                    <div>
                      <p className="font-medium">
                        {currentTotals.totalQty} {currentTotals.totalQty === 1 ? "producto" : "productos"}
                      </p>
                      <p className="text-green-100 text-xs">{DisplayPriceInSoles(totalFinal)}</p>
                    </div>
                  ) : (
                    <p className="font-medium">Mi carrito</p>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search móvil */}
      <div className="w-full px-6 lg:hidden">
        <Search />
      </div>

      {/* Mostrar UserMenu como sidebar SOLO si NO estamos en dashboard */}
      {openUserMenu && !isDashboard && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenUserMenu(false)}></div>
          {/* UserMenu Sidebar - Solo en páginas normales */}
          <UserMenu close={handleCloseUserMenu} isDashboard={false} />
        </div>
      )}

      {/* UserMenu para móvil en dashboard */}
      {openUserMenu && isDashboard && isMobile && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenUserMenu(false)}></div>
          <UserMenu close={handleCloseUserMenu} isDashboard={true} />
        </div>
      )}

      {/* Mostrar carrito */}
      {openCartSection && <DisplayCartItem close={() => setOpenCartSection(false)} />}
    </header>
  )
}

export default Header
