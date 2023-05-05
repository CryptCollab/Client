import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { login, logout } from "../features/userData/userLoginData-slice";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import { cryptoUtils } from "../App";
import useAxios from "./useAxios";


export default function useAuth() {

	const userLoginData = useAppSelector((state) => state.userLoginData);
	const dispatch = useAppDispatch();
	const user = {
		...userLoginData,
		isUserLoggedIn: () => userLoginData.userData !== null,
		loginUser: (userData: UserLoginDataState): void => {
			dispatch(login(userData));
		},
		logoutUser: (): void => { dispatch(logout()); },
	};
	return user;
}