import axios from "axios";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAuth from "./useAuth";

export default function refreshUserData(): () => Promise<UserLoginDataState> {
	const user = useAuth();
	return async () => {
		const userData = await axios.get<UserLoginDataState>("/api/refresh", {
			withCredentials: true
		});
		user.loginUser(userData.data);
		return userData.data;
	}
}