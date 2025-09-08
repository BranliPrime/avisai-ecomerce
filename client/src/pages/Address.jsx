import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddAddress from '../components/AddAddress';
import { MdDelete, MdEdit, MdLocationOn, MdPhone, MdHome } from "react-icons/md";
import { FiSearch, FiFilter } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import EditAddressDetails from '../components/EditAddressDetails';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';

const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList);
  const [openAddress, setOpenAddress] = useState(false);
  const [OpenEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { fetchAddress } = useGlobalContext();

  //  Agregando filtro específico por provincia y mejorando la búsqueda
  const uniqueProvinces = [...new Set(addressList
    .filter(address => address.status && address.state)
    .map(address => address.state)
  )].sort();

  const filteredAddresses = addressList.filter(address => {
    if (!address.status) return false;
    
    const matchesSearch = searchTerm === '' || 
      address.address_line.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'default' && address.isDefault);

    const matchesProvince = provinceFilter === 'all' || 
      address.state === provinceFilter;

    return matchesSearch && matchesFilter && matchesProvince;
  });

  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteCancel = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data: { _id: deleteId }
      });

      if (response.data.success) {
        toast.success("Dirección eliminada correctamente");
        fetchAddress();
        setOpenDelete(false);
        setDeleteId(null);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    setProvinceFilter('all');
    setCurrentPage(1);
  };

  //  Agregando indicador de filtros activos
  const hasActiveFilters = searchTerm !== '' || filterBy !== 'all' || provinceFilter !== 'all';

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-50 min-h-screen">
      {/* Título principal mejorado */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MdLocationOn className="text-blue-600" />
              Mis Direcciones
            </h1>
            <p className="text-gray-600 mt-1">Gestiona tus direcciones de entrega</p>
          </div>
          <button
            onClick={() => setOpenAddress(true)}
            className="border-2 border-green-500 hover:bg-green-700 text-gray px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <MdHome />
            Agregar Dirección
          </button>
        </div>
      </div>

      {/*  Filtros mejorados con filtro específico por provincia */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiSearch className="inline mr-2" />
              Buscar dirección
            </label>
            <input
              type="text"
              placeholder="Buscar por dirección o provincia..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-2" />
              Filtrar por tipo
            </label>
            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las direcciones</option>
              <option value="default">Dirección predeterminada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MdLocationOn className="inline mr-2" />
              Filtrar por provincia
            </label>
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las provincias</option>
              {uniqueProvinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                hasActiveFilters 
                  ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {hasActiveFilters ? 'Limpiar filtros' : 'Sin filtros'}
            </button>
          </div>
        </div>

        {/*  Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Búsqueda: "{searchTerm}"
              </span>
            )}
            {filterBy !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tipo: {filterBy === 'default' ? 'Predeterminada' : filterBy}
              </span>
            )}
            {provinceFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Provincia: {provinceFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla de direcciones mejorada */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Dirección</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ubicación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Provincia</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAddresses.length > 0 ? (
                paginatedAddresses.map((address, index) => (
                  <tr key={address._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <MdLocationOn className="text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{address.address_line}</p>
                          <p className="text-sm text-gray-500 mt-1">Código: {address.pincode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{address.city}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MdPhone className="text-green-600" />
                        <span className="text-gray-900">{address.mobile}</span>
                      </div>
                    </td>
                    {/*  Columna Provincia ahora muestra el estado/provincia real */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {address.state}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setOpenEdit(true);
                            setEditData(address);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar dirección"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(address._id);
                            setOpenDelete(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar dirección"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <MdLocationOn className="text-gray-400" size={48} />
                      <p className="text-gray-500 font-medium">No se encontraron direcciones</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm || provinceFilter !== 'all' ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primera dirección para comenzar'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación horizontal mejorada */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAddresses.length)} de {filteredAddresses.length} direcciones
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón de agregar dirección alternativo */}
      {filteredAddresses.length === 0 && !searchTerm && provinceFilter === 'all' && (
        <div className="mt-6 bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
          <div className="text-center">
            <MdLocationOn className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes direcciones guardadas</h3>
            <p className="text-gray-500 mb-4">Agrega tu primera dirección para realizar pedidos</p>
            <button
              onClick={() => setOpenAddress(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
            >
              <MdHome />
              Agregar Primera Dirección
            </button>
          </div>
        </div>
      )}

      {/* Modales existentes */}
      {openAddress && (
        <AddAddress close={() => setOpenAddress(false)} />
      )}

      {OpenEdit && (
        <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />
      )}

      {/* Modal de confirmación mejorado */}
      {openDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <IoClose size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <MdDelete className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">¿Eliminar esta dirección?</p>
                    <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
