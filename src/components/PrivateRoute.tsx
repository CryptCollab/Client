import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import React from "react";

/**
 * First checks if user is logged in
 * If logged in, renders children
 * If not logged in, tries to get access token using refresh token
 * Else redirects to login page 
 */

interface PrivateRouteProps {
	requireUnAuthenticated?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({  requireUnAuthenticated }) => {
	const auth = useAuth();
	const location = useLocation();
	requireUnAuthenticated = requireUnAuthenticated ?? false;

	const outletLogic = (requireUnAuthenticated) ? !auth.isUserLoggedIn() : auth.isUserLoggedIn();

	return (outletLogic)
		? <Outlet />
		: <Navigate to={(auth.isUserLoggedIn()) ? "/dashboard" : "/login"} state={{ redirectURL: location.pathname }} replace />;


};
export default PrivateRoute;