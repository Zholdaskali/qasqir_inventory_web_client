import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items.splice(action.payload, 1);
    },
    updateItem: (state, action) => {
      const { index, field, value } = action.payload;
      state.items[index][field] = value;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    resetItems: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateItem, setItems, resetItems } = itemsSlice.actions;
export default itemsSlice.reducer;