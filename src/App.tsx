/* eslint-disable react/jsx-no-comment-textnodes */
import { Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";
import PersistLogin from "./components/PersistLogin";
import Document from "./pages/Document";
import { CryptoUtils } from "./utils/crypto";
import { socketHandlers } from "./utils/socket";
import { Routes, Route } from "react-router-loading";

import './styles/app.css';
import './styles/app.scss';
import Loader from "./components/Loader";
import { useEffect, useState } from "react";
import useRefreshToken from "./hooks/useRefreshToken";

export const cryptoUtils = new CryptoUtils();
export const socket = new socketHandlers(import.meta.env.VITE_SERVER_BASE_URL);
export default function App() {
	const [loading, setLoading] = useState(true);
	const refresh = useRefreshToken();

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
		console.log("fetching user data");
		if (loading) {
			tryFetchingUserDataUsingRefreshToken();
		} else {
			setLoading(false);
		}

	}, []);

	if (loading) return <Loader />

	return (
		<Routes>
			<Route path="/" element={<HomePage />} loadingScreen={<Loader />} />
			<Route path="/loading" element={<Loader />} />
			<Route path="/login" element={<LoginPage />} loading />
			<Route path="/register" element={<SignUpPage />} loading />
			<Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} loading />
			<Route path="/document" element={<Navigate to="/dashboard" />} loading />
			<Route path="/document/:id" element={<ProtectedRoute><Document /></ProtectedRoute>} loading />
			<Route path="*" element={<h1>404: Not Found</h1>} />
		</Routes>
	);
}


