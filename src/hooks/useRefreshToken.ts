import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAuth from "./useAuth";
import axios from "axios";

export default function refreshUserData(): () => Promise<UserLoginDataState | null> {
	const user = useAuth();

	return async () => {
		try {
			console.log("GETTING to http://localhost:8080/api/refresh");

			const userData = await axios.get<UserLoginDataState>("http://localhost:8080/api/refresh", {
				withCredentials: true,
				headers: {
					'Cache-Control': 'no-cache',
					'Pragma': 'no-cache',
					'Expires': '0',
				}
			});
			console.log("userData", userData.data);
			user.loginUser(userData.data);
			return userData.data;
		} catch (err) {
			console.error(err);
		}
		return null;
	}
}