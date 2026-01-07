
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
    if (isFetching.current) return;
    isFetching.current = true;
    
    try {
      // Tenta buscar dados do Supabase
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

      // Mapear de volta para o CamelCase esperado pela UI
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
        orderNumber: s.ordernumber
      }));

      setEvents(mappedEvents);
      setSales(mappedSales);
      setError(null);
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      console.error("Erro Detectado:", msg);
      
      if (msg.includes("schema cache") || msg.includes("not find the table")) {
        setError("O servidor do Supabase ainda não reconheceu as novas tabelas (Erro de Schema Cache).");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // Tenta conectar ao Realtime
    const channel = supabaseClient
      .channel('apae-sync-hub')
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
    try {
      const formattedData = {
        name: eventData.name,
        date: new Date(eventData.date).toISOString(),
        tickettypes: eventData.ticketTypes
      };
      const { error } = await supabaseClient.from('eventos').insert([formattedData]);
      if (error) throw error;
      handleCloseModal();
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (confirm("Deseja realmente excluir este evento e todas as vendas vinculadas?")) {
      const { error } = await supabaseClient.from('eventos').delete().eq('id', eventId);
      if (error) alert("Erro ao excluir: " + error.message);
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
    const { count: totalSalesCount } = await supabaseClient
      .from('sales')
      .select('*', { count: 'exact', head: true });

    const currentYear = new Date().getFullYear();
    const startSeq = 1001 + (totalSalesCount || 0) * 10; 
    
    const individualTickets: Ticket[] = [];
    let localOffset = 0;
    
    saleData.ticketRequests.forEach(req => {
      for (let i = 0; i < req.qty; i++) {
        individualTickets.push({
          id: crypto.randomUUID(),
          saleId: "", 
          ticketTypeId: req.typeId,
          checkedIn: false,
          uniqueTicketNumber: `#${startSeq + localOffset}`
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
    
    if (error) {
      alert("Erro na venda: " + error.message);
      throw error;
    }
    return data[0] as Sale;
  };
  
  const toggleCheckIn = useCallback(async (ticketId: string) => {
    const saleWithTicket = sales.find(s => s.tickets.some(t => t.id === ticketId));
    if (!saleWithTicket) return;

    const updatedTickets = saleWithTicket.tickets.map(t => 
      t.id === ticketId ? { ...t, checkedIn: !t.checkedIn } : t
    );

    const { error } = await supabaseClient
      .from('sales')
      .update({ tickets: updatedTickets })
      .eq('id', saleWithTicket.id);

    if (error) console.error("Erro no check-in:", error.message);
  }, [sales]);

  const updatePaymentStatus = useCallback(async (saleId: string, newStatus: PaymentStatus) => {
    const { error } = await supabaseClient
      .from('sales')
      .update({ paymentstatus: newStatus })
      .eq('id', saleId);
      
    if (error) alert("Erro ao atualizar pagamento: " + error.message);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans pb-20 selection:bg-indigo-100">
      <Header onManualValidation={() => handleOpenModal('MANUAL_VALIDATION')} />
      
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {error ? (
          <div className="max-w-2xl mx-auto mt-10 p-10 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-red-100 dark:border-red-900/30">
            <div className="flex justify-center mb-8">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-center mb-4 uppercase tracking-tight">Problema de Sincronização</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 leading-relaxed text-center font-medium">
              O Supabase não encontrou as tabelas. Isso acontece quando o cache da API está desatualizado.
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl mb-8 space-y-4">
              <p className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                Como Resolver Definitivamente
              </p>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">1. No SQL Editor do Supabase, execute este comando:</p>
                  <code className="block bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400">NOTIFY pgrst, 'reload schema';</code>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">2. Verifique sua Anon Key:</p>
                  <p className="text-[10px] text-gray-500">A chave no arquivo <code className="bg-gray-100 p-0.5 rounded">supabase.ts</code> deve começar com <code className="bg-gray-100 p-0.5 rounded">eyJ...</code>. Se for diferente, ela está incorreta.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setLoading(true); setError(null); fetchInitialData(); }}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Recarregar Sistema
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-[5px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-400 animate-pulse">
              Conectando ao Supabase...
            </p>
          </div>
        ) : (
          <EventList 
            events={events} 
            onEventClick={(event) => handleOpenModal('MENU', event)} 
            onDeleteEvent={deleteEvent}
          />
        )}
        
        {!error && !loading && (
          <button 
            onClick={() => handleOpenModal('CREATE_EVENT')}
            className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 z-40 active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
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
