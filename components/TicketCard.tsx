
import React, { useRef } from 'react';
import { Event, Sale } from '../types';

declare var html2canvas: any;

interface TicketCardProps {
  sale: Sale;
  event: Event;
}

const TicketCard: React.FC<TicketCardProps> = ({ sale, event }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const downloadSummary = () => {
    if (containerRef.current) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      html2canvas(containerRef.current, { 
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `Comprovante_APAE_${sale.orderNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (isMobile) alert("Comprovante salvo na galeria.");
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { dateStyle: 'long' });
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="w-full max-w-sm bg-white text-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="bg-indigo-600 text-white text-[10px] font-black py-1.5 px-4 rounded-full inline-block uppercase tracking-[0.2em] mb-4 shadow-lg shadow-indigo-100">
            APAE EVENTOS
          </div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight uppercase tracking-tighter">{event.name}</h3>
          <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest">{formatDate(event.date)}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Responsável</p>
              <p className="text-lg font-black text-gray-800 truncate">{sale.customerName}</p>
              <p className="text-xs font-bold text-gray-500">{sale.customerPhone}</p>
            </div>
            
            <div className="mb-2">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Ingressos Individuais</p>
              <div className="space-y-2">
                {sale.tickets.map((t, i) => (
                  <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-xs font-black text-indigo-600">{t.uniqueTicketNumber}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      {event.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-4">
             <div>
                <p className="text-[10px] uppercase font-black text-gray-300">Pedido</p>
                <p className="text-sm font-black text-gray-500">#{sale.orderNumber}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] uppercase font-black text-gray-300">Total Pago</p>
                <p className="text-lg font-black text-indigo-600">
                  R$ {sale.tickets.reduce((acc, t) => acc + (event.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.price || 0), 0).toFixed(2)}
                </p>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Autenticação Manual Requerida</p>
        </div>
      </div>

      <button 
        onClick={downloadSummary}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-xl active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>BAIXAR COMPROVANTE</span>
      </button>
    </div>
  );
};

export default TicketCard;
