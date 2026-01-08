
import React, { useRef, useState, useEffect } from 'react';
import { Event, Sale, Ticket } from '../types';

declare var html2canvas: any;

interface TicketCardProps {
  sale: Sale;
  event: Event;
}

const TicketCard: React.FC<TicketCardProps> = ({ sale, event }) => {
  const ticketTemplateRef = useRef<HTMLDivElement>(null);
  const [ticketToRender, setTicketToRender] = useState<Ticket | null>(null);
  const [renderingTicketId, setRenderingTicketId] = useState<string | null>(null);

  // --- Funções de formatação e sanitização ---
  const sanitizeFilename = (name: string): string => {
    return name
      .replace(/\s+/g, '_')
      .replace(/[\\/:*?"<>|]/g, '');
  };

  const formatDateForFilename = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch (e) {
      return 'invalid_date';
    }
  };

  const formatPurchaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- Efeito para acionar o html2canvas após a renderização do template ---
  useEffect(() => {
    if (ticketToRender && ticketTemplateRef.current) {
      html2canvas(ticketTemplateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      }).then((canvas: HTMLCanvasElement) => {
        // FIX: A propriedade correta é 'unique_ticket_number' em vez de 'uniqueTicketNumber'.
        const ticketNumber = ticketToRender.unique_ticket_number.replace('#', '');
        const customerName = sanitizeFilename(sale.customerName);
        const eventName = sanitizeFilename(event.name);
        const eventDate = formatDateForFilename(event.date);
        const filename = `${ticketNumber}-${customerName}-${eventName}-${eventDate}.png`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          alert(`Comprovante ${ticketNumber} salvo na galeria.`);
        }
      }).catch((error) => {
        console.error("Erro ao gerar canvas:", error);
        alert(`Falha ao gerar o comprovante: ${error.message}`);
      }).finally(() => {
        // Limpa os estados após o download (sucesso ou falha)
        setRenderingTicketId(null);
        setTicketToRender(null);
      });
    }
  }, [ticketToRender, sale, event]);

  // --- Função chamada pelo clique do botão ---
  const handleDownloadClick = (ticket: Ticket) => {
    setRenderingTicketId(ticket.id);
    setTicketToRender(ticket);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Template Oculto para Geração do Canvas */}
      <div className="fixed left-[-9999px] top-0">
        {ticketToRender && (
          <div ref={ticketTemplateRef} className="w-[380px] bg-white text-gray-900 p-8 border-4 border-indigo-600 font-sans">
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-200">
              <h2 className="text-2xl font-black text-indigo-700 uppercase tracking-wider">Comprovante de Ingresso</h2>
              <p className="text-xs font-bold text-gray-400 mt-1">APAE EVENTOS</p>
            </div>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Número do Ingresso</p>
                {/* FIX: A propriedade correta é 'unique_ticket_number' em vez de 'uniqueTicketNumber'. */}
                <p className="text-2xl font-black text-indigo-600 font-mono tracking-tight">{ticketToRender.unique_ticket_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome do Cliente</p>
                <p className="text-lg font-bold text-gray-800">{sale.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Evento</p>
                <p className="text-lg font-bold text-gray-800">{event.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data da Compra</p>
                <p className="text-sm font-semibold text-gray-600">{formatPurchaseDate(sale.timestamp)}</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-200 text-center">
              <p className="text-[10px] font-bold text-gray-400">Apresente este comprovante na entrada.</p>
            </div>
          </div>
        )}
      </div>

      {/* UI Visível para o Usuário */}
      <div className="w-full max-w-sm text-center">
        <svg className="mx-auto w-16 h-16 text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl font-black mt-4">Venda Realizada!</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Baixe o comprovante individual para cada ingresso abaixo.</p>
      </div>

      <div className="w-full max-w-sm mt-6 space-y-3">
        {sale.tickets.map(ticket => (
          <div key={ticket.id} className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-600 flex justify-between items-center">
            <div>
              {/* FIX: A propriedade correta é 'unique_ticket_number' em vez de 'uniqueTicketNumber'. */}
              <p className="font-black text-indigo-600 dark:text-indigo-400">{ticket.unique_ticket_number}</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                {/* FIX: A propriedade correta é 'ticket_type_id' em vez de 'ticketTypeId'. */}
                {event.ticketTypes.find(tt => tt.id === ticket.ticket_type_id)?.name}
              </p>
            </div>
            <button
              onClick={() => handleDownloadClick(ticket)}
              disabled={!!renderingTicketId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-wait"
            >
              {renderingTicketId === ticket.id ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              )}
              <span>{renderingTicketId === ticket.id ? 'Gerando...' : 'Baixar'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketCard;