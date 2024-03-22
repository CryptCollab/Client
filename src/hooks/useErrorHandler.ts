import { useContext } from "react";
import ErrorHandlerContext from "../contexts/ErrorHandlerContext";
import { isAxiosError } from "axios";


export default function useErrorHandler() {
	const { errors, setErrors } = useContext(ErrorHandlerContext);

	const addError = (error: any) => {
        
		console.error(error);
		let errorMsg = "";

		if (!isAxiosError(error)) {
			errorMsg = (typeof error === "object") ? JSON.stringify(error) : error;
		}
		else if (!error.response) {
			errorMsg = "No response received from server";
		}
		else {
			errorMsg = error.response.status + ": " + error.response.data;
		}

		setErrors([...errors, errorMsg]);

	};

	return { errors, addError, setErrors };
}   