import { createSlice } from "@reduxjs/toolkit";

const formatDate = (isoString) => {
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/); // Регулярное выражение для извлечения даты
    if (!match) {
      return "Invalid Date";
    }
    const [, year, month, day] = match;
    return `${year}/${month}/${day}`; // Возвращаем дату в формате MM/DD/YYYY
  };

const initialState = {
    bin: "",
    organizationName: "",
    email: "",
    ownerName: "",
    phoneNumber: "",
    registrationDate: "",
    websiteLink: "",
    address: "",
    imagePath: ""
  }

const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {
        setOrganization : (state, action) =>{
            const payload = action.payload;

            if(payload.registrationDate){
                payload.registrationDate = formatDate(payload.registrationDate)
            }
            
            return {...state, ...payload}
        },
        clearOrganization: () => initialState,
    }
})

export const {setOrganization, clearOrganization} = organizationSlice.actions;
export default organizationSlice.reducer