import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "./slices/tokenSlice";
import userReducer from "./slices/userSlice";
import actionLogSlice from './slices/logSlices/actionLogSlice'
import logInSlice from "./slices/logSlices/logInSlice";
import exceptionLogSlice from './slices/logSlices/exceptionSlice'
import userListSlice from './slices/userListSlice'
import inviteListSlice from './slices/inviteListSlice'
import organizationSlice from './slices/organizationSlice'

export const store = configureStore({
    reducer: {
        token: tokenReducer,
        user: userReducer,
        actionLogs: actionLogSlice,
        logInLogs: logInSlice,
        exceptionLogs: exceptionLogSlice,
        userList: userListSlice,
        inviteList: inviteListSlice,
        organization: organizationSlice,
    }
});
