import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const InvoiceForm = ({ setInvoiceData }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: 'dni',
    dni: '',
    ruc: '',
    nombre: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [boleta, setBoleta] = useState(null); // Estado para la boleta generada

  const cartItems = useSelector(state => state.cartItem.cart);

  // Calcular subtotal y total
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);
  const igv = subtotal * 0.18;
  const totalPagar = subtotal + igv;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });


    if ((name === 'dni' && value === '') || (name === 'ruc' && value === '')) {
      setBoleta(null);
      setIsValid(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      const nuevaBoleta = {
        nombre: formData.nombre,
        tipoDocumento: formData.tipoDocumento,
        dni: formData.dni,
        ruc: formData.ruc,
        productos: cartItems,
        subtotal,
        igv,
        totalPagar,
      };

      setInvoiceData(nuevaBoleta);
      setBoleta(nuevaBoleta);
    }
  };

  const handleEditarBoleta = () => {
    setBoleta(null);
  };

  const handleEliminarBoleta = () => {
    setBoleta(null);
    setFormData({
      tipoDocumento: 'dni',
      dni: '',
      ruc: '',
      nombre: '',
    });
    setIsValid(false);
  };

  useEffect(() => {
    const fetchClientData = async () => {
      setErrorMessage('');
      const documento = formData.tipoDocumento === 'dni' ? formData.dni : formData.ruc;
      const tipo = formData.tipoDocumento;

      if ((tipo === 'dni' && documento.length === 8) || (tipo === 'ruc' && documento.length === 11)) {
        setIsLoading(true);
        try {
          const response = await fetch(`http://localhost:3002/api/sunat/consulta-sunat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ documento, tipo }),
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const data = await response.json();

          if (data.nombre) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              nombre: data.nombre,
            }));
            setIsValid(true);
          } else {
            setIsValid(false);
            setErrorMessage('No se encontró información.');
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
          setIsValid(false);
          setErrorMessage('Error al consultar los datos.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsValid(false);
      }
    };

    fetchClientData();
  }, [formData.tipoDocumento, formData.dni, formData.ruc]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="nombre" className="block font-medium mb-1">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            disabled
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tipoDocumento" className="block font-medium mb-1">Tipo de Documento</label>
          <select
            id="tipoDocumento"
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="dni">DNI</option>
            <option value="ruc">RUC</option>
          </select>
        </div>

        {formData.tipoDocumento === 'dni' ? (
          <div className="mb-4">
            <label htmlFor="dni" className="block font-medium mb-1">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="ruc" className="block font-medium mb-1">RUC</label>
            <input
              type="text"
              id="ruc"
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        )}

        {isLoading && <div>Cargando...</div>}
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <button
          type="submit"
          className={`mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
            !isValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isValid}
        >
          Generar Boleta
        </button>
      </form>

      {/* 📌 Sección de boleta generada */}
      {boleta && (
          <div className="border border-gray-300 p-4 rounded-lg shadow-md flex flex-col items-center justify-between gap-4">
            <div className="flex gap-4">
              <button onClick={handleEditarBoleta} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700">
                Editar
              </button>
              <button onClick={handleEliminarBoleta} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default InvoiceForm;
