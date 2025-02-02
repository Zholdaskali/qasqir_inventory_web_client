import { createSlice } from "@reduxjs/toolkit";

const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Извлекаем только дату
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
};

const initialState = [];

const nomenclatureListSlice = createSlice({
  name: "nomenclatureList",
  initialState,
  reducers: {
    saveNomenclatureList: (state, action) => {
      const formattedNomenclatureList = action.payload.map((nomenclature) => ({
        ...nomenclature,
        createdAt: formatDate(nomenclature.createdAt),
        updatedAt: formatDate(nomenclature.updatedAt), 
      }));

      console.log("Сохраненные категории с преобразованиями:", formattedNomenclatureList);

      return formattedNomenclatureList; 
    },
    clearNomenclatureList: () => initialState, 
  },
});

export const { saveNomenclatureList, clearNomenclatureList } = nomenclatureListSlice.actions;
export default nomenclatureListSlice.reducer;
