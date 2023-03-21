import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserLoginDataState {
    isUserLoggedIn: boolean;
    userData: object
}


const initialState: UserLoginDataState = {
    isUserLoggedIn: false,
    userData: {}
}

const userLoginDataSlice = createSlice({
    name: 'userLoginData',
    initialState,
    reducers: {
        //actions
        //login 
        login(state, action: PayloadAction<object>) {
            state.isUserLoggedIn = true;
            state.userData = action.payload;
        },

        //logout
        logout(state) {
            state.isUserLoggedIn = false;
            state.userData = {};
        }
    }
})

export const { login, logout } = userLoginDataSlice.actions;
export default userLoginDataSlice.reducer;