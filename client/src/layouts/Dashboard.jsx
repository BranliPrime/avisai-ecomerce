import React, { useState } from "react";
import UserMenu from "../components/UserMenu";
import { Outlet } from "react-router-dom";
// import Chatbot from '../components/Chatbot';  // Importa tu chatbot

const Dashboard = () => {
  // const [chatOpen, setChatOpen] = useState(false);

  return (
    <section className="bg-white">
      <div className="grid lg:grid-cols-[250px,1fr] min-h-screen">
        {/* Izquierda - Menu de usuario */}
        <div className="py-4 sticky top-24 self-start max-h-[calc(100vh-96px)] overflow-y-auto hidden lg:block border-r border-gray-200 bg-gray-50/50">
          <div className="h-full px-3">
            <UserMenu isDashboard={true} />
          </div>
        </div>

        {/* Derecha - Contenido principal */}
        <div className="bg-white min-h-[75vh] w-full relative">
          <Outlet />
        </div>
      </div>

      {/* Botón flotante para abrir/cerrar chatbot */}
      {/* <button
        onClick={() => setChatOpen(prev => !prev)}
        aria-label={chatOpen ? "Cerrar chat de soporte" : "Abrir chat de soporte"}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors duration-300 z-50"
      >
        {chatOpen ? '▼' : '💬'}
      </button> */}

      {/* Renderiza el Chatbot solo si está abierto */}
      {/* {chatOpen && <Chatbot />} */}
    </section>
  );
};

export default Dashboard;
