
import React, { useState, useMemo } from 'react';
import { Event, Sale, Ticket } from '../types';
import Modal from './Modal';

interface ManualValidationModalProps {
  events: Event[];
  sales: Sale[];
  onToggleCheckIn: (ticketId: string) => void;
  onClose: () => void;
}

const ManualValidationModal: React.FC<ManualValidationModalProps> = ({ events, sales, onToggleCheckIn, onClose }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = useMemo(() => {
    if (!selectedEventId) return [];
    
    const eventSales = sales.filter(s => s.eventId === selectedEventId);
    const event = events.find(e => e.id === selectedEventId);
    
    const allTickets = eventSales.flatMap(sale => 
      sale.tickets.map(t => ({
        ...t,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        orderNumber: sale.orderNumber,
        ticketTypeName: event?.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name || 'N/A'
      }))
    );

    if (!searchTerm) return allTickets;

    const lowerSearch = searchTerm.toLowerCase();
    return allTickets.filter(t => 
      t.customerName.toLowerCase().includes(lowerSearch) || 
      t.id.toLowerCase().includes(lowerSearch) ||
      t.orderNumber.toLowerCase().includes(lowerSearch)
    );
  }, [selectedEventId, sales, searchTerm, events]);

  return (
    <Modal title="Validação Manual" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Evento Selecionado</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Filtrar por Nome ou Pedido</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex: #2024-001 ou João..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-400 uppercase font-black text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredTickets.length > 0 ? filteredTickets.map(t => (
                  <tr key={t.id} className={`transition-colors ${t.checkedIn ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-black text-indigo-600 dark:text-indigo-400">#{t.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 dark:text-gray-100">{t.customerName}</div>
                      <div className="text-[10px] text-gray-400">{t.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase">
                        {t.ticketTypeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onToggleCheckIn(t.id)}
                        className={`min-w-[120px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all active:scale-95 ${
                          t.checkedIn 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none'
                        }`}
                      >
                        {t.checkedIn ? '✓ Confirmado' : 'Confirmar'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">Nenhum participante encontrado para este filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManualValidationModal;
