import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { IoClose, IoLocationOutline, IoBusinessOutline, IoMapOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider';

const EditAddressDetails = ({ close, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      _id: data._id,
      userId: data.userId,
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      mobile: data.mobile,
    },
  });

  const { fetchAddress } = useGlobalContext();

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await Axios({
        ...SummaryApi.updateAddress,
        data: formData,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (close) {
          close();
          reset();
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100'>
        {/* Header con gradiente */}
        <div className='bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold text-white'>Editar Dirección</h2>
              <p className='text-green-100 text-sm mt-1'>Actualiza los datos de tu dirección</p>
            </div>
            <button 
              onClick={close} 
              className='text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-full'
            >
              <IoClose size={28} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form className='p-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Dirección completa - span completo */}
            <div className='md:col-span-2'>
              <label htmlFor='address_line' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <IoLocationOutline className='text-green-600' size={18} />
                Dirección Completa
              </label>
              <input
                type='text'
                id='address_line'
                placeholder='Ej: Av. Javier Prado Este 1234, Oficina 101, San Borja'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.address_line 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white hover:border-gray-300'
                }`}
                {...register("address_line", {
                  required: "La dirección es obligatoria",
                  minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
                })}
              />
              {errors.address_line && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-sm font-medium">{errors.address_line.message}</span>
                </div>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label htmlFor='city' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <IoBusinessOutline className='text-green-600' size={18} />
                Ciudad o Departamento
              </label>
              <input
                type='text'
                id='city'
                placeholder='Ej: Lima, Arequipa, Trujillo'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.city 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white hover:border-gray-300'
                }`}
                {...register("city", {
                  required: "La ciudad es obligatoria",
                  minLength: { value: 3, message: "La ciudad debe tener al menos 3 caracteres" }
                })}
              />
              {errors.city && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-sm font-medium">{errors.city.message}</span>
                </div>
              )}
            </div>

            {/* Provincia */}
            <div>
              <label htmlFor='state' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <IoMapOutline className='text-purple-600' size={18} />
                Provincia
              </label>
              <input
                type='text'
                id='state'
                placeholder='Ej: Lima'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.state 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white hover:border-gray-300'
                }`}
                {...register("state", {
                  required: "La provincia es obligatorio",
                  minLength: { value: 2, message: "Debe tener al menos 2 caracteres" }
                })}
              />
              {errors.state && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-sm font-medium">{errors.state.message}</span>
                </div>
              )}
            </div>

            {/* Código Postal */}
            <div>
              <label htmlFor='pincode' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <IoMailOutline className='text-orange-600' size={18} />
                Código Postal
              </label>
              <input
                type='text'
                id='pincode'
                placeholder='Ej: 15023'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.pincode 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white hover:border-gray-300'
                }`}
                {...register("pincode", {
                  required: "El código postal es obligatorio",
                  pattern: { 
                    value: /^\d{5}$/, 
                    message: "El código postal debe tener exactamente 5 dígitos" 
                  }
                })}
              />
              {errors.pincode && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-sm font-medium">{errors.pincode.message}</span>
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor='mobile' className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <IoCallOutline className='text-teal-600' size={18} />
                Número de Teléfono
              </label>
              <input
                type='text'
                id='mobile'
                placeholder='Ej: 987654321'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.mobile 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white hover:border-gray-300'
                }`}
                {...register("mobile", {
                  required: "El número de móvil es obligatorio",
                  pattern: { 
                    value: /^9\d{8}$/, 
                    message: "Debe ser un número celular válido (9 dígitos, empezando con 9)" 
                  },
                })}
              />
              {errors.mobile && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-sm font-medium">{errors.mobile.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de envío */}
          <div className='mt-8 flex gap-4'>
            <button
              type='button'
              onClick={close}
              className='flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200'
            >
              Cancelar
            </button>
            <button 
              type='submit' 
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] active:scale-[0.98]'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Actualizando...
                </div>
              ) : (
                'Actualizar Dirección'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditAddressDetails;
