
import React, { useMemo } from 'react';
import { Event, Sale } from '../types';
import Modal from './Modal';

interface EventDashboardModalProps {
  event: Event;
  sales: Sale[];
  onClose: () => void;
}

const EventDashboardModal: React.FC<EventDashboardModalProps> = ({ event, sales, onClose }) => {

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalTickets = 0;
    let totalCheckIns = 0;

    sales.forEach(sale => {
      const saleRevenue = sale.tickets.reduce((acc, t) => {
        const tt = event.ticketTypes.find(type => type.id === t.ticketTypeId);
        return acc + (tt?.price || 0);
      }, 0);

      totalRevenue += saleRevenue;
      if (sale.paymentStatus === 'Pago') totalPaid += saleRevenue;
      else totalPending += saleRevenue;

      totalTickets += sale.tickets.length;
      totalCheckIns += sale.tickets.filter(t => t.checkedIn).length;
    });

    return { totalRevenue, totalPaid, totalPending, totalTickets, totalCheckIns };
  }, [event, sales]);

  const progressPercent = stats.totalTickets > 0 ? (stats.totalCheckIns / stats.totalTickets) * 100 : 0;

  return (
    <Modal title="Dashboard Financeiro" onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Receita Total Bruta</p>
          <p className="text-4xl font-black">R$ {stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Total Recebido</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">R$ {stats.totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-3xl border border-amber-100 dark:border-amber-800">
            <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Pendente</p>
            <p className="text-xl font-black text-amber-700 dark:text-amber-300">R$ {stats.totalPending.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 p-6 rounded-3xl border border-gray-100 dark:border-gray-600">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Progresso de Check-in</p>
              <p className="text-2xl font-black">{stats.totalCheckIns} <span className="text-gray-400 font-bold text-sm">/ {stats.totalTickets} ingressos</span></p>
            </div>
            <p className="text-indigo-600 font-black text-xl">{progressPercent.toFixed(0)}%</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-600 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-1000" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-tight">
            Use a tela de <span className="text-indigo-600">Validação Manual</span> para registrar a entrada dos participantes individualmente.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EventDashboardModal;
