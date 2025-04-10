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

const userListSlice = createSlice({
  name: "userList",
  initialState,
  reducers: {
    saveUserList: (state, action) => {
      const formattedUserList = action.payload.map((user) => ({
        ...user,
        registrationDate: formatDate(user.registrationDate),
      }));
      return formattedUserList;
    },
    clearUserList: () => initialState,
  },
});

export const { saveUserList, clearUserList } = userListSlice.actions;
export default userListSlice.reducer;