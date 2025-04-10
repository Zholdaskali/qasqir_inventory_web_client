import { createSlice } from '@reduxjs/toolkit';

const nomenclatureListSlice = createSlice({
  name: 'nomenclatureList',
  initialState: {
    nomenclatures: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchNomenclaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNomenclaturesSuccess(state, action) {
      state.nomenclatures = action.payload;
      state.loading = false;
    },
    fetchNomenclaturesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    saveNomenclatureList(state, action) {
      state.nomenclatures = action.payload;
    },
  },
});

export const { 
  fetchNomenclaturesStart, 
  fetchNomenclaturesSuccess, 
  fetchNomenclaturesFailure,
  saveNomenclatureList 
} = nomenclatureListSlice.actions;

export default nomenclatureListSlice.reducer;