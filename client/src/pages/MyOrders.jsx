import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search, Filter, Calendar, Eye, Download, Package, CreditCard, Clock, XCircle, CheckCircle } from 'lucide-react';
import OrderDetails from '../components/OrderDetails';
import NoData from '../components/NoData';

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 8;

  const generateOrderNumber = (createdAt, index) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const orderNum = String(index + 1).padStart(3, '0');
    return `${year}${month}${day}-${orderNum}`;
  };


  const getPaymentStatusInfo = (paymentStatus, paymentMethod) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { 
          label: 'Pagado', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'pending':
        return { 
          label: 'Contra entrega', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'failed':
      case 'cancelled':
        return { 
          label: 'Cancelado', 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      default:
        return { 
          label: 'Contra entrega', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
    }
  };


  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {

      const matchesSearch = order.product_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      
      const statusInfo = getPaymentStatusInfo(order.payment_status, order.payment_method);
      return matchesSearch && statusInfo.label.toLowerCase().includes(statusFilter);
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt);
      const dateB = new Date(b.createdAt || b.updatedAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [orders, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = Math.min(startIndex + ordersPerPage, filteredAndSortedOrders.length);
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  // Función para renderizar botones de paginación
  const renderPaginationButton = (pageNumber, isCurrent = false) => (
    <button
      key={pageNumber}
      onClick={() => setCurrentPage(pageNumber)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isCurrent
          ? "bg-gray-600 text-white shadow-sm"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
    >
      {pageNumber}
    </button>
  );


  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      pages.push(renderPaginationButton(1, currentPage === 1));
      
      if (currentPage > 3) {
        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(renderPaginationButton(i, currentPage === i));
      }
      
      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
      }
      
      if (totalPages > 1) {
        pages.push(renderPaginationButton(totalPages, currentPage === totalPages));
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i, currentPage === i));
      }
    }

    return pages;
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const formatPrice = (price) => {
    return `S/ ${parseFloat(price || 0).toFixed(2)}`;
  };

  return (

    <div className="p-6 h-full pt-20">

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600 mt-2">Gestiona y revisa todos tus pedidos</p>
      </div>


      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda solo por producto */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar producto
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de pago
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="pagado">Pagado</option>
                <option value="contra entrega">Contra entrega</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Ordenar por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      {filteredAndSortedOrders.length === 0 ? (
        <NoData />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-900 text-white">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold">
              <div className="col-span-3">Número de Orden</div>
              <div className="col-span-5">El Pedido</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2 text-center">Ver Detalle</div>
            </div>
          </div>

          {/* Filas de la tabla */}
          <div className="divide-y divide-gray-200">
            {currentOrders.map((order, index) => {
              const statusInfo = getPaymentStatusInfo(order.payment_status, order.payment_method);
              const StatusIcon = statusInfo.icon;
              const orderNumber = generateOrderNumber(order.createdAt || order.updatedAt, orders.indexOf(order));

              return (
                <div key={order._id + index} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Número de orden */}
                  <div className="col-span-3 flex flex-col justify-center">
                    <div className="font-semibold text-gray-900">#{orderNumber}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt || order.updatedAt)}
                    </div>
                  </div>

                  <div className="col-span-5 flex items-center space-x-4">
                    <img
                      src={order.product_details?.image?.[0] || '/placeholder.svg?height=60&width=60'}
                      alt={order.product_details?.name || 'Producto'}
                      className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {order.product_details?.name || 'Producto sin nombre'}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Subtotal: {formatPrice(order.subTotalAmt)}</div>
                        <div className="font-semibold text-gray-900">Total: {formatPrice(order.totalAmt)}</div>
                      </div>
                    </div>
                  </div>


                  <div className="col-span-2 flex items-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {statusInfo.label}
                    </div>
                  </div>


                  <div className="col-span-2 flex items-center justify-center space-x-2">
                    {order.comprobante?.pdf_url && (
                      <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paginación horizontal personalizada */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Mostrando {startIndex + 1} a {endIndex} de {filteredAndSortedOrders.length} órdenes
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {renderPagination()}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles de orden */}
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default MyOrders;
