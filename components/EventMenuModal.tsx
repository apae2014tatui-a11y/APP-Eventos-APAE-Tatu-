
import React from 'react';
import { Event } from '../types';

interface EventMenuModalProps {
  event: Event;
  onClose: () => void;
  onShowDashboard: () => void;
  onStartSale: () => void;
  onShowAttendees: () => void;
}

const EventMenuModal: React.FC<EventMenuModalProps> = ({ event, onClose, onShowDashboard, onStartSale, onShowAttendees }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-1 leading-tight">{event.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-widest font-semibold">Menu do Evento</p>
        
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={onStartSale} 
            className="w-full p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center space-x-3 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            <span className="font-bold text-lg">Nova Venda</span>
          </button>
          
          <button 
            onClick={onShowAttendees} 
            className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="font-bold text-lg">Participantes</span>
          </button>

          <button 
            onClick={onShowDashboard} 
            className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="font-bold text-lg">Dashboard</span>
          </button>
        </div>
        
        <button onClick={onClose} className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-widest">Fechar</button>
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
