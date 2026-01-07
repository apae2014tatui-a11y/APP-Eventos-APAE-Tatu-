
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

export interface Ticket {
  id: string;
  ticketTypeId: string;
  saleId: string;
  checkedIn: boolean;
}

export interface Sale {
  id: string;
  eventId: string;
  customerName: string;
  customerPhone: string;
  tickets: Ticket[];
  orderNumber: string; // Sequential identifier
  timestamp: number;
}

export type ModalType = 'NONE' | 'CREATE_EVENT' | 'MENU' | 'DASHBOARD' | 'SALE' | 'SCANNER' | 'MANUAL_VALIDATION' | 'ATTENDEE_LIST';

export interface ModalState {
  type: ModalType;
  event?: Event;
}
