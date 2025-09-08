import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useForm } from 'react-hook-form'
import uploadImage from '../utils/UploadImage'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const UploadCategoryModel = ({ close, fetchData }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch, setError, clearErrors } = useForm({
    mode: 'onChange'
  })

  const onSubmit = async (data) => {
    if (!imageUrl) {
      setError('image', { type: 'manual', message: 'Debe subir una imagen' })
      return
    }

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.addCategory,
        data: { name: data.name, image: imageUrl }
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

    const response = await uploadImage(file)
    const { data: ImageResponse } = response

    setImageUrl(ImageResponse.data.url)
    clearErrors('image') // Borra el error cuando el usuario sube la imagen
  }

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 flex items-center justify-center'>
      <div className='bg-white max-w-4xl w-full p-4 rounded'>
        <div className='flex items-center justify-between'>
          <h1 className='font-semibold'>Categoría</h1>
          <button onClick={close} className='w-fit block ml-auto'>
            <IoClose size={25} />
          </button>
        </div>
        <form className='my-3 grid gap-2' onSubmit={handleSubmit(onSubmit)}>
          {/* Nombre */}
          <div className='grid gap-1'>
            <label htmlFor='categoryName'>Nombre</label>
            <input
              type='text'
              id='categoryName'
              placeholder='Ingrese el nombre de la categoría'
              className={`p-2 bg-blue-50 border rounded outline-none ${errors.name ? 'border-red-500' : 'focus-within:border-primary-200'}`}
              {...register('name', {
                required: 'El nombre es obligatorio',
                pattern: {
                  value: /.*/,
                  message: 'El nombre no puede estar vacio'
                }
              })}
            />
            {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
          </div>

          {/* Imagen */}
          <div className='grid gap-1'>
            <p>Imagen</p>
            <div className='flex gap-4 flex-col lg:flex-row items-center'>
              <div className={`border h-36 w-full lg:w-36 flex items-center justify-center rounded ${errors.image ? 'border-red-500' : 'border-blue-100'}`}>
                {imageUrl ? (
                  <img alt='category' src={imageUrl} className='w-full h-full object-scale-down' />
                ) : (
                  <p className='text-sm text-neutral-500'>Sin Imagen</p>
                )}
              </div>
              <label htmlFor='uploadCategoryImage'>
                <div className={`px-4 py-2 rounded cursor-pointer border font-medium ${!watch('name') ? 'bg-gray-300' : 'border-primary-200 hover:bg-primary-100'}`}>
                  Subir Imagen
                </div>
                <input disabled={!watch('name')} onChange={handleUploadCategoryImage} type='file' id='uploadCategoryImage' className='hidden' />
              </label>
            </div>
            {errors.image && <span className='text-red-500 text-sm'>{errors.image.message}</span>}
          </div>

          {/* Botón de enviar */}
          <button disabled={!isValid || !imageUrl} className={`py-2 font-semibold rounded ${isValid && imageUrl ? 'bg-primary-200 hover:bg-primary-100' : 'bg-gray-300'}`}>
            {loading ? 'Cargando...' : 'Agregar Categoría'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default UploadCategoryModel
