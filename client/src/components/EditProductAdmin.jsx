import React, { useState } from 'react'
import { FaCloudUploadAlt, FaTag, FaBoxes, FaDollarSign, FaPercentage, FaRulerCombined, FaAlignLeft } from "react-icons/fa";
import { MdInventory, MdDescription, MdCategory, MdSubdirectoryArrowRight } from "react-icons/md";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  // Estado inicial del producto a editar (recibido desde props)
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
  })
  // Estado para errores del formulario
  const [formErrors, setFormErrors] = useState({})
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")

  // Función que valida un campo individual y retorna el mensaje de error (o cadena vacía si es válido)
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
        return "";
      case 'description':
        if (!value || value.trim().length < 10) return "La descripción debe tener al menos 10 caracteres";
        return "";
      case 'unit':
        if (!value || value.trim() === "") return "La unidad es obligatoria";
        return "";
      case 'stock':
        if (value === "" || Number(value) <= 0) return "La cantidad en stock debe ser un número positivo";
        return "";
      case 'price':
        if (value === "" || Number(value) <= 0) return "El precio debe ser mayor a 0";
        return "";
      case 'discount':
        if (value === "" || value === null || value === undefined) return ""
        const discountValue = Number(value);
        return value !== '' && (isNaN(discountValue) || discountValue <= 1 || discountValue > 100) ? 'El descuento debe estar entre 1 y 100' : '';
    }
  }

  // Maneja el cambio en los campos y valida simultáneamente el valor ingresado
  const handleChange = (e) => {
    const { name, value } = e.target

    if (value < 0) {
      console.error("El valor debe ser un numero positivo")
      return;
    }

    setData((prev) => ({
      ...prev,
      [name]: value
    }))

    const errorMsg = validateField(name, value)
    setFormErrors(prev => {
      const nuevosErrores = { ...prev }
      if (errorMsg) {
        nuevosErrores[name] = errorMsg
      } else {
        delete nuevosErrores[name]
      }
      return nuevosErrores
    })
  }

  // Maneja la carga de imágenes
  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    const imageUrl = ImageResponse.data.url
    setData((prev) => ({
      ...prev,
      image: [...prev.image, imageUrl]
    }))
    setImageLoading(false)
  }

  // Elimina una imagen de la lista
  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Elimina una categoría de la lista
  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Elimina una subcategoría de la lista
  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Agrega un campo adicional en "more_details"
  const handleAddField = () => {
    setData((prev) => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: ""
      }
    }))
    setFieldName("")
    setOpenAddField(false)
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validar todos los campos
    const errors = {}
    errors.name = validateField('name', data.name)
    errors.description = validateField('description', data.description)
    errors.unit = validateField('unit', data.unit)
    errors.stock = validateField('stock', data.stock)
    errors.price = validateField('price', data.price)
    errors.discount = validateField('discount', data.discount)

    // Filtrar campos sin error (cadena vacía)
    Object.keys(errors).forEach(key => {
      if (errors[key] === "") delete errors[key]
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // Enfoca el primer campo con error
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementsByName(firstErrorField)[0]
      if (element) element.focus()
      setIsSubmitting(false)
      return
    }
    
    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data
      })
      const { data: responseData } = response
      if (responseData.success) {
        successAlert(responseData.message)
        if (close) {
          close()
        }
        fetchProductData()
        // Reinicia los datos después de actualizar
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
        })
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center'>
      <div className='bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col'>
        {/*  Header mejorado con gradiente y mejor diseño */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-white/20 p-2 rounded-lg'>
              <FaBoxes size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Editar Producto</h2>
              <p className='text-blue-100 text-sm'>Actualiza la información del producto</p>
            </div>
          </div>
          <button 
            onClick={close}
            className='bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors'
          >
            <IoClose size={24} />
          </button>
        </div>

        {/*  Contenido con scroll mejorado */}
        <div className='flex-1 overflow-y-auto p-6'>
          <form className='space-y-8' onSubmit={handleSubmit}>
            {/*  Información básica en grid responsive */}
            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <MdDescription className='text-blue-600' />
                Información Básica
              </h3>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label htmlFor='name' className='flex items-center gap-2 font-medium text-gray-700'>
                    <FaTag className='text-blue-500' />
                    Nombre del Producto
                  </label>
                  <input
                    id='name'
                    type='text'
                    placeholder='Ingrese el nombre del producto'
                    name='name'
                    value={data.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      formErrors.name 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-blue-50'
                    }`}
                  />
                  {formErrors.name && (
                    <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                      {formErrors.name}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <label htmlFor='unit' className='flex items-center gap-2 font-medium text-gray-700'>
                    <FaRulerCombined className='text-green-500' />
                    Unidad
                  </label>
                  <input
                    id='unit'
                    type='text'
                    placeholder='Ej: kg, unidad, litro'
                    name='unit'
                    value={data.unit}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      formErrors.unit 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-blue-50'
                    }`}
                  />
                  {formErrors.unit && (
                    <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                      {formErrors.unit}
                    </div>
                  )}
                </div>
              </div>

              <div className='mt-6 space-y-2'>
                <label htmlFor='description' className='flex items-center gap-2 font-medium text-gray-700'>
                  <FaAlignLeft className='text-purple-500' />
                  Descripción
                </label>
                <textarea
                  id='description'
                  placeholder='Describe las características principales del producto'
                  name='description'
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none resize-none ${
                    formErrors.description 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-blue-50'
                  }`}
                />
                {formErrors.description && (
                  <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                    {formErrors.description}
                  </div>
                )}
              </div>
            </div>

            {/*  Sección de imágenes mejorada */}
            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <FaCloudUploadAlt className='text-indigo-600' />
                Imágenes del Producto
              </h3>
              <div className='space-y-4'>
                <label htmlFor='productImage' className='block'>
                  <div className='border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white hover:bg-indigo-50'>
                    {imageLoading ? (
                      <div className='flex flex-col items-center gap-2'>
                        <Loading />
                        <p className='text-gray-600'>Subiendo imagen...</p>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center gap-3'>
                        <div className='bg-indigo-100 p-4 rounded-full'>
                          <FaCloudUploadAlt size={32} className='text-indigo-600' />
                        </div>
                        <div>
                          <p className='text-lg font-medium text-gray-700'>Subir Nueva Imagen</p>
                          <p className='text-sm text-gray-500'>PNG, JPG hasta 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type='file'
                    id='productImage'
                    className='hidden'
                    accept='image/*'
                    onChange={handleUploadImage}
                  />
                </label>

                {/*  Grid de imágenes mejorado */}
                {data.image.length > 0 && (
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                    {data.image.map((img, index) => (
                      <div key={img + index} className='relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-indigo-300 transition-colors'>
                        <div className='aspect-square'>
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Producto ${index + 1}`}
                            className='w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform'
                            onClick={() => setViewImageURL(img)}
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => handleDeleteImage(index)}
                          className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/*  Categorías y subcategorías mejoradas */}
            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <MdCategory className='text-orange-600' />
                Categorización
              </h3>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <label className='flex items-center gap-2 font-medium text-gray-700'>
                    <MdCategory className='text-orange-500' />
                    Categorías
                  </label>
                  <select
                    className='w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-orange-50 transition-all'
                    value={selectCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const category = allCategory.find(el => el._id === value)
                      if (category && !data.category.find(c => c._id === category._id)) {
                        setData((prev) => ({
                          ...prev,
                          category: [...prev.category, category],
                        }))
                      }
                      setSelectCategory("")
                    }}
                  >
                    <option value="">Seleccione una categoría</option>
                    {allCategory.map((c, index) => (
                      <option key={c?._id + index} value={c?._id}>{c.name}</option>
                    ))}
                  </select>
                  <div className='flex flex-wrap gap-2'>
                    {data.category.map((c, index) => (
                      <div key={c._id + index} className='bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-orange-200 transition-colors'>
                        <span className='font-medium'>{c.name}</span>
                        <button
                          type='button'
                          className='hover:text-red-600 transition-colors'
                          onClick={() => handleRemoveCategory(index)}
                        >
                          <IoClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='space-y-3'>
                  <label className='flex items-center gap-2 font-medium text-gray-700'>
                    <MdSubdirectoryArrowRight className='text-teal-500' />
                    Subcategorías
                  </label>
                  <select
                    className='w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-teal-50 transition-all'
                    value={selectSubCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const subCategory = allSubCategory.find(el => el._id === value)
                      if (subCategory && !data.subCategory.find(sc => sc._id === subCategory._id)) {
                        setData((prev) => ({
                          ...prev,
                          subCategory: [...prev.subCategory, subCategory]
                        }))
                      }
                      setSelectSubCategory("")
                    }}
                  >
                    <option value="">Seleccione una subcategoría</option>
                    {allSubCategory.map((c, index) => (
                      <option key={c?._id + index} value={c?._id}>{c.name}</option>
                    ))}
                  </select>
                  <div className='flex flex-wrap gap-2'>
                    {data.subCategory.map((c, index) => (
                      <div key={c._id + index} className='bg-teal-100 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-teal-200 transition-colors'>
                        <span className='font-medium'>{c.name}</span>
                        <button
                          type='button'
                          className='hover:text-red-600 transition-colors'
                          onClick={() => handleRemoveSubCategory(index)}
                        >
                          <IoClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/*  Información comercial en grid */}
            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                <FaDollarSign className='text-green-600' />
                Información Comercial
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='space-y-2'>
                  <label htmlFor='stock' className='flex items-center gap-2 font-medium text-gray-700'>
                    <MdInventory className='text-blue-500' />
                    Stock
                  </label>
                  <input
                    id='stock'
                    type='number'
                    placeholder='Cantidad disponible'
                    name='stock'
                    value={data.stock}
                    onChange={handleChange}
                    required
                    min='0'
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      formErrors.stock 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-blue-50'
                    }`}
                  />
                  {formErrors.stock && (
                    <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                      {formErrors.stock}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <label htmlFor='price' className='flex items-center gap-2 font-medium text-gray-700'>
                    <FaDollarSign className='text-green-500' />
                    Precio (S/)
                  </label>
                  <input
                    id='price'
                    type='number'
                    placeholder='0.00'
                    name='price'
                    min='0'
                    step='0.01'
                    value={data.price}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      formErrors.price 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 bg-white focus:border-green-500 focus:bg-green-50'
                    }`}
                  />
                  {formErrors.price && (
                    <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                      {formErrors.price}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <label htmlFor='discount' className='flex items-center gap-2 font-medium text-gray-700'>
                    <FaPercentage className='text-red-500' />
                    Descuento (%) (Opcional)
                  </label>
                  <input
                    id='discount'
                    type='number'
                    placeholder='0'
                    name='discount'
                    value={data.discount}
                    onChange={handleChange}
                    min='0'
                    max='100'
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      formErrors.discount 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 bg-white focus:border-red-500 focus:bg-red-50'
                    }`}
                  />
                  {formErrors.discount && (
                    <div className='bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm'>
                      {formErrors.discount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/*  Campos adicionales mejorados */}
            {Object.keys(data.more_details).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Detalles Adicionales ({Object.keys(data.more_details).length}/10)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.keys(data.more_details).map((key) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-xl font-semibold text-gray-700 mb-2">
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
                          <IoClose className="w-7 h-7 inline" />
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

            {/*  Botones de acción mejorados */}
            <div className='flex flex-col sm:flex-row gap-4 pt-6'>
              <button
                type='button'
                onClick={() => setOpenAddField(true)}
                className='flex items-center justify-center gap-2 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105'
              >
                <span>+</span>
                Agregar Campo
              </button>
              
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FaBoxes />
                    Actualizar Producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modales */}
        {ViewImageURL && (
          <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
        )}
        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </div>
    </section>
  )
}

export default EditProductAdmin
