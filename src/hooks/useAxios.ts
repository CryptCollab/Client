import axios from "axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

const privateAxios = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true

});


export default function useAxios() {
	const user = useAuth();
	const refresh = useRefreshToken();

	useEffect(() => {

		const requestInterceptor = privateAxios.interceptors.request.use(
			config => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${user.userData?.accessToken}`;
				}
				return config;
			},
			error => Promise.reject(error)
		);

		const responseIntercept = privateAxios.interceptors.response.use(
			response => response,
			async (error) => {
				const prevRequest = error?.config;
				if (error?.response?.status === 403 && !prevRequest?.sent) {
					prevRequest.sent = true;
					//get new access token
					const userData = await refresh();

					//TODO look into redux synchronization
					prevRequest.headers["Authorization"] = `Bearer ${userData?.userData?.accessToken}`;
					return privateAxios(prevRequest);
				}
				return Promise.reject(error);
			}
		);

		return () => {
			privateAxios.interceptors.request.eject(requestInterceptor);
			privateAxios.interceptors.response.eject(responseIntercept);
		};
		//TODO examine this dependency array
	},);


	return privateAxios;

}