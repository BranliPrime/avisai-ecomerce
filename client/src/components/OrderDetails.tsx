import React from 'react';
import { X, Package, MapPin, CreditCard, FileText, Download, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface OrderDetailsProps {
  order: any;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
  //  Función para generar número de orden basado en fecha YYYYMMDD-XXX
  const generateOrderNumber = (createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Para el número secuencial, usamos un número basado en el timestamp
    const timestamp = date.getTime();
    const orderNum = String(timestamp).slice(-3).padStart(3, '0');
    return `${year}${month}${day}-${orderNum}`;
  };

  //  Estados de seguimiento del pedido
  const getOrderStatus = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'cancelled':
      case 'failed':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const orderStatus = getOrderStatus(order.payment_status);

  //  Pasos del seguimiento
  const trackingSteps = [
    {
      id: 'pending',
      title: 'Pedido Recibido',
      description: 'Tu pedido ha sido recibido y está siendo procesado',
      icon: Clock,
      completed: true
    },
    {
      id: 'confirmed',
      title: 'Pedido Confirmado',
      description: 'El pago ha sido confirmado y el pedido está en preparación',
      icon: CheckCircle,
      completed: orderStatus === 'confirmed'
    },
    {
      id: 'shipped',
      title: 'En Camino',
      description: 'Tu pedido ha sido enviado y está en camino',
      icon: Truck,
      completed: false
    },
    {
      id: 'delivered',
      title: 'Entregado',
      description: 'Tu pedido ha sido entregado exitosamente',
      icon: Package,
      completed: false
    }
  ];

  if (orderStatus === 'cancelled') {
    trackingSteps[1] = {
      id: 'cancelled',
      title: 'Pedido Cancelado',
      description: 'Este pedido ha sido cancelado',
      icon: AlertCircle,
      completed: true
    };
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Orden #{generateOrderNumber(order.createdAt)}
            </h2>
            <p className="text-gray-600 mt-1">
              Realizado el {new Date(order.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Seguimiento del Pedido */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Seguimiento del Pedido
            </h3>
            
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === trackingSteps.length - 1;
                
                return (
                  <div key={step.id} className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? orderStatus === 'cancelled' && step.id === 'cancelled'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          step.completed ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`font-medium ${
                        step.completed 
                          ? orderStatus === 'cancelled' && step.id === 'cancelled'
                            ? 'text-red-900'
                            : 'text-green-900'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        step.completed 
                          ? orderStatus === 'cancelled' && step.id === 'cancelled'
                            ? 'text-red-600'
                            : 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ... existing code ... */}

          {/* Información del Producto */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Detalles del Producto
            </h3>
            
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {order.product_details?.image?.[0] ? (
                  <img 
                    src={order.product_details.image[0] || "/placeholder.svg"} 
                    alt={order.product_details?.name || 'Producto'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">
                  {order.product_details?.name || 'Producto sin nombre'}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Subtotal: <span className="font-medium">S/ {order.subTotalAmt?.toFixed(2) || '0.00'}</span></p>
                  <p className="text-lg font-bold text-gray-900">
                    Total: S/ {order.totalAmt?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ... existing code ... */}
        </div>

        {/* ... existing code ... */}
      </div>
    </div>
  );
};

export default OrderDetails;
