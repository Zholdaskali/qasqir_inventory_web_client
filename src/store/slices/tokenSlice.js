import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: '',
};

const tokenSlice = createSlice({
    name: 'token',
    initialState,
    reducers: {
        saveToken: (state, action) => {
            state.token = action.payload;
        },
        clearToken: (state) => {
            state.token = '';
        },
    },
});

// Экспортируем действия и редюсер
export const { saveToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;
