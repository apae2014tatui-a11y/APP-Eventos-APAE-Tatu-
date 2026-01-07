
import React from 'react';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Próximos Eventos</h2>
      {events.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">Nenhum evento criado ainda.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Clique no botão '+' para adicionar um novo evento.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <li
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{event.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(event.date)}</p>
                  </div>
                   <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;
