import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Массив товаров
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((_, index) => index !== action.payload);
    },
    updateItem: (state, action) => {
      const { index, field, value } = action.payload;
      state.items[index][field] = value;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const { addItem, removeItem, updateItem, setItems } = itemsSlice.actions;

export default itemsSlice.reducer;