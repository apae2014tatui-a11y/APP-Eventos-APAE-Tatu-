
import React, { useMemo, useState } from 'react';
import { Event, Ticket } from '../types';
import Modal from './Modal';

interface AttendeeListModalProps {
  event: Event;
  tickets: Ticket[]; // Alterado de sales para tickets
  onClose: () => void;
}

const AttendeeListModal: React.FC<AttendeeListModalProps> = ({ event, tickets, onClose }) => {
  const [filter, setFilter] = useState('');

  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const totalCheckedIn = tickets.filter(t => t.checked_in).length;
    return { totalTickets, totalCheckedIn };
  }, [tickets]);

  const flatAttendees = useMemo(() => {
    const all = tickets.map(t => ({
      ...t,
      ticketTypeName: event.ticketTypes.find(tt => tt.id === t.ticket_type_id)?.name || '---'
    }));
    
    if (!filter) return all;
    const lower = filter.toLowerCase();
    return all.filter(a => 
      a.customer_name.toLowerCase().includes(lower) || 
      a.unique_ticket_number.toLowerCase().includes(lower)
    );
  }, [tickets, event, filter]);

  return (
    <Modal title={`Gestão de Ingressos: ${event.name}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Vendido</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{stats.totalTickets}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Presença</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.totalCheckedIn}</p>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" placeholder="Filtrar participantes..." value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
          />
          <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div className="rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Financeiro</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {flatAttendees.length > 0 ? flatAttendees.map(at => (
                  <tr key={at.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-indigo-600 text-xs">{at.unique_ticket_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 dark:text-gray-100">{at.customer_name}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{at.ticketTypeName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-[10px] font-black uppercase ${at.payment_status === 'Pago' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {at.payment_status}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold">{at.payment_method}</div>
                    </td>
                    <td className="px-6 py-4">
                      {at.checked_in ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                          No Evento
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 text-[10px] font-black uppercase">
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-black uppercase text-[10px]">Sem dados para exibir</td>
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

export default AttendeeListModal;
