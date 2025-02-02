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

const categoryListSlice = createSlice({
  name: "categoryList",
  initialState,
  reducers: {
    saveCategoryList: (state, action) => {
      const formattedCategoryList = action.payload.map((category) => ({
        ...category,
        createdAt: formatDate(category.createdAt),
        updatedAt: formatDate(category.updatedAt), 
      }));

      console.log("Сохраненные категории с преобразованиями:", formattedCategoryList);

      return formattedCategoryList; 
    },
    clearCategoryList: () => initialState, 
  },
});

export const { saveCategoryList, clearCategoryList } = categoryListSlice.actions;
export default categoryListSlice.reducer;
