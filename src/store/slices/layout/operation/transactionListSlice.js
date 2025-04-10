import { createSlice } from '@reduxjs/toolkit';

const transactionListSlice = createSlice({
  name: 'transactionList',
  initialState: {
    documents: [], // Список документов с транзакциями
    loading: false, // Состояние загрузки данных
    downloadLoading: false, // Состояние загрузки документа
    error: null, // Ошибка загрузки данных
    downloadError: null, // Ошибка скачивания документа
  },
  reducers: {
    // Начало загрузки документов
    fetchDocumentsStart(state) {
      state.loading = true;
      state.error = null;
    },
    // Успешная загрузка документов
    fetchDocumentsSuccess(state, action) {
      state.loading = false;
      state.documents = action.payload;
    },
    // Ошибка загрузки документов
    fetchDocumentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.documents = [];
    },
    // Начало скачивания документа
    downloadDocumentStart(state) {
      state.downloadLoading = true;
      state.downloadError = null;
    },
    // Успешное завершение скачивания
    downloadDocumentSuccess(state) {
      state.downloadLoading = false;
    },
    // Ошибка при скачивании
    downloadDocumentFailure(state, action) {
      state.downloadLoading = false;
      state.downloadError = action.payload;
    },
    // Очистка данных
    clearDocuments(state) {
      state.documents = [];
      state.loading = false;
      state.error = null;
      state.downloadLoading = false;
      state.downloadError = null;
    },
  },
});

export const {
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  downloadDocumentStart,
  downloadDocumentSuccess,
  downloadDocumentFailure,
  clearDocuments,
} = transactionListSlice.actions;

export default transactionListSlice.reducer;