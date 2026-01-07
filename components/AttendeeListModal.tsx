
import React from 'react';
import { Event, Sale } from '../types';
import Modal from './Modal';

interface AttendeeListModalProps {
  event: Event;
  sales: Sale[];
  onClose: () => void;
}

const AttendeeListModal: React.FC<AttendeeListModalProps> = ({ event, sales, onClose }) => {
  const totalTickets = sales.reduce((acc, s) => acc + s.tickets.length, 0);
  const totalCheckedIn = sales.reduce((acc, s) => acc + s.tickets.filter(t => t.checkedIn).length, 0);

  return (
    <Modal title={`Participantes: ${event.name}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Vendas</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{sales.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Ingressos</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalTickets}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl col-span-2 sm:col-span-1">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Presença</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{totalCheckedIn}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Qtde</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {sales.length > 0 ? sales.map(sale => {
                  const saleCheckIns = sale.tickets.filter(t => t.checkedIn).length;
                  const isFullyCheckedIn = saleCheckIns === sale.tickets.length;
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">#{sale.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 dark:text-gray-100">{sale.customerName}</div>
                        <div className="text-[10px] text-gray-400">{sale.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-black text-gray-600 dark:text-gray-400 text-xs">
                          {sale.tickets.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isFullyCheckedIn ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                            Total
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">
                            {saleCheckIns}/{sale.tickets.length}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium tracking-tight">Nenhuma venda registrada para este evento.</td>
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
