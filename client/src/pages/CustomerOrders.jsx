import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CustomerOrders = () => {
  const [customerId, setCustomerId] = useState('')
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    if (!customerId) {
      toast.error('Debes ingresar un ID de cliente')
      return
    }

    try {
      const { data } = await axios.get(`/api/order/customer-orders/${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      console.log('Pedidos obtenidos:', data)
      setOrders(data.data || [])
    } catch (error) {
      console.error('Error al obtener pedidos:', error.response || error.message)
      toast.error(error?.response?.data?.message || 'Error al obtener pedidos')
    }
  }

  return (
    <div>
      <h2>Buscar Pedidos por Cliente</h2>
      <input
        type="text"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        placeholder="ID del Cliente"
        className="border p-2"
      />
      <button onClick={fetchOrders} className="bg-blue-500 text-white px-4 py-2 ml-2">
        Buscar
      </button>

      {orders.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="p-4 border bg-white rounded shadow">
              <p><strong>Pedido:</strong> {order.orderId}</p>
              <p><strong>Producto:</strong> {order.product_details?.name || 'N/A'}</p>
              <p><strong>Total:</strong> S/. {order.totalAmt}</p>
              <p><strong>Estado de pago:</strong> {order.payment_status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-500">No hay pedidos para este cliente.</p>
      )}
    </div>
  )
}

export default CustomerOrders
