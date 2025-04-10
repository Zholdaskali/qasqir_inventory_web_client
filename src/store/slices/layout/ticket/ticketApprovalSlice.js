// store/slices/ticketApprovalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const ticketApprovalSlice = createSlice({
  name: 'ticketApproval',
  initialState: {
    tickets: [], // Список заявок
    loading: false, // Состояние загрузки
    error: null, // Ошибка загрузки
  },
  reducers: {
    fetchTicketsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTicketsSuccess(state, action) {
      state.loading = false;
      state.tickets = action.payload;
    },
    fetchTicketsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.tickets = [];
    },
    updateTicket(state, action) {
      const updatedTicket = action.payload;
      state.tickets = state.tickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      );
    },
    deleteTicket(state, action) {
      const ticketId = action.payload;
      state.tickets = state.tickets.filter((ticket) => ticket.id !== ticketId);
    },
    clearTickets(state) {
      state.tickets = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchTicketsStart,
  fetchTicketsSuccess,
  fetchTicketsFailure,
  updateTicket,
  deleteTicket,
  clearTickets,
} = ticketApprovalSlice.actions;

export default ticketApprovalSlice.reducer;