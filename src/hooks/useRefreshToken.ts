import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAuth from "./useAuth";
import axios from "axios";

export default function refreshUserData(): () => Promise<UserLoginDataState> {
	const user = useAuth();

	return async () => {
		const userData = await axios.get<UserLoginDataState>("http://localhost:8080/api/refresh", {
			withCredentials: true
		});
		user.loginUser(userData.data);
		return userData.data;
	}
}