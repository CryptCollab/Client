import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom';
import { UserLoginDataState } from '../features/userData/userLoginData-slice';
import useAuth from '../hooks/useAuth';

export default function PersistLogin() {


    const user = useAuth();

    const [loading, setLoading] = useState(true);

    const tryFetchingUserDataUsingRefreshToken = async () => {
        //User credentials not persent try to get userdata using refresh token
        try {
            const userData = await axios.get<UserLoginDataState>("/api/refresh", {
                withCredentials: true
            })
            user.loginUser(userData.data);
        }
        //Unable to get user data using refresh token, use not logged in
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user.isUserLoggedIn()) {
            tryFetchingUserDataUsingRefreshToken();
        } else {
            setLoading(false);
        }
    }, []);
    return (
        (loading) ? <div>Loading...</div> : <Outlet />
    )
}
