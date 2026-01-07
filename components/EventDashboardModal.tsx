
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
    const revenuePerType: { [key: string]: { sold: number; revenue: number; checkIns: number } } = {};
    event.ticketTypes.forEach(tt => {
      revenuePerType[tt.id] = { sold: 0, revenue: 0, checkIns: 0 };
    });

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalCheckIns = 0;

    for (const sale of sales) {
      for (const ticket of sale.tickets) {
        const ticketType = event.ticketTypes.find(tt => tt.id === ticket.ticketTypeId);
        if (ticketType) {
          revenuePerType[ticketType.id].sold += 1;
          revenuePerType[ticketType.id].revenue += ticketType.price;
          if (ticket.checkedIn) {
            revenuePerType[ticketType.id].checkIns += 1;
            totalCheckIns += 1;
          }
          totalRevenue += ticketType.price;
          totalTicketsSold += 1;
        }
      }
    }
    return { revenuePerType, totalRevenue, totalTicketsSold, totalCheckIns };
  }, [event, sales]);

  const calculateDaysRemaining = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    if (diffTime < 0) return "Evento já ocorreu";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dia(s) restante(s)`;
  };

  return (
    <Modal title={`Dashboard: ${event.name}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg">
          <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Contagem Regressiva</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{calculateDaysRemaining()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
             <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingressos Vendidos</p>
                <p className="text-2xl font-bold">{stats.totalTicketsSold}</p>
            </div>
             <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-ins Realizados</p>
                <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
            </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Detalhes por Tipo de Ingresso</h3>
          <div className="space-y-3">
            {event.ticketTypes.map(ticketType => {
              const typeStats = stats.revenuePerType[ticketType.id];
              return (
                <div key={ticketType.id} className="bg-white dark:bg-gray-700/80 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-bold text-md">{ticketType.name}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-center">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block">Vendidos</span>
                        <span className="font-semibold">{typeStats.sold}</span>
                    </div>
                     <div>
                        <span className="text-gray-500 dark:text-gray-400 block">Receita</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">R$ {typeStats.revenue.toFixed(2)}</span>
                    </div>
                     <div>
                        <span className="text-gray-500 dark:text-gray-400 block">Check-ins</span>
                        <span className="font-semibold">{typeStats.checkIns}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventDashboardModal;
