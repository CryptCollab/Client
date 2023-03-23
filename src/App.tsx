import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";
import useAxios from "./hooks/useAxios";
import PersistLogin from "./components/PersistLogin";
import Tiptap from "./pages/TextEditor";
import { CryptoUtils } from "./utils/crypto";
import { socketHandlers } from "./utils/socket";

export const cryptoUtils = new CryptoUtils();
export const socket = new socketHandlers("http://localhost:8080");
export default function App() {

  return (
    <Routes>
      <Route element={<PersistLogin />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        <Route path="/document" element={<ProtectedRoute><Tiptap /></ProtectedRoute>} />
            //TODO acha wala 404 page
        <Route path="*" element={<h1>404: Not Found</h1>} />
      </Route>
    </Routes>
  );
}
