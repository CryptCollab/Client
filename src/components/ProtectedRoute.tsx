import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAuth from "../hooks/useAuth";
type Props = {
    children: JSX.Element
}
/**
 * First checks if user is logged in
 * If logged in, renders children
 * If not logged in, tries to get access token using refresh token
 * Else redirects to login page 
 */
export const ProtectedRoute = ({ children }: Props) => {

    const user = useAuth();


    if (!user.isUserLoggedIn()) {
        // user is not authenticated
        return <Navigate to="/login" replace />;
    } else {
        return children;
    }

};