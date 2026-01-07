
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
  uniqueTicketNumber: string; // Individual ID: e.g., EVT-2024-0001
}

export interface Sale {
  id: string;
  eventId: string;
  customerName: string;
  customerPhone: string;
  tickets: Ticket[];
  orderNumber: string; // Group/Order ID
  timestamp: number;
}

export type ModalType = 'NONE' | 'CREATE_EVENT' | 'MENU' | 'DASHBOARD' | 'SALE' | 'MANUAL_VALIDATION' | 'ATTENDEE_LIST' | 'SCANNER';

export interface ModalState {
  type: ModalType;
  event?: Event;
}
