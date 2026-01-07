
import React, { useRef, useEffect } from 'react';
import { Event, Sale } from '../types';

declare var QRCode: any;
declare var html2canvas: any;

interface TicketCardProps {
  sale: Sale;
  event: Event;
}

const TicketCard: React.FC<TicketCardProps> = ({ sale, event }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const qrCodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    sale.tickets.forEach((ticket, index) => {
      const qrElement = qrCodeRefs.current[index];
      if (qrElement) {
        // Limpa o QR code anterior antes de gerar um novo
        qrElement.innerHTML = '';
        new QRCode(qrElement, {
          text: ticket.id,
          width: 80,
          height: 80,
          colorDark: "#000000",
          colorLight: "#ffffff",
        });
      }
    });
  }, [sale.tickets]);
  
  const handleDownload = () => {
    if (ticketRef.current) {
        html2canvas(ticketRef.current, {
            scale: 2, // Aumenta a resolução da imagem
            backgroundColor: null, // Usa o fundo do elemento
        }).then((canvas: HTMLCanvasElement) => {
            const link = document.createElement('a');
            link.download = `ingresso-${event.name.replace(/\s+/g, '-')}-${sale.customerName.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
  };

  const getTicketTypeName = (ticketTypeId: string) => {
    return event.ticketTypes.find(tt => tt.id === ticketTypeId)?.name || 'Ingresso';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  };

  return (
    <div>
        <div ref={ticketRef} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{event.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(event.date)}</p>
            </div>
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                <p className="font-semibold text-lg">{sale.customerName}</p>
            </div>
            <div className="space-y-3">
                 <p className="text-sm text-gray-500 dark:text-gray-400">Seus Ingressos:</p>
                {sale.tickets.map((ticket, index) => (
                    <div key={ticket.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                        <div>
                            <p className="font-bold">{getTicketTypeName(ticket.ticketTypeId)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">ID: {ticket.id}</p>
                        </div>
                        <div ref={el => qrCodeRefs.current[index] = el}></div>
                    </div>
                ))}
            </div>
        </div>
        <div className="mt-6 flex justify-center">
            <button onClick={handleDownload} className="px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-bold flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Baixar Ingresso(s)</span>
            </button>
        </div>
    </div>
  );
};

export default TicketCard;
