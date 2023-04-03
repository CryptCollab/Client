/* eslint-disable react/jsx-no-comment-textnodes */
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";
import PersistLogin from "./components/PersistLogin";
import Document from "./pages/Document";
import { CryptoUtils } from "./utils/crypto";
import { socketHandlers } from "./utils/socket";
import 'bootstrap/dist/css/bootstrap.min.css';

export const cryptoUtils = new CryptoUtils();
export const socket = new socketHandlers(import.meta.env.VITE_SERVER_BASE_URL);
export default function App() {

	return (
		<Routes>
			<Route element={<PersistLogin />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<SignUpPage />} />
				<Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
				<Route path="/document" element={<Navigate to="/dashboard" />} />
				<Route path="/document/:id" element={<ProtectedRoute><Document /></ProtectedRoute>} />
            //TODO acha wala 404 page
				<Route path="*" element={<h1>404: Not Found</h1>} />
			</Route>
		</Routes>
	);
}
