import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserLoginDataState {
    userData: {
        email: string;
        userName: string;
        userID: string;
        accessToken: string;
    } | null
}


const initialState: UserLoginDataState = {
    userData: null
}

const userLoginDataSlice = createSlice({
    name: 'userLoginData',
    initialState,
    reducers: {
        //actions
        //login 
        login(state, action: PayloadAction<UserLoginDataState>) {
            state.userData = action.payload.userData;
        },

        //logout
        logout(state) {
            state.userData = null;
        }
    }
})

export const { login, logout } = userLoginDataSlice.actions;
export default userLoginDataSlice.reducer;