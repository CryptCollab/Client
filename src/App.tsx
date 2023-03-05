import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        </Routes>
    );
}