import { createSlice } from "@reduxjs/toolkit";

// Функция для преобразования формата даты
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/); // Извлекаем дату и время
  if (!match) {
    return "Invalid Date";
  }
  const [, year, month, day, hours, minutes, seconds] = match;
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`; // Преобразуем в формат MM/DD/YYYY HH:mm:ss
};

const initialState = []; // State is an array of logs

const actionLogSlice = createSlice({
  name: "actionLogAction",
  initialState,
  reducers: {
    saveActionLogs: (state, action) => {
      // Преобразуем формат даты для каждого лога
      const formattedLogs = action.payload.map((log) => ({
        ...log,
        timestamp: formatDate(log.timestamp), // Преобразуем поле timestamp
      }));

      return formattedLogs; // Сохраняем преобразованные логи в state
    },
    clearActionLogs:()=>initialState,
  },

});

export const { saveActionLogs, clearActionLogs } = actionLogSlice.actions;
export default actionLogSlice.reducer;
