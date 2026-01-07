
import React, { useState } from 'react';
import { Event, Sale, Ticket } from '../types';
import Modal from './Modal';
import TicketCard from './TicketCard';

interface SaleModalProps {
  event: Event;
  onClose: () => void;
  onSave: (sale: Omit<Sale, 'id'>) => Sale;
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
    const saleId = `sale-${Date.now()}`;
    const tickets: Ticket[] = [];
    cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            tickets.push({
                id: `tkt-${saleId}-${item.ticketTypeId}-${i}`,
                ticketTypeId: item.ticketTypeId,
                saleId: saleId,
                checkedIn: false
            });
        }
    });

    if (customerName && tickets.length > 0) {
      const saleToSave: Omit<Sale, 'id'> = {
        eventId: event.id,
        customerName,
        customerPhone,
        tickets,
      };
      const savedSale = onSave(saleToSave);
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
        <Modal title="Venda Realizada com Sucesso!" onClose={onClose}>
            <TicketCard sale={completedSale} event={event} />
        </Modal>
    );
  }

  return (
    <Modal title={`Venda de Ingressos: ${event.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Cliente</label>
          <input
            type="text" id="customerName" value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone (Opcional)</label>
          <input
            type="tel" id="customerPhone" value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>
        <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Selecionar Ingressos</h3>
            <div className="space-y-3">
                {event.ticketTypes.map(tt => (
                    <div key={tt.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div>
                            <p className="font-semibold">{tt.name}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">R$ {tt.price.toFixed(2)}</p>
                        </div>
                        <input
                            type="number"
                            min="0"
                            onChange={(e) => updateCart(tt.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                    </div>
                ))}
            </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <p className="text-lg font-bold">Total:</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">R$ {total.toFixed(2)}</p>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-semibold">
            Salvar Venda
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleModal;
