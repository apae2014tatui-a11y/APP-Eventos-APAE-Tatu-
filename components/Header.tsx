
import React from 'react';

interface HeaderProps {
  onManualValidation: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManualValidation }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
             <svg className="text-white w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
            APAE <span className="text-indigo-600">Eventos</span>
          </h1>
        </div>
        
        <button
          onClick={onManualValidation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span className="hidden sm:inline">Validação Manual</span>
          <span className="sm:hidden">Validar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
