
import React, { useState } from 'react';
import { Event, Sale } from '../types';
import Modal from './Modal';
import TicketCard from './TicketCard';

interface SaleModalProps {
  event: Event;
  onClose: () => void;
  onSave: (saleData: any) => Sale;
}

interface CartItem {
  ticketTypeId: string;
  quantity: number;
}

const SaleModal: React.FC<SaleModalProps> = ({ event, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (customerName && totalQty > 0) {
      const saleRequest = {
        eventId: event.id,
        customerName,
        customerPhone,
        ticketRequests: cart.map(item => ({ typeId: item.ticketTypeId, qty: item.quantity }))
      };
      
      const savedSale = onSave(saleRequest);
      setCompletedSale(savedSale);
    } else {
       alert("Preencha o nome do cliente e selecione pelo menos um ingresso.");
    }
  };
  
  const total = cart.reduce((acc, item) => {
      const ticketType = event.ticketTypes.find(tt => tt.id === item.ticketTypeId);
      return acc + (ticketType ? ticketType.price * item.quantity : 0);
  }, 0);

  if (completedSale) {
    return (
        <Modal title="Venda Realizada!" onClose={onClose}>
            <TicketCard sale={completedSale} event={event} />
        </Modal>
    );
  }

  return (
    <Modal title={`Nova Venda: ${event.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nome do Cliente</label>
            <input
              type="text" value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Telefone de Contato</label>
            <input
              type="tel" value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Escolher Ingressos</h3>
            <div className="space-y-2">
                {event.ticketTypes.map(tt => (
                    <div key={tt.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                        <div>
                            <p className="font-black text-gray-800">{tt.name}</p>
                            <p className="text-sm font-bold text-indigo-600">R$ {tt.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <input
                              type="number"
                              min="0"
                              placeholder="0"
                              onChange={(e) => updateCart(tt.id, parseInt(e.target.value) || 0)}
                              className="w-16 p-2 text-center bg-white border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-black"
                          />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Total do Pedido</p>
              <p className="text-2xl font-black text-indigo-600">R$ {total.toFixed(2)}</p>
            </div>
            <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black uppercase tracking-tight shadow-lg shadow-indigo-100 active:scale-95">
              Confirmar Venda
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleModal;
