
import React, { useState, useMemo } from 'react';
import { Event, Sale, Ticket, PaymentStatus } from '../types';
import Modal from './Modal';

interface ManualValidationModalProps {
  events: Event[];
  sales: Sale[];
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  onClose: () => void;
}

const ManualValidationModal: React.FC<ManualValidationModalProps> = ({ events, sales, onUpdateTicket, onClose }) => {
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
        paymentMethod: sale.paymentMethod,
        details: sale.details,
        saleId: sale.id,
        ticketTypeName: event?.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name || 'N/A'
      }))
    );

    if (!searchTerm) return allTickets;

    const lowerSearch = searchTerm.toLowerCase();
    return allTickets.filter(t => 
      t.customerName.toLowerCase().includes(lowerSearch) || 
      t.uniqueTicketNumber.toLowerCase().includes(lowerSearch) ||
      t.paymentStatus.toLowerCase().includes(lowerSearch)
    );
  }, [selectedEventId, sales, searchTerm, events]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Pago': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10';
      case 'A pagar': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/10';
      case 'Verificar depois': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/10';
      default: return 'text-gray-500';
    }
  };

  return (
    <Modal title="Portaria: Controle Individual" onClose={onClose} maxWidth="max-w-6xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Evento Ativo</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-sm shadow-sm"
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-8">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pesquisar Participante ou Nº Ticket</label>
            <div className="relative">
              <input 
                type="text" placeholder="Ex: João Silva ou #1005..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-sm shadow-sm"
              />
              <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-400 uppercase font-black text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-5">Nº Ingresso</th>
                  <th className="px-8 py-5">Participante</th>
                  <th className="px-8 py-5">Financeiro Individual</th>
                  <th className="px-8 py-5">Observações</th>
                  <th className="px-8 py-5 text-center">Status Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredTickets.length > 0 ? filteredTickets.map(t => (
                  <tr key={t.id} className={`transition-all hover:bg-gray-50/50 dark:hover:bg-gray-700/20 ${t.checkedIn ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : ''}`}>
                    <td className="px-8 py-5">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">{t.uniqueTicketNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-800 dark:text-gray-100 text-base">{t.customerName}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">{t.ticketTypeName}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <select
                          value={t.paymentStatus}
                          onChange={(e) => onUpdateTicket(t.id, { paymentStatus: e.target.value as PaymentStatus })}
                          className={`appearance-none font-black text-[11px] uppercase px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm ${getStatusColor(t.paymentStatus)}`}
                        >
                          <option value="Pago">Pago</option>
                          <option value="A pagar">A pagar</option>
                          <option value="Verificar depois">Verificar</option>
                        </select>
                        <span className="text-[9px] font-bold text-gray-400 uppercase ml-1 italic">{t.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       {t.details ? (
                         <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] whitespace-normal italic">
                           "{t.details}"
                         </div>
                       ) : (
                         <span className="text-gray-300">Nenhuma</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => onUpdateTicket(t.id, { checkedIn: !t.checkedIn })}
                        className={`min-w-[140px] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                          t.checkedIn 
                          ? 'bg-emerald-500 text-white shadow-emerald-200' 
                          : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {t.checkedIn ? '✓ Confirmado' : 'Validar Entrada'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Nenhum ingresso encontrado para este filtro</td>
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
