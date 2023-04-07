import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import Loader from "./Loader";
import { useLoadingContext, topbar } from "react-router-loading";

export default function PersistLogin() {


	const user = useAuth();
	const refresh = useRefreshToken();
	const loadingContext = useLoadingContext();
	const [loading, setLoading] = useState(true);
	const [firstTry, setFirstTry] = useState(true);
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
			// topbar.hide();
			loadingContext.done();
			setLoading(false);
		}
	};


	useEffect(() => {
		console.log(firstTry);
		if (firstTry) {
			tryFetchingUserDataUsingRefreshToken();
		} else {
			// topbar.hide();
			loadingContext.done();
			setLoading(false);
		}

		setFirstTry(false);
	}, []);
	return (
		(loading) ? <span>Loading...</span> : <Outlet />
	);
}
