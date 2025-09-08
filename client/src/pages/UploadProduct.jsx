  "use client"

  import { useState } from "react"
  import { FaCloudUploadAlt } from "react-icons/fa"
  import { MdDelete, MdAdd, MdImage, MdInventory, MdWarning } from "react-icons/md"
  import { IoClose } from "react-icons/io5"
  import { FiPackage, FiDollarSign, FiPercent, FiFileText, FiAlertTriangle } from "react-icons/fi"
  import uploadImage from "../utils/UploadImage"
  import Loading from "../components/Loading"
  import ViewImage from "../components/ViewImage"
  import { useSelector } from "react-redux"
  import AddFieldComponent from "../components/AddFieldComponent"
  import Axios from "../utils/Axios"
  import SummaryApi from "../common/SummaryApi"
  import AxiosToastError from "../utils/AxiosToastError"
  import successAlert from "../utils/SuccessAlert"
  import toast from "react-hot-toast"

  const UploadProduct = () => {
    const [data, setData] = useState({
      name: "",
      image: [],
      category: [],
      subCategory: [],
      unit: "",
      stock: "",
      price: "",
      discount: "",
      description: "",
      more_details: {},
      requiresInstallation: false,
    })

    const [errors, setErrors] = useState({})
    const [imageLoading, setImageLoading] = useState(false)
    const [ViewImageURL, setViewImageURL] = useState("")
    const allCategory = useSelector((state) => state.product.allCategory)
    const [selectCategory, setSelectCategory] = useState("")
    const [selectSubCategory, setSelectSubCategory] = useState("")
    const allSubCategory = useSelector((state) => state.product.allSubCategory)
    const [openAddField, setOpenAddField] = useState(false)
    const [fieldName, setFieldName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Configuración de validaciones
    const VALIDATION_RULES = {
      name: {
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s²%./-]+$/,
        required: true,
      },
      description: {
        minLength: 10,
        maxLength: 1000,
        required: true,
      },
      unit: {
        minLength: 1,
        maxLength: 20,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s²%/.-]+$/,
        required: true,
      },
      stock: {
        min: 1,
        max: 999999,
        required: true,
      },
      price: {
        min: 0.01,
        max: 999999.99,
        required: true,
      },
      discount: {
        min: 0,
        max: 99,
        required: false,
      },
      image: {
        minCount: 1,
        maxCount: 10,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      },
      category: {
        minCount: 1,
        maxCount: 5,
      },
    }

    // Función para sanitizar texto
    const sanitizeText = (text) => {
      return text.trimStart().replace(/[<>]/g, "").replace(/\s+/g, " ")
    }

    // Validación en tiempo real mejorada
    const validateField = (name, value) => {
      const rules = VALIDATION_RULES[name]
      if (!rules) return null

      // Sanitizar el valor
      const sanitizedValue =
        name === "unit"
          ? value // no sanitiza para permitir m², 1 unidad, etc.
          : typeof value === "string"
            ? sanitizeText(value)
            : value

      // Campo requerido
      if (rules.required && (!sanitizedValue || sanitizedValue === "")) {
        return `${getFieldLabel(name)} es obligatorio`
      }

      // Validaciones específicas por tipo
      switch (name) {
        case "name":
          if (sanitizedValue.length < rules.minLength) {
            return `El nombre debe tener al menos ${rules.minLength} caracteres`
          }
          if (sanitizedValue.length > rules.maxLength) {
            return `El nombre no puede exceder ${rules.maxLength} caracteres`
          }
          if (!rules.pattern.test(sanitizedValue)) {
            return "El nombre contiene caracteres no permitidos"
          }
          break

        case "description":
          if (sanitizedValue.length < rules.minLength) {
            return `La descripción debe tener al menos ${rules.minLength} caracteres`
          }
          if (sanitizedValue.length > rules.maxLength) {
            return `La descripción no puede exceder ${rules.maxLength} caracteres`
          }
          break

        case "unit":
          if (sanitizedValue.length < rules.minLength) {
            return "La unidad es requerida"
          }
          if (sanitizedValue.length > rules.maxLength) {
            return `La unidad no puede exceder ${rules.maxLength} caracteres`
          }
          if (!rules.pattern.test(sanitizedValue)) {
            return "La unidad solo puede contener letras, números y símbolos como m², %, /, -"
          }
          break

        case "stock":
          const stockNum = Number(sanitizedValue)
          if (isNaN(stockNum) || stockNum < rules.min) {
            return `El stock debe ser al menos ${rules.min} unidad`
          }
          if (stockNum > rules.max) {
            return `El stock no puede exceder ${rules.max} unidades`
          }
          if (!Number.isInteger(stockNum)) {
            return "El stock debe ser un número entero"
          }
          break

        case "price":
          const priceNum = Number(sanitizedValue)
          if (isNaN(priceNum) || priceNum < rules.min) {
            return `El precio debe ser al menos S/ ${rules.min}`
          }
          if (priceNum > rules.max) {
            return `El precio no puede exceder S/ ${rules.max}`
          }
          break

        case "discount":
          if (sanitizedValue !== "") {
            const discountNum = Number(sanitizedValue)
            if (isNaN(discountNum) || discountNum < rules.min) {
              return `El descuento debe ser al menos ${rules.min}%`
            }
            if (discountNum > rules.max) {
              return `El descuento no puede exceder ${rules.max}%`
            }
          }
          break
      }

      return null
    }

    const getFieldLabel = (fieldName) => {
      const labels = {
        name: "El nombre",
        description: "La descripción",
        unit: "La unidad",
        stock: "El stock",
        price: "El precio",
        discount: "El descuento",
      }
      return labels[fieldName] || fieldName
    }

    const handleChange = (e) => {
      const { name, value } = e.target

      // Sanitizar el valor
      let sanitizedValue = typeof value === "string" ? sanitizeText(value) : value

      // Validaciones específicas durante la escritura
      if (name === "stock" || name === "price") {
        // Solo permitir números positivos
        if (value < 0) {
          sanitizedValue = ""
        }
      }

      if (name === "discount") {
        // Limitar descuento entre 0 y 99
        if (value < 0) sanitizedValue = 0
        if (value > 99) sanitizedValue = 99
      }

      // Actualizar datos
      setData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }))

      // Validar campo
      const error = validateField(name, sanitizedValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }

    const validateImageFile = (file) => {
      const rules = VALIDATION_RULES.image

      // Validar tipo de archivo
      if (!rules.allowedTypes.includes(file.type)) {
        return "Solo se permiten imágenes JPG, PNG y WebP"
      }

      // Validar tamaño
      if (file.size > rules.maxSize) {
        return `La imagen no puede exceder ${rules.maxSize / (1024 * 1024)}MB`
      }

      // Validar nombre del archivo
      if (file.name.length > 100) {
        return "El nombre del archivo es muy largo"
      }

      return null
    }

    const handleUploadImage = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Validar límite de imágenes
      if (data.image.length >= VALIDATION_RULES.image.maxCount) {
        toast.error(`Solo puedes subir máximo ${VALIDATION_RULES.image.maxCount} imágenes`)
        return
      }

      // Validar archivo
      const fileError = validateImageFile(file)
      if (fileError) {
        toast.error(fileError)
        return
      }

      setImageLoading(true)
      try {
        const response = await uploadImage(file)
        const { data: ImageResponse } = response
        const imageUrl = ImageResponse.data.url

        // Validar que la URL sea válida
        if (!imageUrl || !imageUrl.startsWith("http")) {
          throw new Error("URL de imagen inválida")
        }

        setData((prev) => ({
          ...prev,
          image: [...prev.image, imageUrl],
        }))

        // Limpiar error de imágenes si existe
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: null }))
        }

        toast.success("Imagen subida correctamente")
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Error al subir la imagen. Inténtalo de nuevo.")
      } finally {
        setImageLoading(false)
        // Limpiar el input
        e.target.value = ""
      }
    }

    const handleDeleteImage = (index) => {
      setData((prev) => ({
        ...prev,
        image: prev.image.filter((_, i) => i !== index),
      }))

      // Validar si queda al menos una imagen
      if (data.image.length <= 1) {
        setErrors((prev) => ({
          ...prev,
          image: "Debe agregar al menos una imagen",
        }))
      }
    }

    const handleRemoveCategory = (index) => {
      const newCategories = data.category.filter((_, i) => i !== index)
      setData((prev) => ({
        ...prev,
        category: newCategories,
      }))

      // Validar si queda al menos una categoría
      if (newCategories.length === 0) {
        setErrors((prev) => ({
          ...prev,
          category: "Debe seleccionar al menos una categoría",
        }))
      }
    }

    const handleRemoveSubCategory = (index) => {
      setData((prev) => ({
        ...prev,
        subCategory: prev.subCategory.filter((_, i) => i !== index),
      }))
    }

    const validateCustomField = (fieldName, value) => {
      const sanitizedName = sanitizeText(fieldName)
      const sanitizedValue = sanitizeText(value)

      if (sanitizedName.length < 2 || sanitizedName.length > 50) {
        return "El nombre del campo debe tener entre 2 y 50 caracteres"
      }

      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(sanitizedName)) {
        return "El nombre del campo solo puede contener letras y espacios"
      }

      if (sanitizedValue && sanitizedValue.length > 200) {
        return "El valor del campo no puede exceder 200 caracteres"
      }

      return null
    }

    const handleAddField = () => {
      const sanitizedFieldName = sanitizeText(fieldName)

      // Validar nombre del campo
      const fieldError = validateCustomField(sanitizedFieldName, "")
      if (fieldError) {
        toast.error(fieldError)
        return
      }

      // Verificar que no exista ya
      if (data.more_details.hasOwnProperty(sanitizedFieldName)) {
        toast.error("Este campo ya existe")
        return
      }

      // Limitar número de campos adicionales
      if (Object.keys(data.more_details).length >= 10) {
        toast.error("Solo puedes agregar máximo 10 campos adicionales")
        return
      }

      setData((prev) => ({
        ...prev,
        more_details: {
          ...prev.more_details,
          [sanitizedFieldName]: "",
        },
      }))
      setFieldName("")
      setOpenAddField(false)
      toast.success("Campo agregado correctamente")
    }

    const validateAllFields = () => {
      const newErrors = {}

      // Validar campos básicos
      Object.keys(VALIDATION_RULES).forEach((fieldName) => {
        if (fieldName === "image" || fieldName === "category") return // Validar por separado

        const error = validateField(fieldName, data[fieldName])
        if (error) {
          newErrors[fieldName] = error
        }
      })

      // Validar imágenes
      if (data.image.length < VALIDATION_RULES.image.minCount) {
        newErrors.image = `Debe agregar al menos ${VALIDATION_RULES.image.minCount} imagen`
      }

      // Validar categorías
      if (data.category.length < VALIDATION_RULES.category.minCount) {
        newErrors.category = `Debe seleccionar al menos ${VALIDATION_RULES.category.minCount} categoría`
      }

      // Validar campos personalizados
      Object.entries(data.more_details).forEach(([key, value]) => {
        const error = validateCustomField(key, value)
        if (error) {
          newErrors[`more_details_${key}`] = error
        }
      })

      // Validaciones de negocio adicionales
      const price = Number(data.price)
      const discount = Number(data.discount)
      if (discount > 0 && price <= 1) {
        newErrors.price = "No se puede aplicar descuento a productos con precio menor a S/ 1.00"
      }

      return newErrors
    }

    const handleSubmit = async (e) => {
      e.preventDefault()

      // Validar todos los campos
      const validationErrors = validateAllFields()
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        toast.error("Por favor corrige los errores antes de continuar")
        // Scroll al primer error
        const firstErrorField = document.querySelector(".border-red-500")
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        return
      }

      // Sanitizar todos los datos antes de enviar
      const sanitizedData = {
        ...data,
        name: sanitizeText(data.name),
        description: sanitizeText(data.description),
        unit: sanitizeText(data.unit),
        stock: Number(data.stock),
        price: Number(data.price),
        discount: data.discount !== "" ? Number(data.discount) : null,
        more_details: Object.fromEntries(
          Object.entries(data.more_details).map(([key, value]) => [sanitizeText(key), sanitizeText(value)]),
        ),
        requiresInstallation: Boolean(data.requiresInstallation),
      }

      try {
        setIsSubmitting(true)
        const response = await Axios({ ...SummaryApi.createProduct, data: sanitizedData })
        if (response.data.success) {
          successAlert(response.data.message)
          // Resetear formulario
          setData({
            name: "",
            image: [],
            category: [],
            subCategory: [],
            unit: "",
            stock: "",
            price: "",
            discount: "",
            description: "",
            more_details: {},
            requiresInstallation: false,
          })
          setErrors({})
          toast.success("Producto creado exitosamente")
        }
      } catch (error) {
        console.error("Error creating product:", error)
        AxiosToastError(error)
      } finally {
        setIsSubmitting(false)
      }
    }

    const hasErrors = Object.keys(errors).some((key) => errors[key])

    return (
      <div className="min-h-screen bg-gray-50 pt-24 lg:pt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 lg:px-8 xl:px-12 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subir Producto</h1>
                <p className="text-sm text-gray-600">Agrega un nuevo producto a tu inventario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de seguridad */}
        {hasErrors && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 lg:mx-8 xl:mx-12 mt-4 rounded-r-lg">
            <div className="flex items-center">
              <FiAlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                Hay errores en el formulario. Por favor revisa y corrige los campos marcados.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="px-6 lg:px-8 xl:px-12 py-6">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información básica */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiFileText className="w-5 h-5" />
                  Información Básica
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 xl:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                      <span className="text-xs text-gray-500 ml-1">
                        (3-100 caracteres, solo letras, números y símbolos básicos)
                      </span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Ingrese el nombre del producto"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.name ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{data.name.length}/100 caracteres</p>
                  </div>

                  <div className="lg:col-span-2 xl:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción *<span className="text-xs text-gray-500 ml-1">(10-1000 caracteres)</span>
                    </label>
                    <textarea
                      id="description"
                      placeholder="Describe detalladamente el producto, sus características y beneficios"
                      name="description"
                      value={data.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      maxLength={1000}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white resize-none transition-colors ${
                        errors.description ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{data.description.length}/1000 caracteres</p>
                  </div>

                  <div className="xl:col-span-1">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad de Medida *<span className="text-xs text-gray-500 ml-1">(ej: kg, unidad, litro, metro)</span>
                    </label>
                    <input
                      id="unit"
                      type="text"
                      placeholder="ej: kg, unidad, litro"
                      name="unit"
                      value={data.unit}
                      onChange={handleChange}
                      maxLength={20}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors ${
                        errors.unit ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.unit && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.unit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MdImage className="w-5 h-5" />
                  Imágenes del Producto *
                  <span className="text-xs text-gray-500 font-normal">
                    (Mínimo 1, máximo {VALIDATION_RULES.image.maxCount} imágenes - JPG, PNG, WebP - Máximo 5MB c/u)
                  </span>
                </h2>

                <div className="space-y-4">
                  <label htmlFor="productImage" className="block">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer ${
                        errors.image ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      {imageLoading ? (
                        <Loading />
                      ) : (
                        <div className="space-y-2">
                          <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-gray-600 font-medium">Haz clic para subir imágenes</p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, WebP hasta 5MB ({data.image.length}/{VALIDATION_RULES.image.maxCount})
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="productImage"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleUploadImage}
                      disabled={data.image.length >= VALIDATION_RULES.image.maxCount}
                    />
                  </label>

                  {errors.image && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <MdWarning className="w-4 h-4" />
                      {errors.image}
                    </p>
                  )}

                  {data.image.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                      {data.image.map((img, index) => (
                        <div key={img + index} className="relative group">
                          <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Producto ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setViewImageURL(img)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Categorías */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Categorización</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías *
                      <span className="text-xs text-gray-500 ml-1">
                        (Mínimo 1, máximo {VALIDATION_RULES.category.maxCount})
                      </span>
                    </label>
                    <select
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${
                        errors.category ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      value={selectCategory}
                      onChange={(e) => {
                        const value = e.target.value
                        const category = allCategory.find((el) => el._id === value)
                        if (category && !data.category.find((c) => c._id === category._id)) {
                          if (data.category.length >= VALIDATION_RULES.category.maxCount) {
                            toast.error(`Solo puedes seleccionar máximo ${VALIDATION_RULES.category.maxCount} categorías`)
                            return
                          }
                          setData((prev) => ({
                            ...prev,
                            category: [...prev.category, category],
                          }))
                          // Limpiar error si existe
                          if (errors.category) {
                            setErrors((prev) => ({ ...prev, category: null }))
                          }
                        }
                        setSelectCategory("")
                      }}
                      disabled={data.category.length >= VALIDATION_RULES.category.maxCount}
                    >
                      <option value="">Seleccionar Categoría</option>
                      {allCategory
                        .filter((c) => !data.category.find((selected) => selected._id === c._id))
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                    </select>

                    {errors.category && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.category}
                      </p>
                    )}

                    {data.category.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {data.category.map((c, index) => (
                          <span
                            key={c._id + index}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {c.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(index)}
                              className="hover:text-blue-600"
                            >
                              <IoClose className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategorías
                      <span className="text-xs text-gray-500 ml-1">(Opcional)</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      value={selectSubCategory}
                      onChange={(e) => {
                        const value = e.target.value
                        const subCategory = allSubCategory.find((el) => el._id === value)
                        if (subCategory && !data.subCategory.find((sc) => sc._id === subCategory._id)) {
                          setData((prev) => ({
                            ...prev,
                            subCategory: [...prev.subCategory, subCategory],
                          }))
                        }
                        setSelectSubCategory("")
                      }}
                    >
                      <option value="">Seleccionar Subcategoría</option>
                      {allSubCategory
                        .filter((c) => !data.subCategory.find((selected) => selected._id === c._id))
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                    </select>

                    {data.subCategory.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {data.subCategory.map((c, index) => (
                          <span
                            key={c._id + index}
                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {c.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubCategory(index)}
                              className="hover:text-purple-600"
                            >
                              <IoClose className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventario y Precios */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MdInventory className="w-5 h-5" />
                  Inventario y Precios
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPackage className="inline w-4 h-4 mr-1" />
                      Stock Inicial *<span className="text-xs text-gray-500 ml-1">(Mínimo 1 unidad)</span>
                    </label>
                    <input
                      id="stock"
                      type="number"
                      placeholder="1"
                      name="stock"
                      value={data.stock}
                      onChange={handleChange}
                      min="1"
                      max="999999"
                      step="1"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.stock ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.stock && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.stock}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">No se permiten productos sin stock</p>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      <FiDollarSign className="inline w-4 h-4 mr-1" />
                      Precio de Venta *<span className="text-xs text-gray-500 ml-1">(Mínimo S/ 0.01)</span>
                    </label>
                    <input
                      id="price"
                      type="number"
                      placeholder="0.01"
                      name="price"
                      value={data.price}
                      onChange={handleChange}
                      min="0.01"
                      max="999999.99"
                      step="0.01"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.price ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.price && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">No se permiten productos gratuitos</p>
                  </div>

                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPercent className="inline w-4 h-4 mr-1" />
                      Descuento (%)
                      <span className="text-xs text-gray-500 ml-1">(0-99%, opcional)</span>
                    </label>
                    <input
                      id="discount"
                      type="number"
                      placeholder="0"
                      name="discount"
                      value={data.discount}
                      min="0"
                      max="99"
                      step="1"
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.discount ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.discount && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <MdWarning className="w-4 h-4" />
                        {errors.discount}
                      </p>
                    )}
                    {data.price && data.discount && (
                      <p className="text-xs text-green-600 mt-1">
                        Precio final: S/ {(Number(data.price) * (1 - Number(data.discount) / 100)).toFixed(2)}
                      </p>
                    )}
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start gap-3">
                        <input
                          id="requiresInstallation"
                          type="checkbox"
                          checked={data.requiresInstallation}
                          onChange={(e) => setData((prev) => ({ ...prev, requiresInstallation: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="requiresInstallation"
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            ¿Este producto requiere instalación profesional?
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            Marque esta opción si el producto necesita instalación especializada. Los clientes podrán
                            elegir si desean incluir el servicio de instalación al comprarlo.
                          </p>
                          {data.requiresInstallation && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                              ✓ Los clientes verán la opción "Incluir instalación" al agregar este producto al carrito
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos adicionales */}
              {Object.keys(data.more_details).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Detalles Adicionales ({Object.keys(data.more_details).length}/10)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Object.keys(data.more_details).map((key) => (
                      <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-2">
                          {key}
                          <button
                            type="button"
                            onClick={() => {
                              const newDetails = { ...data.more_details }
                              delete newDetails[key]
                              setData((prev) => ({ ...prev, more_details: newDetails }))
                            }}
                            className="ml-3 text-red-500 hover:text-red-700"
                          >
                            <IoClose className="w-4 h-4 inline" />
                          </button>
                        </label>
                        <input
                          id={key}
                          type="text"
                          maxLength={200}
                          value={data.more_details[key]}
                          onChange={(e) => {
                            const value = sanitizeText(e.target.value)
                            setData((prev) => ({
                              ...prev,
                              more_details: {
                                ...prev.more_details,
                                [key]: value,
                              },
                            }))
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">{data.more_details[key].length}/200 caracteres</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button
                    type="button"
                    onClick={() => setOpenAddField(true)}
                    disabled={Object.keys(data.more_details).length >= 10}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-primary-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdAdd className="w-5 h-5" />
                    Agregar Campo ({Object.keys(data.more_details).length}/10)
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || hasErrors}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Creando Producto...
                      </>
                    ) : (
                      <>
                        <FiPackage className="w-5 h-5" />
                        Crear Producto
                      </>
                    )}
                  </button>
                </div>

                {hasErrors && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <MdWarning className="w-4 h-4" />
                      Corrige los errores antes de crear el producto
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Modales */}
        {ViewImageURL && <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />}

        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </div>
    )
  }

  export default UploadProduct
