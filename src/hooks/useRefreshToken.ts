import axios from "axios";

export default function refreshUserData(): () => Promise<UserData | null> {
	/**
	 * fetches the user data from the server using the refresh token
	 */
	return async () => {
		try {

			const userData = await axios.get<UserData>("http://localhost:8080/api/refresh", {
				withCredentials: true,
				headers: {
					"Cache-Control": "no-cache",
					"Pragma": "no-cache",
					"Expires": "0",
				}
			});
			return userData.data;
		} catch (err) {
			console.error(err);
		}
		return null;
	};
}