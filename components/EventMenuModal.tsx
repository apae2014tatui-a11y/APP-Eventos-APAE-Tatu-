
import React from 'react';
import { Event } from '../types';

interface EventMenuModalProps {
  event: Event;
  onClose: () => void;
  onShowDashboard: () => void;
  onStartSale: () => void;
}

const EventMenuModal: React.FC<EventMenuModalProps> = ({ event, onClose, onShowDashboard, onStartSale }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{event.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Selecione uma ação</p>
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onShowDashboard} 
            className="w-full text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-3"
          >
            <svg className="w-6 h-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>
            <span className="font-semibold">Informações do Evento</span>
          </button>
          <button 
            onClick={onStartSale} 
            className="w-full text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-3"
          >
            <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2a10 10 0 1 1-10 10"></path><path d="M12 22a10 10 0 0 0 10-10"></path></svg>
            <span className="font-semibold">Venda</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:underline">Fechar</button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EventMenuModal;
