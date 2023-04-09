/* eslint-disable react/jsx-no-comment-textnodes */
import { Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";
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


	useEffect(() => {
		console.log("loading:", loading);
		if (loading) {
			refresh().then(() => { setLoading(false) });
		} else {
			setLoading(false);
		}

	}, []);

	if (loading) return <Loader />

	return (
		<Routes>
			//Routes that do not require any authentication
			<Route path="/loading" element={<Loader />} />
			<Route path="*" element={<h1>404: Not Found</h1>} />

			//Routes that require authentication, to load parts of the page conditionally
			<Route path="/" element={<HomePage />} loadingScreen={<Loader />} />

			//Routes that require user to NOT be logged in, to be loaded
			<Route element={<PrivateRoute requireUnAuthenticated />} >
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<SignUpPage />} />
			</Route>
			//Routes that require user to be logged in, to be loaded
			<Route element={<PrivateRoute />}>
				<Route path="/dashboard" element={<DashBoard />} loading />
				<Route path="/document" element={<Navigate to="/dashboard" replace />} loading />
				<Route path="/document/:id" element={<Document />} loading />
			</Route>

		</Routes>
	);
}


