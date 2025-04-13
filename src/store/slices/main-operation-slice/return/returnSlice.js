import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedWarehouseId: "",
  selectedInventoryId: "",
  returnType: "DEFECTIVE",
  documentNumber: `RET-${Date.now()}`,
  quantity: "",
  reason: "",
  loading: false, // Добавляем поле loading
};

const returnSlice = createSlice({
  name: 'returnForm',
  initialState,
  reducers: {
    setReturnField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetReturnForm: (state) => {
      state.selectedWarehouseId = "";
      state.selectedInventoryId = "";
      state.returnType = "DEFECTIVE";
      state.documentNumber = `RET-${Date.now()}`;
      state.quantity = "";
      state.reason = "";
      state.loading = false; // Сбрасываем loading
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // Устанавливаем состояние loading
    },
  },
});

export const { setReturnField, resetReturnForm, setLoading } = returnSlice.actions;
export default returnSlice.reducer;