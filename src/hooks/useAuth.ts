import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function useAuth() {
	const user = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	return {
		userData: user.userData,
		isUserLoggedIn: () => user.userData !== null,
		/**
		 * Logs in the user using the provided user data
		 * then redirects to the redirectURL if it exists in the location state
		 */
		loginUser: (userData: UserData): void => {
			user.setUserData(userData);
			const redirectURL: string = location.state?.redirectURL ?? "/dashboard";
			navigate(redirectURL, { replace: true });
		},
		logoutUser: (): void => { user.setUserData(null); }
	};
}