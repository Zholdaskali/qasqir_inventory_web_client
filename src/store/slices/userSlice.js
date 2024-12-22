import { createSlice } from '@reduxjs/toolkit';

// Функция для преобразования даты
const formatDate = (isoString) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Регулярное выражение для извлечения даты
  if (!match) {
    return "Invalid Date";
  }
  const [, year, month, day] = match;
  return `${year}/${month}/${day}`; // Возвращаем дату в формате MM/DD/YYYY
};

const initialState = {
  userId: 0,
  userName: '',
  email: '',
  userNumber: '',
  registrationDate: '',
  imagePath: '',
  emailVerified: false,
  userRoles: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload;

      // Если в payload есть registrationDate, преобразуем её
      if (payload.registrationDate) {
        payload.registrationDate = formatDate(payload.registrationDate);
      }

      return { ...state, ...payload };
    },
    clearUser: () => initialState,
  },
});

// Экспортируем действия и редюсер
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
