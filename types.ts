
export interface TicketType {
  id: string;
  name: string;
  price: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  ticketTypes: TicketType[];
}

export type PaymentStatus = 'Pago' | 'A pagar' | 'Verificar depois';
export type PaymentMethod = 'PIX' | 'Débito' | 'Crédito' | 'Dinheiro';

/**
 * Representa um único ingresso/participante, correspondendo a uma linha na tabela 'participantes'.
 */
export interface Ticket {
  id: string;
  event_id: string;
  customer_name: string;
  customer_phone: string;
  unique_ticket_number: string;
  ticket_type_id: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  details?: string;
  checked_in: boolean;
  purchase_date: string;
  order_number: string;
}

/**
 * Um tipo de conveniência para agrupar múltiplos `Ticket` de uma mesma compra na UI.
 * Não corresponde a uma tabela no banco de dados.
 */
export interface Sale {
  id: string; // Usaremos o orderNumber como ID único para o grupo
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: PaymentStatus; // Status do primeiro ingresso, para consistência
  paymentMethod: PaymentMethod;
  details?: string;
  tickets: Ticket[];
  eventId: string;
  timestamp: string;
}

export type ModalType = 'NONE' | 'CREATE_EVENT' | 'MENU' | 'DASHBOARD' | 'SALE' | 'MANUAL_VALIDATION' | 'ATTENDEE_LIST';

export interface ModalState {
  type: ModalType;
  event?: Event;
}
