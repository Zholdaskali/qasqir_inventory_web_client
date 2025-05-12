import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  syncedNomenclatures: [], // Список синхронизированных номенклатур
  notSyncedNomenclatures: [], // Список несинхронизированных номенклатур
  loading: false, // Состояние загрузки
  error: null, // Ошибка при загрузке
};

const nomenclatureListSlice = createSlice({
  name: 'nomenclatureList',
  initialState,
  reducers: {
    // Начало загрузки номенклатур
    fetchNomenclaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    // Успешная загрузка синхронизированных номенклатур
    fetchSyncedNomenclaturesSuccess(state, action) {
      state.syncedNomenclatures = action.payload;
      state.loading = false;
    },
    // Успешная загрузка несинхронизированных номенклатур
    fetchNotSyncedNomenclaturesSuccess(state, action) {
      state.notSyncedNomenclatures = action.payload;
      state.loading = false;
    },
    // Ошибка при загрузке
    fetchNomenclaturesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    // Очистка данных номенклатур
    clearNomenclatures(state) {
      state.syncedNomenclatures = [];
      state.notSyncedNomenclatures = [];
      state.error = null;
    },
  },
});

export const {
  fetchNomenclaturesStart,
  fetchSyncedNomenclaturesSuccess,
  fetchNotSyncedNomenclaturesSuccess,
  fetchNomenclaturesFailure,
  clearNomenclatures,
} = nomenclatureListSlice.actions;

export default nomenclatureListSlice.reducer;