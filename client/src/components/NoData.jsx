import React from 'react'
import noDataImage from '../assets/No hay contenido.webp'

const NoData = () => {
  return (
    <div className='flex flex-col items-center justify-center p-4 gap-2'>
      <img
        src={noDataImage}
        alt='Sin datos disponibles'
        className='w-36'
      />
      <p className='text-neutral-500'>Sin datos</p>
    </div>
  )
}

export default NoData
