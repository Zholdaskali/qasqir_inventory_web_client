import { createSlice } from "@reduxjs/toolkit";

// Функция для преобразования даты в формат DD.MM.YYYY
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
};

const initialState = {
  id: 0,
  name: "",
  createdBy: 0,
  updatedBy: 0,
  createdAt: "",
  updatedAt: "",
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategory: (state, action) => {
      const payload = action.payload;

      if (payload.createdAt) {
        payload.createdAt = formatDate(payload.createdAt);
      }
      if (payload.updatedAt) {
        payload.updatedAt = formatDate(payload.updatedAt);
      }

      return { ...state, ...payload };
    },
    clearCategory: () => initialState,
  },
});

export const { setCategory, clearCategory } = categorySlice.actions;
export default categorySlice.reducer;
