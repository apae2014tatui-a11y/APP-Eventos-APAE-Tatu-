
import React from 'react';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventClick, onDeleteEvent }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">Meus Eventos</h2>
      {events.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum evento criado ainda.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Toque no botão de adição para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              <div 
                onClick={() => onEventClick(event)}
                className="p-6 cursor-pointer"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight group-hover:underline">{event.name}</h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formatDate(event.date)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.ticketTypes.map(t => (
                    <span key={t.id} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Excluir evento"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
