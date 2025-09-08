import React, { useState } from 'react'
import { IoClose, IoText, IoImage, IoCloudUpload, IoCheckmarkCircle } from "react-icons/io5";
import { useForm } from 'react-hook-form'
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError';

const EditCategory = ({ close, fetchData, data: CategoryData }) => {
  const [imageUrl, setImageUrl] = useState(CategoryData.image || '')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch, setError, clearErrors } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: CategoryData.name
    }
  })

  const onSubmit = async (data) => {
    if (!imageUrl) {
      setError('image', { type: 'manual', message: 'Debe subir una imagen' })
      return
    }

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.updateCategory,
        data: { _id: CategoryData._id, name: data.name, image: imageUrl }
      })

      if (response.data.success) {
        toast.success(response.data.message)
        close()
        fetchData()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadCategoryImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    setImageLoading(false)

    setImageUrl(ImageResponse.data.url)
    clearErrors('image')
  }

  return (
    <section className='fixed inset-0 p-4 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200'>
      <div className='bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300'>

        <div className='bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg'>
                <IoImage size={20} />
              </div>
              <h1 className='text-xl font-bold'>Actualizar Categoría</h1>
            </div>
            <button 
              onClick={close} 
              className='p-2 hover:bg-white/20 rounded-lg transition-colors duration-200'
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>


        <form className='p-6 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-2'>
            <label htmlFor='categoryName' className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <IoText className='text-blue-600' size={16} />
              Nombre de la Categoría
            </label>
            <div className='relative'>
              <input
                type='text'
                id='categoryName'
                placeholder='Ingrese el nombre de la categoría'
                className={`w-full px-4 py-3 pl-10 border-2 rounded-xl transition-all duration-200 outline-none ${
                  errors.name 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200'
                }`}
                {...register('name', {
                  required: 'El nombre es obligatorio',
                  pattern: {
                    value: /.*/,
                    message: 'El nombre no puede estar vacio'
                  }
                })}
              />
              <IoText className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} size={18} />
            </div>
            {errors.name && (
              <div className='flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg'>
                <span className='text-red-500'>⚠</span>
                {errors.name.message}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <IoImage className='text-blue-600' size={16} />
              Imagen de la Categoría
            </label>
            
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className={`relative border-2 border-dashed rounded-xl h-40 flex items-center justify-center transition-all duration-200 ${
                errors.image 
                  ? 'border-red-300 bg-red-50' 
                  : imageUrl 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
              }`}>
                {imageUrl ? (
                  <div className='relative w-full h-full'>
                    <img 
                      alt='category' 
                      src={imageUrl || "/placeholder.svg"} 
                      className='w-full h-full object-cover rounded-lg' 
                    />
                    <div className='absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full'>
                      <IoCheckmarkCircle size={16} />
                    </div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <IoImage className='mx-auto text-gray-400 mb-2' size={32} />
                    <p className='text-sm text-gray-500'>Sin imagen seleccionada</p>
                  </div>
                )}
              </div>


              <div className='flex flex-col justify-center'>
                <label htmlFor='uploadCategoryImage' className='cursor-pointer'>
                  <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                    !watch('name') 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                      : imageLoading
                        ? 'bg-green-100 border-green-300 text-green-600'
                        : 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100 hover:border-green-400'
                  }`}>
                    {imageLoading ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent'></div>
                        <span className='font-medium'>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <IoCloudUpload size={20} />
                        <span className='font-medium'>Seleccionar Imagen</span>
                      </>
                    )}
                  </div>
                  <input 
                    disabled={!watch('name') || imageLoading} 
                    onChange={handleUploadCategoryImage} 
                    type='file' 
                    id='uploadCategoryImage' 
                    className='hidden'
                    accept='image/*'
                  />
                </label>
                <p className='text-xs text-gray-500 mt-2 text-center'>
                  Formatos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
            </div>

            {errors.image && (
              <div className='flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg'>
                <span className='text-red-500'>⚠</span>
                {errors.image.message}
              </div>
            )}
          </div>


          <div className='pt-4 border-t border-gray-100'>
            <button 
              type='submit'
              disabled={!isValid || !imageUrl || loading} 
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                isValid && imageUrl && !loading
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className='flex items-center justify-center gap-3'>
                  <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent'></div>
                  <span>Actualizando Categoría...</span>
                </div>
              ) : (
                <div className='flex items-center justify-center gap-2'>
                  <IoCheckmarkCircle size={20} />
                  <span>Actualizar Categoría</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default EditCategory
