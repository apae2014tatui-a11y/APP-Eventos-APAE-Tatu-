
import React, { useState, useCallback } from 'react';
import { Event, Sale, Ticket, ModalState } from './types';
import Header from './components/Header';
import EventList from './components/EventList';
import CreateEventModal from './components/CreateEventModal';
import EventMenuModal from './components/EventMenuModal';
import EventDashboardModal from './components/EventDashboardModal';
import SaleModal from './components/SaleModal';
import ManualValidationModal from './components/ManualValidationModal';
import AttendeeListModal from './components/AttendeeListModal';

const initialEvents: Event[] = [
  {
    id: 'evt-1',
    name: 'Conferência APAE 2024',
    date: '2024-12-10T09:00:00',
    ticketTypes: [
      { id: 'tt-1-1', name: 'Padrão', price: 150 },
      { id: 'tt-1-2', name: 'VIP', price: 400 },
    ],
  },
];

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [sales, setSales] = useState<Sale[]>([]);
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  // Tracking total tickets sold across all events to maintain a global sequential counter
  // In a real app, this would be scoped per event or global DB sequence
  const [globalTicketCounter, setGlobalTicketCounter] = useState(1);

  const handleOpenModal = (type: ModalState['type'], event?: Event) => {
    setModalState({ type, event });
  };

  const handleCloseModal = () => {
    setModalState({ type: 'NONE' });
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
    handleCloseModal();
  };

  const deleteEvent = (eventId: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setSales(prev => prev.filter(s => s.eventId !== eventId));
    }
  };
  
  const addSale = (saleData: Omit<Sale, 'id' | 'orderNumber' | 'timestamp' | 'tickets'> & { ticketRequests: { typeId: string, qty: number }[] }) => {
    const year = new Date().getFullYear();
    const orderCount = sales.filter(s => s.eventId === saleData.eventId).length + 1;
    const orderNumber = `ORD-${year}-${orderCount.toString().padStart(3, '0')}`;
    const saleId = `sale-${Date.now()}`;
    
    let currentCounter = globalTicketCounter;
    const individualTickets: Ticket[] = [];

    saleData.ticketRequests.forEach(req => {
      for (let i = 0; i < req.qty; i++) {
        individualTickets.push({
          id: `tkt-${Date.now()}-${currentCounter}`,
          saleId: saleId,
          ticketTypeId: req.typeId,
          checkedIn: false,
          uniqueTicketNumber: `EVT-${year}-${currentCounter.toString().padStart(4, '0')}`
        });
        currentCounter++;
      }
    });

    setGlobalTicketCounter(currentCounter);

    const newSale: Sale = { 
      eventId: saleData.eventId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      id: saleId,
      orderNumber,
      timestamp: Date.now(),
      tickets: individualTickets
    };

    setSales(prev => [...prev, newSale]);
    return newSale;
  };
  
  const toggleCheckIn = useCallback((ticketId: string) => {
      setSales(prevSales => prevSales.map(sale => {
          const ticketIndex = sale.tickets.findIndex(t => t.id === ticketId);
          if (ticketIndex !== -1) {
              const updatedTickets = [...sale.tickets];
              updatedTickets[ticketIndex] = { 
                ...updatedTickets[ticketIndex], 
                checkedIn: !updatedTickets[ticketIndex].checkedIn 
              };
              return { ...sale, tickets: updatedTickets };
          }
          return sale;
      }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans pb-20">
      <Header 
        onManualValidation={() => handleOpenModal('MANUAL_VALIDATION')}
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <EventList 
          events={events} 
          onEventClick={(event) => handleOpenModal('MENU', event)} 
          onDeleteEvent={deleteEvent}
        />
        
        <button 
          onClick={() => handleOpenModal('CREATE_EVENT')}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 z-40"
          aria-label="Criar Novo Evento"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </main>

      {modalState.type === 'CREATE_EVENT' && (
        <CreateEventModal onClose={handleCloseModal} onSave={addEvent} />
      )}
      {modalState.type === 'MENU' && modalState.event && (
        <EventMenuModal
          event={modalState.event}
          onClose={handleCloseModal}
          onShowDashboard={() => handleOpenModal('DASHBOARD', modalState.event)}
          onStartSale={() => handleOpenModal('SALE', modalState.event)}
          onShowAttendees={() => handleOpenModal('ATTENDEE_LIST', modalState.event)}
        />
      )}
      {modalState.type === 'DASHBOARD' && modalState.event && (
        <EventDashboardModal
          event={modalState.event}
          sales={sales.filter(s => s.eventId === modalState.event!.id)}
          onClose={handleCloseModal}
        />
      )}
      {modalState.type === 'SALE' && modalState.event && (
        <SaleModal 
            event={modalState.event}
            onClose={handleCloseModal}
            onSave={addSale}
        />
      )}
      {modalState.type === 'MANUAL_VALIDATION' && (
        <ManualValidationModal
          events={events}
          sales={sales}
          onToggleCheckIn={toggleCheckIn}
          onClose={handleCloseModal}
        />
      )}
      {modalState.type === 'ATTENDEE_LIST' && modalState.event && (
        <AttendeeListModal
          event={modalState.event}
          sales={sales.filter(s => s.eventId === modalState.event!.id)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;
