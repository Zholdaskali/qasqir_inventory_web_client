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

const logInLogSlice = createSlice({
  name: "logInLogAction",
  initialState,
  reducers: {
    saveLogInLogs: (state, action) => {
      // Преобразуем формат даты и времени для каждого лога
      const formattedLogs = action.payload.map((log) => ({
        ...log,
        timestamp: formatDate(log.timestamp), // Преобразуем поле timestamp
      }));

      return formattedLogs; // Сохраняем преобразованные логи в state
    },
    clearLogInLogs:()=>initialState,
  },
});

export const { saveLogInLogs,clearLogInLogs } = logInLogSlice.actions;
export default logInLogSlice.reducer;
