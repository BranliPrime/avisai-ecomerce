import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { FaRegUserCircle, FaCamera, FaUser, FaEnvelope, FaPhone, FaCheck } from "react-icons/fa"
import UserProfileAvatarEdit from "../components/UserProfileAvatarEdit"
import Axios from "../utils/Axios"
import SummaryApi from "../common/SummaryApi"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { setUserDetails } from "../store/userSlice"
import fetchUserDetails from "../utils/fetchUserDetails"

const Profile = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm({ mode: "onChange" })

  const watchedValues = watch()

  useEffect(() => {
    reset({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
    })
  }, [user, reset])

  const hasChanges = useMemo(() => {
    return (
      watchedValues.name !== user.name ||
      watchedValues.email !== user.email ||
      watchedValues.mobile !== user.mobile
    )
  }, [watchedValues, user])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.updateUserDetails,
        data,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        const userDataResponse = await fetchUserDetails()
        dispatch(setUserDetails(userDataResponse.data))
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-20 relative">
      {openProfileAvatarEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Mi Perfil</h1>
          <p className="text-gray-600 text-lg">Gestiona tu información personal</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center rounded-full overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105">
                    {user.avatar ? (
                      <img
                        alt={user.name}
                        src={user.avatar || "/placeholder.svg"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaRegUserCircle size={80} className="text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => setProfileAvatarEdit(true)}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label="Editar avatar"
                  >
                    <FaCamera size={16} />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-6 text-center">{user.name || "Usuario"}</h2>
                <p className="text-gray-600 text-base mt-1 text-center">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid md:grid-cols-1 gap-8">
                  {/* Nombre */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-base font-semibold text-gray-700">
                      <FaUser className="text-gray-500" size={16} />
                      Nombre completo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ingrese su nombre completo"
                        className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 ${
                          errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        {...register("name", {
                          required: "El nombre es obligatorio",
                          pattern: {
                            value: /^[a-zA-ZÀ-ÿ\s]+$/,
                            message: "El nombre solo puede contener letras y espacios",
                          },
                        })}
                      />
                      {!errors.name && watchedValues.name?.length > 0 && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white" size={12} />
                        </div>
                      )}
                    </div>
                    {errors.name && <p className="text-red-500 text-sm font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-base font-semibold text-gray-700">
                      <FaEnvelope className="text-gray-500" size={16} />
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 ${
                          errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        {...register("email", {
                          required: "El correo es obligatorio",
                          pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Formato de correo inválido",
                          },
                        })}
                      />
                      {!errors.email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(watchedValues.email) && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white" size={12} />
                        </div>
                      )}
                    </div>
                    {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-base font-semibold text-gray-700">
                      <FaPhone className="text-gray-500" size={16} />
                      Número de teléfono
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="987 654 321"
                        className={`w-full px-4 py-4 bg-white border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 ${
                          errors.mobile ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        {...register("mobile", {
                          required: "El teléfono es obligatorio",
                          pattern: {
                            value: /^\d+$/,
                            message: "El teléfono solo debe contener números",
                          },
                          minLength: {
                            value: 8,
                            message: "El teléfono debe tener al menos 8 dígitos",
                          },
                          maxLength: {
                            value: 15,
                            message: "El teléfono no puede tener más de 15 dígitos",
                          },
                        })}
                      />
                      {!errors.mobile && /^\d{8,15}$/.test(watchedValues.mobile) && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white" size={12} />
                        </div>
                      )}
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm font-medium">{errors.mobile.message}</p>}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || !isValid || !hasChanges}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Guardando...
                      </span>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </button>
                  <button
                    type="button"
                    className="sm:w-auto bg-gray-400 hover:bg-gray-500 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 text-lg"
                    onClick={() => reset()}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
