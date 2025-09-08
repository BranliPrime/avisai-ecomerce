import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className='border-t '>
      <div className='w-full px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-4'>
      <p className="text-black font-semibold text-center lg:text-left">
          © {new Date().getFullYear()} Todos los Derechos Reservados | Multiservicios
        </p>

        <div className='flex items-center gap-4 justify-center text-2xl fon'>
          <a href='' className='hover:text-primary-100 font-semibold'>
            <FaFacebook />
          </a>
          <a href='' className='hover:text-primary-100'>
            <FaInstagram />
          </a>
          <a href='' className='hover:text-primary-100'>
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer