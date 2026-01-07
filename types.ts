
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

export interface Ticket {
  id: string;
  ticketTypeId: string;
  saleId: string;
  checkedIn: boolean;
  uniqueTicketNumber: string; // Ex: #1001
}

export interface Sale {
  id: string;
  eventId: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  details?: string;
  tickets: Ticket[];
  orderNumber: string; // Group ID: Ex: ORD-2024-001
  timestamp: number;
}

export type ModalType = 'NONE' | 'CREATE_EVENT' | 'MENU' | 'DASHBOARD' | 'SALE' | 'MANUAL_VALIDATION' | 'ATTENDEE_LIST';

export interface ModalState {
  type: ModalType;
  event?: Event;
}
