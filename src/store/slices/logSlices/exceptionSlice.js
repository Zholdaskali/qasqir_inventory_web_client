import { createSlice } from "@reduxjs/toolkit";

// Функция для преобразования формата даты и времени
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/); // Извлекаем дату и время
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day, hours, minutes, seconds] = match;
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`; // Формат MM/DD/YYYY HH:mm:ss
};

const initialState = [];

const exceptionLogSlice = createSlice({
  name: "exceptionLogAction",
  initialState,
  reducers: {
    saveExceptionLogs: (state, action) => {
      // Преобразуем формат даты для каждого лога
      const formattedLogs = action.payload.map((log) => ({
        ...log,
        timestamp: formatDate(log.timestamp), // Преобразуем поле timestamp
      }));

      return formattedLogs; // Сохраняем преобразованные логи в state
    },
    clearExceptionLogs:()=>initialState,
  },
});

export const { saveExceptionLogs,clearExceptionLogs } = exceptionLogSlice.actions;
export default exceptionLogSlice.reducer;
