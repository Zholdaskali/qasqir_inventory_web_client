import { createSlice } from '@reduxjs/toolkit';

const categoryListSlice = createSlice({
  name: 'categoryList',
  initialState: {
    categories: [], // Список категорий
    loading: false, // Состояние загрузки
    error: null,    // Ошибка, если есть
    lastFetched: null, // Время последней успешной загрузки
  },
  reducers: {
    fetchCategoriesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action) {
      state.categories = action.payload; // Сохраняем категории
      state.loading = false;
      state.lastFetched = Date.now(); // Обновляем время загрузки
    },
    fetchCategoriesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearCategories(state) { // Для очистки данных
      state.categories = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
});

export const { 
  fetchCategoriesStart, 
  fetchCategoriesSuccess, 
  fetchCategoriesFailure, 
  clearCategories 
} = categoryListSlice.actions;

export default categoryListSlice.reducer;