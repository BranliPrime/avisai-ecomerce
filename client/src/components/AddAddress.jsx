import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose, IoLocationOutline, IoCallOutline, IoMapOutline, IoBusinessOutline, IoCodeSlashOutline } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({ close }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ mode: "onChange" })
  const { fetchAddress } = useGlobalContext()

  const onSubmit = async (data) => {
    console.log("data", data)

    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          address_line: data.addressline,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          mobile: data.mobile
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (close) {
          close()
          reset()
          fetchAddress()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
        {/*  Header mejorado con mejor diseño */}
        <div className='sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-50 rounded-lg'>
                <IoLocationOutline className='text-blue-600' size={20} />
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>Nueva Dirección</h2>
            </div>
            <button 
              onClick={close} 
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
            >
              <IoClose size={24} className='text-gray-500 hover:text-red-500' />
            </button>
          </div>
          <p className='mt-2 text-sm text-gray-600'>
            Complete los datos de su dirección para entregas precisas
          </p>
          
        </div>
        

        {/*  Formulario con diseño mejorado y validaciones peruanas */}
        <form className='p-3 space-y-5' onSubmit={handleSubmit(onSubmit)}>
          {/* Campo: Dirección completa */}
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
            <p className='text-sm text-blue-800 leading-relaxed'>
              <span className='font-medium'>Información importante:</span> Asegúrese de que todos los datos sean correctos para garantizar entregas exitosas y evitar inconvenientes.
            </p>
          </div>
          <div className='space-y-2'>
            <label htmlFor='addressline' className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <IoMapOutline className='text-gray-500' size={16} />
              Dirección completa
            </label>
            <input
              type='text'
              id='addressline'
              placeholder='Ej: Jr. de la Unión 1234, Cercado de Lima'
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.addressline ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
              }`}
              {...register("addressline", {
                required: "La dirección es obligatoria",
                minLength: { value: 10, message: "Ingrese una dirección más específica (mínimo 10 caracteres)" },
                pattern: { 
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,#-]+$/, 
                  message: "La dirección contiene caracteres no válidos" 
                }
              })}
            />
            {errors.addressline && (
              <p className='text-red-600 text-sm flex items-center gap-1'>
                <span className='text-red-500'>⚠</span>
                {errors.addressline.message}
              </p>
            )}
          </div>

          {/* Campo: Departamento */}
          <div className='space-y-2'>
            <label htmlFor='city' className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <IoBusinessOutline className='text-gray-500' size={16} />
              Departamento
            </label>
            <input
              type='text'
              id='city'
              placeholder='Ej: Lima, Arequipa, Cusco, La Libertad'
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
              }`}
              {...register("city", {
                required: "El departamento es obligatorio",
                minLength: { value: 3, message: "Ingrese un departamento válido" },
                pattern: { 
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 
                  message: "Solo se permiten letras y espacios" 
                }
              })}
            />
            {errors.city && (
              <p className='text-red-600 text-sm flex items-center gap-1'>
                <span className='text-red-500'>⚠</span>
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Campo: Provincia */}
          <div className='space-y-2'>
            <label htmlFor='state' className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <IoLocationOutline className='text-gray-500' size={16} />
              Provincia
            </label>
            <input
              type='text'
              id='state'
              placeholder='Ej: Lima, Arequipa, Cusco, Trujillo'
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
              }`}
              {...register("state", {
                required: "La provincia es obligatoria",
                minLength: { value: 2, message: "Ingrese una provincia válida" },
                pattern: { 
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 
                  message: "Solo se permiten letras y espacios" 
                }
              })}
            />
            {errors.state && (
              <p className='text-red-600 text-sm flex items-center gap-1'>
                <span className='text-red-500'>⚠</span>
                {errors.state.message}
              </p>
            )}
          </div>

          {/* Campo: Código Postal */}
          <div className='space-y-2'>
            <label htmlFor='pincode' className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <IoCodeSlashOutline className='text-gray-500' size={16} />
              Código Postal
            </label>
            <input
              type='text'
              id='pincode'
              placeholder='Ej: 15001 (Lima), 04001 (Arequipa)'
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
              }`}
              {...register("pincode", {
                required: "El código postal es obligatorio",
                pattern: { 
                  value: /^[0-9]{5}$/, 
                  message: "El código postal debe tener exactamente 5 dígitos" 
                }
              })}
            />
            {errors.pincode && (
              <p className='text-red-600 text-sm flex items-center gap-1'>
                <span className='text-red-500'>⚠</span>
                {errors.pincode.message}
              </p>
            )}
          </div>

          {/* Campo: Teléfono */}
          <div className='space-y-2'>
            <label htmlFor='mobile' className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <IoCallOutline className='text-gray-500' size={16} />
              Teléfono celular
            </label>
            <input
              type='tel'
              id='mobile'
              placeholder='Ej: 987654321 (9 dígitos)'
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
              }`}
              {...register("mobile", {
                required: "El número de celular es obligatorio",
                pattern: { 
                  value: /^9[0-9]{8}$/, 
                  message: "Ingrese un celular válido (9 dígitos, debe empezar con 9)" 
                }
              })}
            />
            {errors.mobile && (
              <p className='text-red-600 text-sm flex items-center gap-1'>
                <span className='text-red-500'>⚠</span>
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/*  Botón mejorado con estado de carga */}
          <div className='pt-4'>
            <button 
              type='submit' 
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Guardando...
                </span>
              ) : (
                'Guardar Dirección'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AddAddress
