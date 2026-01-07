
// types.ts

export interface TicketType {
  id: string;
  name: string;
  price: number;
}

export interface Event {
  id: string;
  name: string;
  date: string; // Formato ISO
  ticketTypes: TicketType[];
}

export interface Ticket {
  id: string; // ID único para esta instância de ingresso
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
}

export type ModalType = 'NONE' | 'CREATE_EVENT' | 'MENU' | 'DASHBOARD' | 'SALE' | 'SCANNER';

export interface ModalState {
  type: ModalType;
  event?: Event;
}
