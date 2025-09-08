import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import banner from '../assets/banner.png';
import bannerMobile from '../assets/banner-mobile.jpg';
import { valideURLConvert } from '../utils/valideURLConvert';
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay';

// Importa el Chatbot que creamos
import Chatbot from '../components/Chatbot'; // Ajusta la ruta según donde esté tu componente

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory);
  const categoryData = useSelector(state => state.product.allCategory) || [];
  const subCategoryData = useSelector(state => state.product.allSubCategory) || [];
  const navigate = useNavigate();

  const [chatOpen, setChatOpen] = useState(false);

  const subCategoryMap = useMemo(() => {
    return subCategoryData.reduce((acc, sub) => {
      sub.category.forEach(cat => {
        acc[cat._id] = sub;
      });
      return acc;
    }, {});
  }, [subCategoryData]);

  const handleRedirectProductListpage = useCallback((id, cat) => {
    const subcategory = subCategoryMap[id];
    if (!subcategory) return;
    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`;
    navigate(url);
  }, [navigate, subCategoryMap]);

  const toggleChat = () => setChatOpen(!chatOpen);

  return (
    <section className="bg-white pt-28 lg:pt-24 min-h-screen relative">
      {/* Banner */}
      <div className="container mx-auto mb-8">
        <div className="w-full h-52 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={banner}
            className="w-full h-full hidden lg:block object-cover transition-transform duration-500 hover:scale-105"
            alt="Promoción"
            loading="lazy"
          />
          <img
            src={bannerMobile}
            className="w-full h-full lg:hidden object-cover"
            alt="Promoción móvil"
            loading="lazy"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-wide">Categorías Destacadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-6">
          {loadingCategory ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 animate-pulse"
              >
                <div className="bg-gray-300 h-24 rounded-xl mb-5"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
            ))
          ) : (
            categoryData.map(cat => (
              <div
                key={cat._id}
                className="bg-white rounded-3xl p-4 shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') handleRedirectProductListpage(cat._id, cat.name); }}
              >
                <div className="overflow-hidden rounded-xl bg-gray-50 mb-4">
                  <img
                    src={cat.image || "/placeholder.svg"}
                    className="w-full h-36 object-contain transition-transform duration-500 hover:scale-110"
                    alt={cat.name}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-center text-md font-semibold text-gray-800 hover:text-green-600 transition-colors duration-300">
                  {cat.name}
                </h3>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Productos por categoría */}
      {categoryData.map(c => (
        <CategoryWiseProductDisplay key={c._id} id={c._id} name={c.name} />
      ))}

      {/* Botón flotante para chatbot */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        aria-label={chatOpen ? "Cerrar chat de soporte" : "Abrir chat de soporte"}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors duration-300 z-50"
      >
        {chatOpen ? '▼' : '💬'}
      </button>


      {/* Aquí renderizas el componente Chatbot */}
      {chatOpen && <Chatbot />}
    </section>
  );
};

export default Home;
