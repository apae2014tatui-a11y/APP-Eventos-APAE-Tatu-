
import React, { useState, useCallback } from 'react';
import { Event, Sale, Ticket, ModalState } from './types';
import Header from './components/Header';
import EventList from './components/EventList';
import CreateEventModal from './components/CreateEventModal';
import EventMenuModal from './components/EventMenuModal';
import EventDashboardModal from './components/EventDashboardModal';
import SaleModal from './components/SaleModal';
import QrScannerModal from './components/QrScannerModal';

// Declarações para bibliotecas globais carregadas via CDN
declare var QRCode: any;
declare var html2canvas: any;
declare var Html5QrcodeScanner: any;
declare var Html5Qrcode: any;

// Dados iniciais para demonstração
const initialEvents: Event[] = [
  {
    id: 'evt-1',
    name: 'Conferência de Tecnologia 2024',
    date: '2024-12-10T09:00:00',
    ticketTypes: [
      { id: 'tt-1-1', name: 'Padrão', price: 150 },
      { id: 'tt-1-2', name: 'VIP', price: 400 },
    ],
  },
  {
    id: 'evt-2',
    name: 'Festival de Música Indie',
    date: '2024-11-22T18:00:00',
    ticketTypes: [
      { id: 'tt-2-1', name: 'Pista', price: 80 },
      { id: 'tt-2-2', name: 'Camarote', price: 250 },
    ],
  },
];


const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });
  const [lastCheckInStatus, setLastCheckInStatus] = useState<{ message: string; success: boolean } | null>(null);

  const handleOpenModal = (type: ModalState['type'], event?: Event) => {
    if (event) setSelectedEvent(event);
    setModalState({ type, event });
  };

  const handleCloseModal = () => {
    setModalState({ type: 'NONE' });
    setSelectedEvent(null);
    setLastCheckInStatus(null);
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
    handleCloseModal();
  };
  
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = { ...sale, id: `sale-${Date.now()}` };
    setSales(prev => [...prev, newSale]);
    // Não fecha o modal aqui para mostrar o ingresso gerado
    return newSale;
  };
  
  const handleCheckIn = useCallback((ticketId: string) => {
      let ticketFound = false;
      let alreadyCheckedIn = false;
      let eventName = '';
      let ticketTypeName = '';

      const updatedSales = sales.map(sale => {
          const ticketIndex = sale.tickets.findIndex(t => t.id === ticketId);
          if (ticketIndex !== -1) {
              const event = events.find(e => e.id === sale.eventId);
              eventName = event?.name || 'Desconhecido';
              const ticketType = event?.ticketTypes.find(tt => tt.id === sale.tickets[ticketIndex].ticketTypeId);
              ticketTypeName = ticketType?.name || 'Desconhecido';
              
              ticketFound = true;
              if (sale.tickets[ticketIndex].checkedIn) {
                  alreadyCheckedIn = true;
              } else {
                  const updatedTickets = [...sale.tickets];
                  updatedTickets[ticketIndex] = { ...updatedTickets[ticketIndex], checkedIn: true };
                  return { ...sale, tickets: updatedTickets };
              }
          }
          return sale;
      });

      if (ticketFound) {
          if (alreadyCheckedIn) {
              setLastCheckInStatus({ message: `Ingresso [${ticketTypeName}] já validado!`, success: false });
          } else {
              setSales(updatedSales);
              setLastCheckInStatus({ message: `Check-in realizado com sucesso! Ingresso [${ticketTypeName}] para ${eventName}.`, success: true });
          }
      } else {
          setLastCheckInStatus({ message: 'QR Code inválido ou ingresso não encontrado.', success: false });
      }
  }, [sales, events]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header onValidateEntry={() => handleOpenModal('SCANNER')} />
      <main className="p-4 sm:p-6 md:p-8">
        <EventList events={events} onEventClick={(event) => handleOpenModal('MENU', event)} />
        <button 
          onClick={() => handleOpenModal('CREATE_EVENT')}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110"
          aria-label="Criar Novo Evento"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </main>

      {modalState.type === 'CREATE_EVENT' && (
        <CreateEventModal onClose={handleCloseModal} onSave={addEvent} />
      )}
      {modalState.type === 'MENU' && selectedEvent && (
        <EventMenuModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onShowDashboard={() => handleOpenModal('DASHBOARD', selectedEvent)}
          onStartSale={() => handleOpenModal('SALE', selectedEvent)}
        />
      )}
       {modalState.type === 'DASHBOARD' && selectedEvent && (
        <EventDashboardModal
          event={selectedEvent}
          sales={sales.filter(s => s.eventId === selectedEvent.id)}
          onClose={handleCloseModal}
        />
      )}
      {modalState.type === 'SALE' && selectedEvent && (
        <SaleModal 
            event={selectedEvent}
            onClose={handleCloseModal}
            onSave={addSale}
        />
      )}
      {modalState.type === 'SCANNER' && (
        <QrScannerModal
            onClose={handleCloseModal}
            onScan={handleCheckIn}
            lastStatus={lastCheckInStatus}
        />
      )}
    </div>
  );
};

export default App;
