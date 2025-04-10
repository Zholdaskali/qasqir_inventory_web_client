import { configureStore } from "@reduxjs/toolkit";
// Базовые слайсы
import tokenReducer from "./slices/tokenSlice";
import userReducer from "./slices/userSlice";
import warehouseListReducer from "./slices/warehouseSlice/warehouseListSlice";
import supplierReducer from './slices/layout/setting/supplierSlice';
import customerReducer from './slices/layout/setting/customerSlice';
import warehouseItemsReducer from './slices/warehouseSlice/warehouse-structure/warehouseItemsSlice'

// Слайсы для логов
import actionLogSlice from './slices/logSlices/actionLogSlice';
import logInSlice from "./slices/logSlices/logInSlice";
import exceptionLogSlice from './slices/logSlices/exceptionSlice';

// Слайсы для управления пользователями
import userListSlice from './slices/userListSlice';
import inviteListSlice from './slices/inviteListSlice';

// Организация и инвентарь
import organizationSlice from './slices/organizationSlice';
import categoryListReducer from './slices/inventorySlice/categoryListSlice';
import nomenclatureListSlice from './slices/inventorySlice/nomenclatureListSlice';

// Операционные слайсы (входящие операции)
import itemsReducer from './slices/main-operation-slice/incoming/itemsSlice';
import incomingCacheReducer from './slices/main-operation-slice/incoming/incomingCacheSlice';

// Операционные слайсы (возвраты)
import returnFormReducer from './slices/main-operation-slice/return/returnSlice';
import returnCacheReducer from './slices/main-operation-slice/return/returnCacheSlice';

// Новый слайс для транзакций
import transactionListReducer from './slices/layout/operation/transactionListSlice';
// Новый слайс для заявок
import ticketApprovalReducer from './slices/layout/ticket/ticketApprovalSlice';
export const store = configureStore({
    reducer: {
        // Базовые данные
        token: tokenReducer,
        user: userReducer,
        
        // Логи
        actionLogs: actionLogSlice,
        logInLogs: logInSlice,
        exceptionLogs: exceptionLogSlice,
        
        // Управление пользователями
        userList: userListSlice,
        inviteList: inviteListSlice,
        
        // Организация и инвентарь
        organization: organizationSlice,
        categoryList: categoryListReducer,
        nomenclatureList: nomenclatureListSlice,
        warehouseList: warehouseListReducer,
        supplierList: supplierReducer,
        customerList: customerReducer,
        
        // Операции (входящие)
        items: itemsReducer,
        incomingCache: incomingCacheReducer,
        
        // Операции (возвраты)
        returnForm: returnFormReducer,
        returnCache: returnCacheReducer,
        warehouseItems: warehouseItemsReducer,
        
        // Транзакции
        transactionList: transactionListReducer,
        ticketApproval: ticketApprovalReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;