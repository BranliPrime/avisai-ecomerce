import React from 'react'
import { IoClose, IoWarning } from "react-icons/io5"

const ConfirmBox = ({ cancel, confirm, close }) => {
  return (
    <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4'>
      <div className='bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 scale-100 hover:scale-[1.01]'>
        
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse'>
              <IoWarning className='text-red-600 text-2xl' />
            </div>
            <h1 className='text-lg font-semibold text-gray-900'>
              Eliminación permanente
            </h1>
          </div>
          <button 
            onClick={close}
            className='w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200'
          >
            <IoClose className='text-gray-500 text-xl' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <p className='text-gray-600 leading-relaxed text-base'>
            Esta acción <span className='font-semibold text-red-600'>no se puede deshacer</span>.  
            ¿Estás seguro de que deseas eliminar este elemento permanentemente?
          </p>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 p-6 pt-0'>
          <button 
            onClick={cancel} 
            className='px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg 
                       hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-gray-200'
          >
            Cancelar
          </button>
          <button 
            onClick={confirm} 
            className='px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg 
                       hover:bg-red-700 active:bg-red-800 transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-red-300 shadow-md'
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmBox
