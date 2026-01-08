
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Sale, Ticket, ModalState } from './types';
import { supabaseClient } from './supabase';
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
  const [tickets, setTickets] = useState<Ticket[]>([]); // Alterado de sales para tickets (participantes)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: eventsData, error: eError } = await supabaseClient
        .from('eventos')
        .select('id, name, date, tickettypes')
        .order('date', { ascending: true });
      
      const { data: participantsData, error: pError } = await supabaseClient
        .from('participantes')
        .select('*')
        .order('purchase_date', { ascending: false });
      
      if (eError) throw eError;
      if (pError) throw pError;

      const mappedEvents = (eventsData || []).map((e: any) => ({
        ...e,
        ticketTypes: e.tickettypes || []
      }));
      
      setEvents(mappedEvents);
      setTickets(participantsData || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    const channel = supabaseClient.channel('db-changes');

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eventos' }, (payload) => {
        const newEvent = { ...payload.new, ticketTypes: payload.new.tickettypes || [] };
        setEvents(currentEvents => [newEvent, ...currentEvents]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eventos' }, (payload) => {
        const updatedEvent = { ...payload.new, ticketTypes: payload.new.tickettypes || [] };
        setEvents(currentEvents => currentEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'eventos' }, (payload) => {
        setEvents(currentEvents => currentEvents.filter(e => e.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participantes' }, (payload) => {
        setTickets(currentTickets => [payload.new as Ticket, ...currentTickets]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'participantes' }, (payload) => {
        setTickets(currentTickets => currentTickets.map(t => t.id === payload.new.id ? payload.new as Ticket : t));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'participantes' }, (payload) => {
        setTickets(currentTickets => currentTickets.filter(t => t.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchInitialData]);

  const sales = useMemo((): Sale[] => {
    const salesMap = new Map<string, Sale>();
    tickets.forEach(ticket => {
      const sale = salesMap.get(ticket.order_number);
      if (sale) {
        sale.tickets.push(ticket);
      } else {
        salesMap.set(ticket.order_number, {
          id: ticket.order_number,
          orderNumber: ticket.order_number,
          customerName: ticket.customer_name,
          customerPhone: ticket.customer_phone,
          paymentStatus: ticket.payment_status,
          paymentMethod: ticket.payment_method,
          details: ticket.details,
          eventId: ticket.event_id,
          timestamp: ticket.purchase_date,
          tickets: [ticket]
        });
      }
    });
    return Array.from(salesMap.values());
  }, [tickets]);

  const handleOpenModal = (type: ModalState['type'], event?: Event) => {
    setModalState({ type, event });
  };

  const handleCloseModal = () => {
    setModalState({ type: 'NONE' });
  };

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    const formattedData = {
      name: eventData.name,
      date: new Date(eventData.date).toISOString(),
      tickettypes: eventData.ticketTypes
    };
    await supabaseClient.from('eventos').insert([formattedData]);
    handleCloseModal();
  };

  const deleteEvent = async (eventId: string) => {
    if (confirm("Excluir evento permanentemente?")) {
      await supabaseClient.from('eventos').delete().eq('id', eventId);
    }
  };
  
  const addSale = async (saleData: any): Promise<Ticket[]> => {
    const { count: totalTicketsCount } = await supabaseClient
      .from('participantes')
      .select('*', { count: 'exact', head: true });

    const currentYear = new Date().getFullYear();
    const orderNumber = `ORD-${currentYear}-${((totalTicketsCount || 0) + 1).toString().padStart(4, '0')}`;
    
    const participantsToInsert: Omit<Ticket, 'id' | 'purchase_date'>[] = [];
    let startSeq = 1001 + (totalTicketsCount || 0);

    saleData.ticketRequests.forEach((req: any) => {
      for (let i = 0; i < req.qty; i++) {
        participantsToInsert.push({
          event_id: saleData.eventId,
          customer_name: saleData.customerName,
          customer_phone: saleData.customerPhone,
          unique_ticket_number: `#${startSeq++}`,
          ticket_type_id: req.typeId,
          payment_status: saleData.paymentStatus,
          payment_method: saleData.paymentMethod,
          details: saleData.details || "",
          checked_in: false,
          order_number: orderNumber,
        });
      }
    });

    const { data, error } = await supabaseClient
      .from('participantes')
      .insert(participantsToInsert)
      .select();

    if (error) throw error;
    return data as Ticket[];
  };
  
  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Pick<Ticket, 'checked_in' | 'payment_status'>>) => {
    const originalTickets = [...tickets]; // Faz uma cópia para o caso de reversão
    const dbUpdates: any = {};
    if (updates.payment_status !== undefined) dbUpdates.payment_status = updates.payment_status;
    if (updates.checked_in !== undefined) dbUpdates.checked_in = updates.checked_in;
    
    // Atualização otimista da UI
    setTickets(currentTickets => currentTickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
    
    const { error } = await supabaseClient
      .from('participantes')
      .update(dbUpdates)
      .eq('id', ticketId);

    if (error) {
        alert("Erro ao sincronizar: " + error.message + "\n\nA alteração não foi salva e será revertida.");
        setTickets(originalTickets); // Reverte a UI em caso de erro
    }
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans pb-20 selection:bg-indigo-100">
      <Header onManualValidation={() => handleOpenModal('MANUAL_VALIDATION')} />
      
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {error ? (
          <div className="max-w-2xl mx-auto mt-10 p-10 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-red-100 dark:border-red-900/30 text-center">
             <h2 className="text-xl font-black mb-4 uppercase">Erro de Sincronização</h2>
             <p className="text-gray-500 mb-6">{error}</p>
             <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Tentar Novamente</button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div className="w-12 h-12 border-[5px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-400">Carregando Cloud Hub...</p>
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
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 z-40 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 M 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </main>

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
          tickets={tickets} 
          onUpdateTicket={updateTicket} 
          onClose={handleCloseModal} 
        />
      )}
      {modalState.type === 'ATTENDEE_LIST' && modalState.event && (
        <AttendeeListModal 
          event={modalState.event} 
          tickets={tickets.filter(t => t.event_id === modalState.event!.id)} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default App;
