import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
type Props = {
    children: JSX.Element
}

export const ProtectedRoute = ({ children }: Props) => {
    const userLoggInData = useAuth();

    if (!userLoggInData.isUserLoggedIn) {
        // user is not authenticated
        return <Navigate to="/login" replace />;
    }
    return children;
};