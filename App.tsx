
import React, { useState, useEffect, useCallback } from 'react';
import { Event, Sale, Ticket, ModalState, PaymentStatus, PaymentMethod } from './types';
import { db } from './firebase';
import Header from './components/Header';
import EventList from './components/EventList';
import CreateEventModal from './components/CreateEventModal';
import EventMenuModal from './components/EventMenuModal';
import EventDashboardModal from './components/EventDashboardModal';
import SaleModal from './components/SaleModal';
import ManualValidationModal from './components/ManualValidationModal';
import AttendeeListModal from './components/AttendeeListModal';

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  // Sincronização em tempo real de Eventos
  useEffect(() => {
    const unsubscribe = db.collection('events').onSnapshot((snapshot: any) => {
      const eventsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronização em tempo real de Vendas e Ingressos
  useEffect(() => {
    const unsubscribe = db.collection('sales').onSnapshot((snapshot: any) => {
      const salesData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (type: ModalState['type'], event?: Event) => {
    setModalState({ type, event });
  };

  const handleCloseModal = () => {
    setModalState({ type: 'NONE' });
  };

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      await db.collection('events').add(eventData);
      handleCloseModal();
    } catch (error) {
      alert("Erro ao criar evento na nuvem: " + error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (confirm("Deseja excluir este evento na nuvem? Todos os ingressos serão perdidos.")) {
      try {
        await db.collection('events').doc(eventId).delete();
        // Nota: Em produção, usaríamos uma Cloud Function para deletar vendas/tickets vinculados
        const salesToDel = sales.filter(s => s.eventId === eventId);
        salesToDel.forEach(s => db.collection('sales').doc(s.id).delete());
      } catch (error) {
        alert("Erro ao deletar: " + error);
      }
    }
  };
  
  const addSale = async (saleData: {
    eventId: string,
    customerName: string,
    customerPhone: string,
    paymentStatus: PaymentStatus,
    paymentMethod: PaymentMethod,
    details?: string,
    ticketRequests: { typeId: string, qty: number }[]
  }) => {
    const year = new Date().getFullYear();
    
    // Obter contador global (em um app real, usaríamos transações do Firestore)
    // Para este exemplo, calculamos com base no total de ingressos já existentes
    const ticketsSnapshot = await db.collectionGroup('tickets').get();
    let currentSeq = 1001 + ticketsSnapshot.size;
    
    const individualTickets: Ticket[] = [];
    saleData.ticketRequests.forEach(req => {
      for (let i = 0; i < req.qty; i++) {
        individualTickets.push({
          id: `tkt-${Date.now()}-${currentSeq}`,
          saleId: "", // Será preenchido pelo ID do doc da venda
          ticketTypeId: req.typeId,
          checkedIn: false,
          uniqueTicketNumber: `#${currentSeq}`
        });
        currentSeq++;
      }
    });

    const orderNumber = `ORD-${year}-${(sales.length + 1).toString().padStart(3, '0')}`;
    
    const newSaleRef = db.collection('sales').doc();
    const finalSale: Sale = {
      id: newSaleRef.id,
      eventId: saleData.eventId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      paymentStatus: saleData.paymentStatus,
      paymentMethod: saleData.paymentMethod,
      details: saleData.details || "",
      orderNumber,
      timestamp: Date.now(),
      tickets: individualTickets.map(t => ({ ...t, saleId: newSaleRef.id }))
    };

    await newSaleRef.set(finalSale);
    return finalSale;
  };
  
  const toggleCheckIn = useCallback(async (ticketId: string) => {
    // Busca a venda que contém o ticket
    const saleWithTicket = sales.find(s => s.tickets.some(t => t.id === ticketId));
    if (saleWithTicket) {
      const updatedTickets = saleWithTicket.tickets.map(t => 
        t.id === ticketId ? { ...t, checkedIn: !t.checkedIn } : t
      );
      await db.collection('sales').doc(saleWithTicket.id).update({
        tickets: updatedTickets
      });
    }
  }, [sales]);

  const updatePaymentStatus = useCallback(async (saleId: string, newStatus: PaymentStatus) => {
    await db.collection('sales').doc(saleId).update({
      paymentStatus: newStatus
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans pb-20">
      <Header onManualValidation={() => handleOpenModal('MANUAL_VALIDATION')} />
      
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase tracking-widest text-xs text-gray-400">Sincronizando com a Nuvem...</p>
          </div>
        ) : (
          <EventList 
            events={events} 
            onEventClick={(event) => handleOpenModal('MENU', event)} 
            onDeleteEvent={deleteEvent}
          />
        )}
        
        <button 
          onClick={() => handleOpenModal('CREATE_EVENT')}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </main>

      {/* Modais existentes mantendo a lógica de props, agora conectadas ao Firestore via App.tsx */}
      {modalState.type === 'CREATE_EVENT' && <CreateEventModal onClose={handleCloseModal} onSave={addEvent} />}
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
        <SaleModal event={modalState.event} onClose={handleCloseModal} onSave={addSale} />
      )}
      {modalState.type === 'MANUAL_VALIDATION' && (
        <ManualValidationModal 
          events={events} 
          sales={sales} 
          onToggleCheckIn={toggleCheckIn} 
          onUpdatePaymentStatus={updatePaymentStatus}
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
