import axios from "axios";
import { useContext, useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import AuthContext from "../contexts/AuthContext";

const privateAxios = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true

});


export default function useAxios() {
	const user = useContext(AuthContext);

	const refresh = useRefreshToken();

	useEffect(() => {

		const requestInterceptor = privateAxios.interceptors.request.use(
			config => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${user.userData?.accessToken}`;
					config.headers["Cache-Control"] = "no-cache";
					config.headers["Pragma"] = "no-cache";
					config.headers["Expires"] = "0";
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
					prevRequest.headers["Authorization"] = `Bearer ${user.userData?.accessToken}`;
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