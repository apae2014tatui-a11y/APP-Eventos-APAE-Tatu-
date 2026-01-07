
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
        link.download = `Ticket_APAE_${sale.orderNumber}.png`;
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
        <div className="text-center mb-6">
          <div className="bg-indigo-600 text-white text-[10px] font-black py-1.5 px-4 rounded-full inline-block uppercase tracking-[0.2em] mb-3">
            APAE EVENTOS
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase">{event.name}</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{formatDate(event.date)}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <div className="mb-3 border-b border-gray-200 pb-2">
              <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5">Participante</p>
              <p className="text-md font-black text-gray-800">{sale.customerName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-[9px] uppercase font-black text-gray-400">Pagamento</p>
                <p className={`text-xs font-black ${sale.paymentStatus === 'Pago' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {sale.paymentStatus} ({sale.paymentMethod})
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-black text-gray-400">Pedido</p>
                <p className="text-xs font-black text-indigo-600">{sale.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] uppercase font-black text-gray-400">Ingressos Individuais</p>
              {sale.tickets.map((t) => (
                <div key={t.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-black text-indigo-600">{t.uniqueTicketNumber}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {event.ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-50 text-center">
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Validar na entrada via lista manual</p>
        </div>
      </div>

      <button 
        onClick={downloadSummary}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-8 rounded-2xl flex items-center gap-2 transition-all shadow-xl active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>BAIXAR COMPROVANTE</span>
      </button>
    </div>
  );
};

export default TicketCard;
