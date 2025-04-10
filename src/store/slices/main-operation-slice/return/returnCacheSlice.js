import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  warehouses: [],
  inventoryItems: {},
};

const returnCacheSlice = createSlice({
  name: 'returnCacheData',
  initialState,
  reducers: {
    setWarehouses: (state, action) => {
      state.warehouses = action.payload;
    },
    setInventoryItems: (state, action) => {
      const { warehouseId, items } = action.payload;
      state.inventoryItems[warehouseId] = items;
    },
    resetCache: (state) => {
      state.warehouses = [];
      state.inventoryItems = {};
    },
  },
});

export const { setWarehouses, setInventoryItems, resetCache } = returnCacheSlice.actions;
export default returnCacheSlice.reducer;