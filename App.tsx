
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Event, Sale, Ticket, ModalState, PaymentStatus, PaymentMethod } from './types';
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
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });
  
  const isFetching = useRef(false);

  const fetchInitialData = useCallback(async () => {
    // Permitimos múltiplas chamadas se forem disparadas pelo realtime
    try {
      const { data: eventsData, error: eError } = await supabaseClient
        .from('eventos')
        .select('id, name, date, tickettypes')
        .order('date', { ascending: true });
        
      const { data: salesData, error: sError } = await supabaseClient
        .from('sales')
        .select('id, eventid, customername, customerphone, paymentstatus, paymentmethod, details, ordernumber, timestamp, tickets')
        .order('timestamp', { ascending: false });
      
      if (eError) throw eError;
      if (sError) throw sError;

      const mappedEvents = (eventsData || []).map((e: any) => ({
        ...e,
        ticketTypes: e.tickettypes || []
      }));

      const mappedSales = (salesData || []).map((s: any) => ({
        ...s,
        eventId: s.eventid,
        customerName: s.customername,
        customerPhone: s.customerphone,
        paymentStatus: s.paymentstatus,
        paymentMethod: s.paymentmethod,
        orderNumber: s.ordernumber,
        tickets: s.tickets || []
      }));

      setEvents(mappedEvents);
      setSales(mappedSales);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // ESCUTA EM TEMPO REAL: Qualquer mudança no banco atualiza a UI instantaneamente
    const channel = supabaseClient
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => fetchInitialData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchInitialData())
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchInitialData]);

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
  
  const addSale = async (saleData: any) => {
    const { count: totalSalesCount } = await supabaseClient
      .from('sales')
      .select('*', { count: 'exact', head: true });

    const currentYear = new Date().getFullYear();
    const startSeq = 1001 + (totalSalesCount || 0) * 5; 
    
    const individualTickets: Ticket[] = [];
    let localOffset = 0;
    
    saleData.ticketRequests.forEach((req: any) => {
      for (let i = 0; i < req.qty; i++) {
        individualTickets.push({
          id: crypto.randomUUID(),
          saleId: "", 
          ticketTypeId: req.typeId,
          checkedIn: false,
          uniqueTicketNumber: `#${startSeq + localOffset}`,
          paymentStatus: saleData.paymentStatus // Inicia com o status geral
        });
        localOffset++;
      }
    });

    const orderNumber = `ORD-${currentYear}-${((totalSalesCount || 0) + 1).toString().padStart(4, '0')}`;
    
    const finalSale = {
      eventid: saleData.eventId,
      customername: saleData.customerName,
      customerphone: saleData.customerPhone,
      paymentstatus: saleData.paymentStatus,
      paymentmethod: saleData.paymentMethod,
      details: saleData.details || "",
      ordernumber: orderNumber,
      timestamp: new Date().toISOString(),
      tickets: individualTickets
    };

    const { data, error } = await supabaseClient.from('sales').insert([finalSale]).select();
    if (error) throw error;
    return data[0] as Sale;
  };
  
  const updateTicketIndividualStatus = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    const originalSales = sales;
    let updatedSale: Sale | null = null;

    const newSales = originalSales.map(sale => ({
      ...sale,
      tickets: sale.tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return { ...ticket, ...updates };
        }
        return ticket;
      })
    }));

    for (const sale of newSales) {
      if (sale.tickets.some(t => t.id === ticketId)) {
        updatedSale = sale;
        break;
      }
    }
    
    if (!updatedSale) {
      console.error("Não foi possível encontrar a venda para atualizar.");
      return;
    }
    
    // ATUALIZAÇÃO OTIMISTA: Muda a UI imediatamente
    setSales(newSales);

    // PERSISTÊNCIA: Envia a alteração para o banco de dados
    const { error } = await supabaseClient
      .from('sales')
      .update({ tickets: updatedSale.tickets })
      .eq('id', updatedSale.id);

    // REVERSÃO EM CASO DE ERRO: Se a sincronização falhar, desfaz a alteração e notifica o usuário
    if (error) {
        alert("Erro ao sincronizar: " + error.message + "\n\nA alteração não foi salva.");
        setSales(originalSales);
    }
  }, [sales]);

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
          sales={sales} 
          onUpdateTicket={updateTicketIndividualStatus} 
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
