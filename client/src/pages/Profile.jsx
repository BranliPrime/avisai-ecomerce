import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { FaRegUserCircle } from 'react-icons/fa'
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { setUserDetails } from '../store/userSlice'
import fetchUserDetails from '../utils/fetchUserDetails'

const Profile = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onChange' })

  useEffect(() => {
    reset({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
    })
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.updateUserDetails,
        data
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
    <div className='p-4 pt-24 lg:pt-20'>
      <div className='w-20 h-20 bg-red-500 flex items-center justify-center rounded-full overflow-hidden drop-shadow-sm'>
        {user.avatar ? (
          <img alt={user.name} src={user.avatar} className='w-full h-full' />
        ) : (
          <FaRegUserCircle size={65} />
        )}
      </div>
      <button onClick={() => setProfileAvatarEdit(true)} className='text-sm min-w-20 border border-primary-100 hover:border-primary-200 hover:bg-primary-200 px-3 py-1 rounded-full mt-3'>
        Editar
      </button>

      {openProfileAvatarEdit && <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />}

      <form className='my-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
        {/* Nombre */}
        <div className='grid'>
          <label>Nombre</label>
          <input
            type='text'
            placeholder='Ingrese su nombre'
            className={`p-2 bg-blue-50 outline-none border rounded ${errors.name ? 'border-red-500' : 'focus-within:border-primary-200'}`}
            {...register('name', {
              required: 'El nombre es obligatorio',
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'El nombre solo puede contener letras y espacios'
              }
            })}
          />
          {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
        </div>

        {/* Correo electrónico */}
        <div className='grid'>
          <label htmlFor='email'>Correo electrónico</label>
          <input
            type='email'
            id='email'
            placeholder='Ingrese su correo electrónico'
            className={`p-2 bg-blue-50 outline-none border rounded ${errors.email ? 'border-red-500' : 'focus-within:border-primary-200'}`}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Formato de correo inválido'
              }
            })}
          />
          {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
        </div>

        {/* Teléfono */}
        <div className='grid'>
          <label htmlFor='mobile'>Teléfono</label>
          <input
            type='text'
            id='mobile'
            placeholder='Ingrese su número telefónico'
            className={`p-2 bg-blue-50 outline-none border rounded ${errors.mobile ? 'border-red-500' : 'focus-within:border-primary-200'}`}
            {...register('mobile', {
              required: 'El teléfono es obligatorio',
              pattern: {
                value: /^\d+$/,
                message: 'El teléfono solo debe contener números'
              },
              minLength: {
                value: 8,
                message: 'El teléfono debe tener al menos 8 dígitos'
              },
              maxLength: {
                value: 15,
                message: 'El teléfono no puede tener más de 15 dígitos'
              }
            })}
          />
          {errors.mobile && <span className='text-red-500 text-sm'>{errors.mobile.message}</span>}
        </div>

        {/* Botón de envío */}
        <button className='border px-4 py-2 font-semibold hover:bg-primary-100 border-primary-100 text-primary-200 hover:text-neutral-800 rounded'>
          {loading ? 'Cargando...' : 'Editar Perfil'}
        </button>
      </form>
    </div>
  )
}

export default Profile
