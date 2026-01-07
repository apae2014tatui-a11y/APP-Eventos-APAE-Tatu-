
import React, { useState, useMemo } from 'react';
import { Event, Sale, Ticket, PaymentStatus } from '../types';
import Modal from './Modal';

interface ManualValidationModalProps {
  events: Event[];
  sales: Sale[];
  onToggleCheckIn: (ticketId: string) => void;
  onUpdatePaymentStatus: (saleId: string, status: PaymentStatus) => void;
  onClose: () => void;
}

const ManualValidationModal: React.FC<ManualValidationModalProps> = ({ events, sales, onToggleCheckIn, onUpdatePaymentStatus, onClose }) => {
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
    <Modal title="Portaria: Controle Individual" onClose={onClose}>
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Buscar Nome, Ticket ou Status</label>
            <div className="relative">
              <input 
                type="text" placeholder="Pesquisar..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
              />
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-400 uppercase font-black text-[9px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4">Detalhes</th>
                  <th className="px-6 py-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredTickets.length > 0 ? filteredTickets.map(t => (
                  <tr key={t.id} className={`transition-all ${t.checkedIn ? 'bg-emerald-50/10 dark:bg-emerald-900/5' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-xs">{t.uniqueTicketNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-800 dark:text-gray-100">{t.customerName}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{t.ticketTypeName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group/status">
                        <select
                          value={t.paymentStatus}
                          onChange={(e) => onUpdatePaymentStatus(t.saleId, e.target.value as PaymentStatus)}
                          className={`appearance-none font-black text-[10px] uppercase px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${getStatusColor(t.paymentStatus as PaymentStatus)}`}
                        >
                          <option value="Pago">Pago</option>
                          <option value="A pagar">A pagar</option>
                          <option value="Verificar depois">Verificar</option>
                        </select>
                        <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase pl-1">{t.paymentMethod}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       {t.details ? (
                         <div className="relative group/details cursor-help">
                           <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                             {t.details}
                           </div>
                           <div className="absolute hidden group-hover/details:block z-50 bg-gray-900 text-white text-[10px] p-3 rounded-xl w-48 shadow-xl -top-12 left-0 whitespace-normal">
                             {t.details}
                           </div>
                         </div>
                       ) : (
                         <span className="text-gray-300">---</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onToggleCheckIn(t.id)}
                        className={`min-w-[110px] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          t.checkedIn 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                        }`}
                      >
                        {t.checkedIn ? '✓ Check-in' : 'Validar'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">Nenhum registro encontrado</td>
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
