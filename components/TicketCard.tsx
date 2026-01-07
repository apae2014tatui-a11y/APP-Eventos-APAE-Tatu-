
import React, { useRef } from 'react';
import { Event, Sale } from '../types';

declare var html2canvas: any;

interface TicketCardProps {
  sale: Sale;
  event: Event;
}

const TicketCard: React.FC<TicketCardProps> = ({ sale, event }) => {
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);

  const downloadTicket = (index: number) => {
    const el = ticketRefs.current[index];
    if (el) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      html2canvas(el, { 
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `Comprovante_${sale.orderNumber}_${index + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (isMobile) alert("Comprovante salvo na galeria.");
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { dateStyle: 'medium' });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg">
        <p className="text-sm text-amber-800 font-medium">
          <strong>Aviso:</strong> Este comprovante não possui QR Code. A entrada será validada pelo nome ou número do pedido na recepção.
        </p>
      </div>

      {sale.tickets.map((ticket, index) => (
        <div key={ticket.id} className="flex flex-col items-center">
          <div 
            ref={el => { ticketRefs.current[index] = el; }}
            className="w-full max-w-sm bg-white text-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="text-center mb-6">
              <div className="bg-indigo-100 text-indigo-700 text-[10px] font-black py-1 px-4 rounded-full inline-block uppercase tracking-widest mb-3">
                Comprovante de Inscrição
              </div>
              <h3 className="text-2xl font-black text-gray-800 leading-tight uppercase">{event.name}</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">{formatDate(event.date)}</p>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 border-b border-gray-200 pb-3">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Participante</p>
                  <p className="text-lg font-black text-gray-800 truncate">{sale.customerName}</p>
                </div>
                
                <div className="border-r border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Pedido</p>
                  <p className="text-md font-black text-indigo-600">#{sale.orderNumber}</p>
                </div>

                <div className="pl-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo</p>
                  <p className="text-md font-black text-gray-700">
                    {event.ticketTypes.find(tt => tt.id === ticket.ticketTypeId)?.name}
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Instruções para Entrada</p>
                <div className="bg-white border border-gray-200 p-3 rounded-xl">
                  <p className="text-xs font-medium text-gray-600">Apresente este documento na recepção para realizar o Check-in manual.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">APAE EVENTOS</p>
            </div>
          </div>

          <button 
            onClick={() => downloadTicket(index)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>BAIXAR COMPROVANTE</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default TicketCard;
