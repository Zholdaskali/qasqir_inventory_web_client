import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ticketsByType: {
    sales: [],
    "write-off": [],
  },
  loading: false,
  error: null,
};

const ticketApprovalSlice = createSlice({
  name: "ticketApproval",
  initialState,
  reducers: {
    fetchTicketsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTicketsSuccess(state, action) {
      const { ticketType, tickets } = action.payload;
      state.ticketsByType[ticketType] = tickets;
      state.loading = false;
    },
    fetchTicketsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateTicket(state, action) {
      const { id, status, managerId, managedAt, ticketType } = action.payload;
      state.ticketsByType[ticketType] = state.ticketsByType[ticketType].map(
        (ticket) =>
          ticket.id === id
            ? { ...ticket, status, managerId, managedAt }
            : ticket
      );
    },
    deleteTicket(state, action) {
      const { ticketId, ticketType } = action.payload;
      state.ticketsByType[ticketType] = state.ticketsByType[ticketType].filter(
        (ticket) => ticket.id !== ticketId
      );
    },
    clearTickets(state, action) {
      const ticketType = action.payload;
      state.ticketsByType[ticketType] = [];
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