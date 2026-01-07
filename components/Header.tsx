
import React from 'react';

interface HeaderProps {
  onValidateEntry: () => void;
}

const Header: React.FC<HeaderProps> = ({ onValidateEntry }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          Eventos Pro
        </h1>
        <button
          onClick={onValidateEntry}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          <span>Validar Entrada</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
