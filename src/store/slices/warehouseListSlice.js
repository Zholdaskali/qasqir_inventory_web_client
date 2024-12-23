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

const warehouseListSlice = createSlice({
  name: "warehouseList",
  initialState,
  reducers: {
    saveWarehouseList: (state, action) => {
      // Преобразуем формат даты для каждого пользователя
      const formattedWarehouseList = action.payload.map((warehouse) => ({
        ...warehouse,
        createdAt: formatDate(warehouse.createdAt), // Преобразуем поле registrationDate
        updatedAt: formatDate(warehouse.updatedAt), // Преобразуем поле registrationDate
    }));
      return formattedWarehouserList; // Сохраняем преобразованные данные в state
    },
    clearWarehouseList:()=>initialState
  },
});

export const { saveWarehouseList,clearWarehouseList } = warehouseListSlice.actions;
export default warehouseListSlice.reducer;
