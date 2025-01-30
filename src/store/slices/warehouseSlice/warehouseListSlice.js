import { createSlice } from "@reduxjs/toolkit";

const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return "Неправильная дата";
  }
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
};

const initialState = [];

const warehouseListSlice = createSlice({
  name: "warehouseList",
  initialState,
  reducers: {
    saveWarehouseList: (state, action) => {
      const formattedWarehouseList = action.payload.map((warehouse) => ({
        ...warehouse,
        createdAt: formatDate(warehouse.createdAt),
        updatedAt: formatDate(warehouse.updatedAt), 
    }));
      return formattedWarehouserList;
    },
    clearWarehouseList:()=>initialState
  },
});

export const { saveWarehouseList,clearWarehouseList } = warehouseListSlice.actions;
export default warehouseListSlice.reducer;
