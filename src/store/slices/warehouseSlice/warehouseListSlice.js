import { createSlice } from '@reduxjs/toolkit';

const warehouseListSlice = createSlice({
  name: 'warehouseList',
  initialState: {
    warehouses: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchWarehousesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWarehousesSuccess(state, action) {
      state.warehouses = action.payload;
      state.loading = false;
    },
    fetchWarehousesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    saveWarehouseList(state, action) {
      state.warehouses = action.payload;
    },
  },
});

export const { 
  fetchWarehousesStart, 
  fetchWarehousesSuccess, 
  fetchWarehousesFailure,
  saveWarehouseList 
} = warehouseListSlice.actions;

export default warehouseListSlice.reducer;