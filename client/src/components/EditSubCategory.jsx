import React, { useState } from 'react'
import { IoClose, IoImageOutline, IoLayersOutline, IoCheckmarkCircle } from "react-icons/io5";
import { MdCategory, MdCloudUpload } from "react-icons/md";
import uploadImage from '../utils/UploadImage';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const EditSubCategory = ({ close, data, fetchData }) => {
  const [subCategoryData, setSubCategoryData] = useState({
    _id : data._id,
    name: data.name,
    image: data.image,
    category: data.category || []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const allCategory = useSelector(state => state.product.allCategory)

  const handleChange = (e) => {
    const { name, value } = e.target

    setSubCategoryData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    setImageUploading(true)
    try {
      const response = await uploadImage(file)
      const { data: ImageResponse } = response

      setSubCategoryData((preve) => {
        return {
          ...preve,
          image: ImageResponse.data.url
        }
      })
    } catch (error) {
      toast.error('Error al subir la imagen')
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveCategorySelected = (categoryId) => {
    const index = subCategoryData.category.findIndex(el => el._id === categoryId)
    subCategoryData.category.splice(index, 1)
    setSubCategoryData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleSubmitSubCategory = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await Axios({
        ...SummaryApi.updateSubCategory,
        data: subCategoryData
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (close) {
          close()
        }
        if (fetchData) {
          fetchData()
        }
      }

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = subCategoryData?.name && subCategoryData?.image && subCategoryData?.category[0]

  return (
    <section className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg'>
                <IoLayersOutline className='text-white text-xl' />
              </div>
              <h1 className='text-xl font-bold text-white'>Editar Subcategoría</h1>
            </div>
            <button 
              onClick={close}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors duration-200'
            >
              <IoClose className='text-white text-xl' />
            </button>
          </div>
        </div>

        {/* Form */}
        <form className='p-6 space-y-6' onSubmit={handleSubmitSubCategory}>
          {/* Nombre */}
          <div className='space-y-2'>
            <label htmlFor='name' className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdCategory className='text-blue-500' />
              Nombre de la Subcategoría
            </label>
            <div className='relative'>
              <input
                id='name'
                name='name'
                value={subCategoryData.name}
                onChange={handleChange}
                placeholder='Ingresa el nombre de la subcategoría'
                className='w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800'
              />
              {subCategoryData.name && (
                <IoCheckmarkCircle className='absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-xl' />
              )}
            </div>
          </div>

          {/* Imagen */}
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <IoImageOutline className='text-purple-500' />
              Imagen de la Subcategoría
            </label>
            <div className='flex flex-col lg:flex-row items-start gap-4'>
              <div className='relative w-full lg:w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors duration-200'>
                {!subCategoryData.image ? (
                  <div className='text-center'>
                    <IoImageOutline className='text-4xl text-gray-400 mx-auto mb-2' />
                    <p className='text-sm text-gray-500'>Sin imagen</p>
                  </div>
                ) : (
                  <img
                    alt='subcategory'
                    src={subCategoryData.image || "/placeholder.svg"}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                  />
                )}
                {imageUploading && (
                  <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                  </div>
                )}
              </div>
              
              <label htmlFor='uploadSubCategoryImage' className='cursor-pointer'>
                <div className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                  <MdCloudUpload className='text-xl' />
                  {imageUploading ? 'Subiendo...' : 'Subir Imagen'}
                </div>
                <input
                  type='file'
                  id='uploadSubCategoryImage'
                  className='hidden'
                  onChange={handleUploadSubCategoryImage}
                  accept='image/*'
                />
              </label>
            </div>
          </div>

          {/* Categorías */}
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdCategory className='text-green-500' />
              Categorías Asociadas
            </label>
            
            <div className='border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors duration-200'>
              {/* Categorías seleccionadas */}
              {subCategoryData.category.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-3'>
                  {subCategoryData.category.map((cat) => (
                    <div 
                      key={cat._id + "selectedValue"} 
                      className='flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-lg border border-blue-200 shadow-sm'
                    >
                      <span className='font-medium'>{cat.name}</span>
                      <button
                        type='button'
                        className='hover:bg-red-100 hover:text-red-600 p-1 rounded-full transition-colors duration-200'
                        onClick={() => handleRemoveCategorySelected(cat._id)}
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector de categorías */}
              <select
                className='w-full p-3 bg-transparent outline-none border border-gray-200 rounded-lg focus:border-blue-500 transition-colors duration-200'
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const categoryDetails = allCategory.find(el => el._id === value)
                    const isAlreadySelected = subCategoryData.category.some(cat => cat._id === value)
                    
                    if (!isAlreadySelected && categoryDetails) {
                      setSubCategoryData((preve) => ({
                        ...preve,
                        category: [...preve.category, categoryDetails]
                      }))
                    }
                  }
                }}
                value=""
              >
                <option value="">Seleccionar Categoría</option>
                {allCategory.map((category) => (
                  <option 
                    value={category?._id} 
                    key={category._id + "subcategory"}
                    disabled={subCategoryData.category.some(cat => cat._id === category._id)}
                  >
                    {category?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type='submit'
            disabled={!isFormValid || isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
              isFormValid && !isLoading
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                Actualizando...
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <IoCheckmarkCircle className='text-xl' />
                Actualizar Subcategoría
              </div>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export default EditSubCategory
