import { createSlice } from '@reduxjs/toolkit';

const customerSlice = createSlice({
  name: 'customerList',
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchCustomersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCustomersSuccess(state, action) {
      state.customers = action.payload;
      state.loading = false;
    },
    fetchCustomersFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    saveCustomerList(state, action) {
      state.customers = action.payload;
    },
  },
});

export const { 
  fetchCustomersStart, 
  fetchCustomersSuccess, 
  fetchCustomersFailure,
  saveCustomerList 
} = customerSlice.actions;

export default customerSlice.reducer;