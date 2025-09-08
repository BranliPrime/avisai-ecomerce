import { useState } from "react"
import { IoClose, IoWarning, IoCheckmarkCircle } from "react-icons/io5"
import { FaPlus } from "react-icons/fa"

const AddFieldComponent = ({ close, value, onChange, submit, currentCount, existingFields = [] }) => {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateFieldName = (fieldName) => {
    if (!fieldName || fieldName.trim().length === 0) {
      return "El nombre del campo es obligatorio"
    }
    if (fieldName.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres"
    }
    if (fieldName.trim().length > 50) {
      return "El nombre no puede exceder 50 caracteres"
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fieldName.trim())) {
      return "Solo se permiten letras y espacios"
    }
    if (existingFields.includes(fieldName.trim().toLowerCase())) {
      return "Este campo ya existe"
    }
    return ""
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(e)

    const validationError = validateFieldName(newValue)
    setError(validationError)
  }

  const handleSubmit = async () => {
    if (currentCount >= 10) {
      setError("Solo puedes agregar un máximo de 10 campos")
      return
    }

    const validationError = validateFieldName(value)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await submit()
      setError("")
    } catch (err) {
      setError("Error al agregar el campo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !error && value.trim()) {
      handleSubmit()
    }
  }

  return (
    <section className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaPlus size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agregar Campo</h1>
                <p className="text-blue-100 text-sm">Personaliza tu producto</p>
              </div>
            </div>
            <button onClick={close} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="fieldName" className="block text-sm font-semibold text-gray-700">
              Nombre del Campo
            </label>
            <input
              id="fieldName"
              type="text"
              placeholder="Ej: Material, Color, Tamaño"
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={50}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                error
                  ? "border-red-300 bg-red-50 focus:border-red-500"
                  : value.trim() && !error
                    ? "border-green-300 bg-green-50 focus:border-green-500"
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-blue-50"
              }`}
              autoFocus
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">{value.length}/50 caracteres</span>
              {value.trim() && !error && (
                <span className="text-green-600 flex items-center gap-1">
                  <IoCheckmarkCircle size={14} />
                  Válido
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-4 flex items-start gap-3">
              <IoWarning className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
              <div>
                {/* <p className="text-red-800 font-medium text-sm"></p> */}
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Campos agregados</span>
              <span className={`text-sm font-bold ${currentCount >= 8 ? "text-red-600" : "text-blue-600"}`}>
                {currentCount}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentCount >= 8 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${(currentCount / 10) * 100}%` }}
              ></div>
            </div>
            {currentCount >= 8 && <p className="text-xs text-red-600 mt-2">⚠️ Te estás acercando al límite</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={close}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentCount >= 10 || !!error || !value.trim() || isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                currentCount >= 10 || !!error || !value.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Agregando...
                </>
              ) : (
                <>
                  <FaPlus size={16} />
                  Agregar Campo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddFieldComponent
