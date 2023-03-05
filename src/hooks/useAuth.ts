
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { login, logout } from "../features/userData/userLoginData-slice.ts";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";


export default function useAuth() {
    const userLoginData = useAppSelector((state) => state.userLoginData);
    const dispatch = useAppDispatch();
    const user = {
        ...userLoginData,
        loginUser: (userData: {}): void => dispatch(login(userData)),
        logoutUser: (): void => dispatch(logout())
    }
    return user;
}