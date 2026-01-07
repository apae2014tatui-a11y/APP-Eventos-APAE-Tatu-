
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
        paymentStatus: sale.paymentStatus,
        paymentMethod: sale.paymentMethod,
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
    <Modal title="Validação na Portaria" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Evento</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Buscar Nome ou Ticket</label>
            <div className="relative">
              <input 
                type="text" placeholder="Nome ou #1001..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
              />
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-400 uppercase font-black text-[9px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4 text-center">Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredTickets.length > 0 ? filteredTickets.map(t => (
                  <tr key={t.id} className={`transition-all ${t.checkedIn ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-xs">{t.uniqueTicketNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-800 dark:text-gray-100">{t.customerName}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{t.ticketTypeName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-[10px] font-black uppercase ${t.paymentStatus === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {t.paymentStatus}
                      </div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase">{t.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onToggleCheckIn(t.id)}
                        className={`w-full max-w-[130px] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          t.checkedIn 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                        }`}
                      >
                        {t.checkedIn ? '✓ Check-in' : 'Confirmar'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">Nenhum registro encontrado</td>
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
