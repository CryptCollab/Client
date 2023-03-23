import axios from 'axios';
import { useEffect } from 'react';
import useAuth from './useAuth';

//TODO: Add base url to .env file
const privateAxios = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true

})
//TODO complete this hook
export default function useAxios() {
    const user = useAuth();
    useEffect(() => {

        const requestInterceptor = privateAxios.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${user.userData?.accessToken}`;
                }
                return config;
            },
            error => Promise.reject(error)
        )

        const responseIntercept = privateAxios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = ``;
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return privateAxios(prevRequest);
                }
                return Promise.reject(error);
            }
        );

    }, [])
}