import { configureStore } from '@reduxjs/toolkit';

import userLoginDataReducer from '../features/userData/userLoginData-slice';

export const store = configureStore({
    reducer: {
        userLoginData: userLoginDataReducer
    }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;