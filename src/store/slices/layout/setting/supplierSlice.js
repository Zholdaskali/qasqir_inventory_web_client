import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const supplierSlice = createSlice({
  name: 'supplierList',
  initialState: {
    suppliers: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchSuppliersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuppliersSuccess(state, action) {
      state.suppliers = action.payload;
      state.loading = false;
    },
    fetchSuppliersFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    saveSupplierList(state, action) {
      state.suppliers = action.payload;
    },
  },
});

export const { 
  fetchSuppliersStart, 
  fetchSuppliersSuccess, 
  fetchSuppliersFailure,
  saveSupplierList 
} = supplierSlice.actions;

export default supplierSlice.reducer;

// Thunk для загрузки поставщиков с бэкенда
export const fetchSuppliers = () => async (dispatch, getState) => {
  try {
    dispatch(fetchSuppliersStart());
    const authToken = getState().token.token;
    
    const response = await axios.get(API_GET_ALL_SUPPLIERS, {
      headers: { "Auth-token": authToken },
    });
    
    dispatch(fetchSuppliersSuccess(response.data.body));
    return response.data;
  } catch (error) {
    dispatch(fetchSuppliersFailure(error.response?.data?.message));
    throw error;
  }
};