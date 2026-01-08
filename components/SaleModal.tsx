
import React, { useState } from 'react';
import { Event, Sale, Ticket, PaymentStatus, PaymentMethod } from '../types';
import Modal from './Modal';
import TicketCard from './TicketCard';

interface SaleModalProps {
  event: Event;
  onClose: () => void;
  onSave: (saleData: any) => Promise<Ticket[]>;
}

interface CartItem {
  ticketTypeId: string;
  quantity: number;
}

const SaleModal: React.FC<SaleModalProps> = ({ event, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pago');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [details, setDetails] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [completedTickets, setCompletedTickets] = useState<Ticket[] | null>(null);

  const updateCart = (ticketTypeId: string, quantity: number) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.ticketTypeId === ticketTypeId);
      if (quantity > 0) {
        if (existingItem) {
          return currentCart.map(item => item.ticketTypeId === ticketTypeId ? { ...item, quantity } : item);
        } else {
          return [...currentCart, { ticketTypeId, quantity }];
        }
      } else {
        return currentCart.filter(item => item.ticketTypeId !== ticketTypeId);
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (customerName && customerPhone && totalQty > 0) {
      const saleRequest = {
        eventId: event.id,
        customerName,
        customerPhone,
        paymentStatus,
        paymentMethod,
        details,
        ticketRequests: cart.map(item => ({ typeId: item.ticketTypeId, qty: item.quantity }))
      };
      
      try {
        const savedTickets = await onSave(saleRequest);
        setCompletedTickets(savedTickets);
      } catch (error) {
        console.error("Erro ao salvar venda:", error);
        alert("Ocorreu um erro ao registrar a venda. Por favor, tente novamente.");
      }
    } else {
       alert("Por favor, preencha todos os campos obrigatórios (Nome, Telefone e Ingressos).");
    }
  };
  
  const total = cart.reduce((acc, item) => {
      const ticketType = event.ticketTypes.find(tt => tt.id === item.ticketTypeId);
      return acc + (ticketType ? ticketType.price * item.quantity : 0);
  }, 0);

  if (completedTickets && completedTickets.length > 0) {
    // Monta um objeto Sale de conveniência para o TicketCard
    const completedSale: Sale = {
        id: completedTickets[0].order_number,
        orderNumber: completedTickets[0].order_number,
        customerName: completedTickets[0].customer_name,
        customerPhone: completedTickets[0].customer_phone,
        paymentStatus: completedTickets[0].payment_status,
        paymentMethod: completedTickets[0].payment_method,
        details: completedTickets[0].details,
        eventId: completedTickets[0].event_id,
        timestamp: completedTickets[0].purchase_date,
        tickets: completedTickets
    };

    return (
        <Modal title="Venda Concluída!" onClose={onClose}>
            <TicketCard sale={completedSale} event={event} />
        </Modal>
    );
  }

  return (
    <Modal title={`Venda: ${event.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nome Completo *</label>
            <input
              type="text" value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Telefone *</label>
            <input
              type="tel" value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              placeholder="(00) 00000-0000"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status do Pagamento *</label>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
            {(['Pago', 'A pagar', 'Verificar depois'] as PaymentStatus[]).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setPaymentStatus(status)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all uppercase ${paymentStatus === status ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600' : 'text-gray-400'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Forma de Pagamento *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            >
              <option value="PIX">PIX</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detalhes Adicionais</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm h-20 resize-none"
            placeholder="Observações..."
          />
        </div>

        <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quantidade de Ingressos *</h3>
            <div className="space-y-2">
                {event.ticketTypes.map(tt => (
                    <div key={tt.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-transparent hover:border-indigo-100 transition-all">
                        <div>
                            <p className="font-black text-gray-800 dark:text-gray-100 text-sm">{tt.name}</p>
                            <p className="text-xs font-bold text-indigo-600">R$ {tt.price.toFixed(2)}</p>
                        </div>
                        <input
                          type="number" min="0" placeholder="0"
                          onChange={(e) => updateCart(tt.id, parseInt(e.target.value) || 0)}
                          className="w-16 p-2 text-center bg-white dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-black"
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Total</p>
              <p className="text-2xl font-black text-indigo-600">R$ {total.toFixed(2)}</p>
            </div>
            <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black uppercase tracking-tight shadow-xl active:scale-95">
              Confirmar
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleModal;
