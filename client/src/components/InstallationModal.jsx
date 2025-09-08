import { useState, useEffect } from "react"
import { X, Wrench, Clock, Shield, CheckCircle, Star, Truck } from "lucide-react"

const InstallationModal = ({ isOpen, onClose, productName, currentSelection, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (isOpen) {
      console.log("[v0] Modal abierto con selección actual:", currentSelection)
      setSelectedOption(currentSelection ? "with" : "without")
    }
  }, [isOpen, currentSelection])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedOption) {
      const withInstallation = selectedOption === "with"
      console.log("[v0] Confirmando selección:", withInstallation)
      onConfirm(withInstallation)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedOption(currentSelection ? "with" : "without")
    onClose()
  }

  const renderCurrentSelection = () => {
    if (selectedOption === "with") {
      return (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Selección actual: Con instalación
        </div>
      )
    } else if (selectedOption === "without") {
      return (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Selección actual: Sin instalación
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative transform animate-in zoom-in-95 duration-300 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl p-6 border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-2 transition-all duration-200 hover:rotate-90"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Servicio de Instalación</h2>
            <p className="text-gray-600 font-medium line-clamp-2">{productName}</p>
            <p className="text-sm text-gray-500 mt-2">Elige la opción que mejor se adapte a tus necesidades</p>
            {renderCurrentSelection()}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Con instalación */}
            <div
              className={`flex-1 border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOption === "with"
                  ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-2 ring-green-200"
                  : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedOption("with")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                    selectedOption === "with"
                      ? "border-green-500 bg-green-500 shadow-sm scale-110"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {selectedOption === "with" && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">Instalación Profesional</h3>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Star size={10} />
                      RECOMENDADO
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Nuestros técnicos certificados instalarán el producto en tu hogar con garantía completa
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Shield size={14} />
                      <span className="font-medium">Garantía 2 meses</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <Clock size={14} />
                      <span className="font-medium">24-48 horas</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                      <CheckCircle size={14} />
                      <span className="font-medium">Técnico certificado</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <Truck size={14} />
                      <span className="font-medium">Envío incluido</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sin instalación */}
            <div
              className={`flex-1 border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOption === "without"
                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedOption("without")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                    selectedOption === "without"
                      ? "border-blue-500 bg-blue-500 shadow-sm scale-110"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {selectedOption === "without" && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Solo el Producto</h3>
                  <p className="text-gray-600 mb-3">
                    Recibirás únicamente el producto para instalación por cuenta propia
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <CheckCircle size={14} />
                    <span>Incluye manual de instalación detallado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedOption}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg ${
                selectedOption
                  ? "bg-gradient-to-r from-green-600 to-green-600 text-white hover:from-green-700 hover:to-green-700 hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedOption ? "Confirmar Selección" : "Selecciona una opción"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallationModal
