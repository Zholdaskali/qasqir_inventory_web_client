import { createSlice } from '@reduxjs/toolkit';

// Функция для преобразования даты
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Регулярное выражение для извлечения даты
  if (!match) {
    return "Invalid Date";
  }
  const [, year, month, day] = match;
  return `${year}/${month}/${day}`; // Возвращаем дату в формате MM/DD/YYYY
};


const initialState = {
    id: 0,
    name: '',
    location: '',
    createdAt: '',
    updatedAt: '',
  };


const warehosueSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setWarehouse: (state, action) => {
      const payload = action.payload;

      // Если в payload есть registrationDate, преобразуем её
      if (payload.createdAt || payload.updatedAt) {
        payload.createdAt = formatDate(payload.createdAt);
        payload.updatedAt = formatDate(payload.updatedAt);
      }

      return { ...state, ...payload };
    },
    clearWarhouse: () => initialState,
  },
});

export const { setWarehouse, clearWarhouse } = warehosueSlice.actions;
export default warehosueSlice.reducer;