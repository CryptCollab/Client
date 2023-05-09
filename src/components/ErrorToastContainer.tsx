import ToastContainer from "react-bootstrap/ToastContainer";
import styles from "../styles/error-toast.module.css";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorToast from "./ErrorToast";



export default function ErrorToastContainer() {
	const handler = useErrorHandler();
	const closeHandler = (index: number) => {
		//FIXME multiple are being removed
		handler.errors.splice(index, 1);
		//Copying array to mutate the state
		handler.setErrors([...handler.errors]);
		console.log(handler.errors);
	};

	return (
		<ToastContainer position="bottom-start" className={styles.container}>
			{handler.errors.map((error, index) =>
				<ErrorToast error={error} key={index} index={index} closeHandler={closeHandler} />
			)}
		</ToastContainer >
	);
}
