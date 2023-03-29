import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";

export default function PersistLogin() {


	const user = useAuth();
	const refresh = useRefreshToken();

	const [loading, setLoading] = useState(true);
	
	const tryFetchingUserDataUsingRefreshToken = async () => {
		//User credentials not persent try to get userdata using refresh token
		try {
			await refresh();
		}
		//Unable to get user data using refresh token, use not logged in
		catch (error) {
			console.error(error);
		}
		finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!user.isUserLoggedIn()) {
			tryFetchingUserDataUsingRefreshToken();
		} else {
			setLoading(false);
		}
	}, []);
	return (
		(loading) ? <div>Loading...</div> : <Outlet />
	);
}
