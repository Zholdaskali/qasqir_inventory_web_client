import { createSlice } from '@reduxjs/toolkit';

const warehouseItemsSlice = createSlice({
  name: 'warehouseItems',
  initialState: {
    zones: [],
    currentWarehouseId: null, // Храним ID склада, для которого загружены данные
    loading: false,
    error: null,
  },
  reducers: {
    fetchWarehouseItemsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWarehouseItemsSuccess(state, action) {
      state.zones = action.payload.zones; // Зоны из payload
      state.currentWarehouseId = action.payload.warehouseId; // Сохраняем warehouseId
      state.loading = false;
    },
    fetchWarehouseItemsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearWarehouseItems(state) { // Добавим действие для очистки данных
      state.zones = [];
      state.currentWarehouseId = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  fetchWarehouseItemsStart, 
  fetchWarehouseItemsSuccess, 
  fetchWarehouseItemsFailure,
  clearWarehouseItems
} = warehouseItemsSlice.actions;

export default warehouseItemsSlice.reducer;