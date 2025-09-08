import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useGlobalContext } from '../provider/GlobalProvider';

const Success = () => {
  const location = useLocation();
  const mensaje = location?.state?.text || 'Pago';

  const { fetchCartItem, fetchOrder } = useGlobalContext();

  useEffect(() => {
    const flag = localStorage.getItem('stripe_payment_started');
    if (flag) {
      fetchCartItem(); 
      fetchOrder();  
      localStorage.removeItem('stripe_payment_started');
    }
  }, []);

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl shadow-md max-w-lg w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-600 w-14 h-14" />
        </div>
        <h2 className="text-2xl font-semibold text-green-700 mb-2">
          ¡{mensaje} realizado con éxito!
        </h2>
        <p className="text-gray-600 mb-6">
          Tu {mensaje.toLowerCase()} fue procesado correctamente. Te notificaremos cualquier actualización.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Ir al inicio
          </Link>
          <Link
            to="/dashboard/myorders"
            className="border border-green-600 text-green-600 px-5 py-2 rounded-lg hover:bg-green-50 transition"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
