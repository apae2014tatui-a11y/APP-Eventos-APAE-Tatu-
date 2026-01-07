
import React, { useState } from 'react';
import { Event, TicketType } from '../types';
import Modal from './Modal';

interface CreateEventModalProps {
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSave }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [ticketTypes, setTicketTypes] = useState<Omit<TicketType, 'id'>[]>([{ name: '', price: 0 }]);

  const handleTicketTypeChange = (index: number, field: 'name' | 'price', value: string | number) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: 0 }]);
  };
  
  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
        const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
        setTicketTypes(newTicketTypes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventName && eventDate && ticketTypes.every(t => t.name && t.price > 0)) {
      const finalTicketTypes = ticketTypes.map(tt => ({ ...tt, id: `tt-${Date.now()}-${Math.random()}` }));
      onSave({ name: eventName, date: eventDate, ticketTypes: finalTicketTypes });
    } else {
      alert("Por favor, preencha todos os campos obrigatórios.");
    }
  };
  
  const footer = (
    <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
        <button type="submit" form="create-event-form" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-semibold">Salvar Evento</button>
    </div>
  );

  return (
    <Modal title="Criar Novo Evento" onClose={onClose} footer={footer}>
      <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Evento</label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data e Hora</label>
          <input
            type="datetime-local"
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Tipos de Ingresso</h3>
          <div className="space-y-4">
            {ticketTypes.map((tt, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <input
                  type="text"
                  placeholder="Nome do Tipo (ex: Pista)"
                  value={tt.name}
                  onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
                <input
                  type="number"
                  placeholder="Preço (R$)"
                  value={tt.price === 0 ? '' : tt.price}
                  onChange={(e) => handleTicketTypeChange(index, 'price', Number(e.target.value))}
                  className="w-40 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                  min="0.01"
                  step="0.01"
                />
                <button type="button" onClick={() => removeTicketType(index)} disabled={ticketTypes.length <= 1} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={addTicketType} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">+ Adicionar outro tipo</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
