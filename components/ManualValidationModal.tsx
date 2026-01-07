
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
        ticketTypeName: event?.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name || 'N/A'
      }))
    );

    if (!searchTerm) return allTickets;

    const lowerSearch = searchTerm.toLowerCase();
    return allTickets.filter(t => 
      t.customerName.toLowerCase().includes(lowerSearch) || 
      t.uniqueTicketNumber.toLowerCase().includes(lowerSearch)
    );
  }, [selectedEventId, sales, searchTerm, events]);

  return (
    <Modal title="Check-in de Participantes" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Evento</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-sm"
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Buscar (Nome ou ID do Ingresso)</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex: EVT-2024-0001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-sm"
              />
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase font-black text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-5">ID Ingresso</th>
                  <th className="px-6 py-5">Nome</th>
                  <th className="px-6 py-5">Tipo</th>
                  <th className="px-6 py-5 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.length > 0 ? filteredTickets.map(t => (
                  <tr key={t.id} className={`transition-all hover:bg-gray-50/50 ${t.checkedIn ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <span className="font-black text-indigo-600 font-mono tracking-tighter">{t.uniqueTicketNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-gray-800">{t.customerName}</div>
                      <div className="text-[10px] font-bold text-gray-400">{t.customerPhone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase">
                        {t.ticketTypeName}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => onToggleCheckIn(t.id)}
                        className={`min-w-[120px] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          t.checkedIn 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                        }`}
                      >
                        {t.checkedIn ? '✓ Check-in OK' : 'Confirmar'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Nenhum ingresso encontrado.</td>
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
