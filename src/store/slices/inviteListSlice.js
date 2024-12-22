import { createSlice } from "@reduxjs/toolkit";

const inviteListSlice = createSlice({
    name: "inviteList",
    initialState: [],
    reducers: {
        saveInviteList(state, action) {
            return action.payload; // Перезаписываем весь список, вместо добавления
        },
    },
});

export const { saveInviteList } = inviteListSlice.actions;
export default inviteListSlice.reducer;
