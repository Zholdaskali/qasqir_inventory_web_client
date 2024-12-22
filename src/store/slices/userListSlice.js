import { createSlice } from "@reduxjs/toolkit";

// Функция для преобразования формата даты
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Извлекаем только дату
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`; // Формат MM/DD/YYYY
};

const initialState = [];

const userListSlice = createSlice({
  name: "userList",
  initialState,
  reducers: {
    saveUserList: (state, action) => {
      // Преобразуем формат даты для каждого пользователя
      const formattedUserList = action.payload.map((user) => ({
        ...user,
        registrationDate: formatDate(user.registrationDate), // Преобразуем поле registrationDate
      }));

      return formattedUserList; // Сохраняем преобразованные данные в state
    },
    clearUserList:()=>initialState
  },
});

export const { saveUserList,clearUserList } = userListSlice.actions;
export default userListSlice.reducer;
