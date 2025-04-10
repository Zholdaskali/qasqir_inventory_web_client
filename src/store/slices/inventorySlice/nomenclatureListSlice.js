import { createSlice } from "@reduxjs/toolkit";

const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Извлекаем только дату
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
};

const nomenclatureListSlice = createSlice({
  name: "nomenclatureList",
  initialState: {
    nomenclatures: [], // Список номенклатур
    loading: false,    // Состояние загрузки
    error: null,       // Ошибка, если есть
  },
  reducers: {
    fetchNomenclaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNomenclaturesSuccess(state, action) {
      const formattedNomenclatureList = action.payload.map((nomenclature) => ({
        ...nomenclature,
        createdAt: formatDate(nomenclature.createdAt),
        updatedAt: formatDate(nomenclature.updatedAt),
      }));
      state.nomenclatures = formattedNomenclatureList;
      state.loading = false;
    },
    fetchNomenclaturesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearNomenclatureList(state) {
      state.nomenclatures = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  fetchNomenclaturesStart, 
  fetchNomenclaturesSuccess, 
  fetchNomenclaturesFailure, 
  clearNomenclatureList 
} = nomenclatureListSlice.actions;

export default nomenclatureListSlice.reducer;