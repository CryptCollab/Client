import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import useAxios from "../hooks/useAxios";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import styles from "../styles/login-signup.module.css";
import useLoadingDone from "../hooks/useLoadingDone";
import { RotatingLines } from "react-loader-spinner";
import useErrorHandler from "../hooks/useErrorHandler";
import ParamErrorListSchema, { ParamError } from "../schema/ParamErrorSchema";

export default function Login() {
	useLoadingDone();
	const axios = useAxios();
	const errorHandler = useErrorHandler();
	const [userError, setUserError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [loading, setLoading] = useState(false);
	const userAuth = useAuth();


	const handleLoginSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setUserError("");
		setPasswordError("");
		setLoading(true);

		try {
			const user = event.target["user"].value;
			const password = event.target["password"].value;

			if (user == false || password == false) {
				if (user == false) setUserError("Email or username is a required field");
				if (password == false) setPasswordError("Password is a required field");
				return;
			}

			const userData = await axios.post<UserData>(
				"/api/login",
				{
					"user": user,
					"password": password
				});

			userAuth.loginUser(userData.data);
		}
		catch (error: any) {

			if (!ParamErrorListSchema.isValidSync(error?.response?.data?.errors)) {
				errorHandler.addError(error);
				return;
			}

			const paramErrorList = error.response.data.errors as ParamError[];

			for (const paramError of paramErrorList) {
				switch (paramError.param) {
				case "user":
					setUserError(paramError.msg);
					break;
				case "password":
					setPasswordError(paramError.msg);
					break;
				default:
					errorHandler.addError(paramError.msg);
					break;
				}
			}

		}
		finally {
			setLoading(false);
		}
	};


	return (
		<div className={styles.root}>
			<img src='logo_200_light.png' width="auto" height="150px" />
			<span className={styles.welcomeText}>
        Log in to <code className={styles.title}>Cryptcollab</code>
			</span>
			<div className={styles.container} >
				<Form onSubmit={handleLoginSubmit} noValidate >
					<Form.Group className="mb-3" controlId="formBasicEmail" >
						<Form.Label>
              Email address or username
						</Form.Label>
						<Form.Control type="text" placeholder="Enter email or username" name="user" isInvalid={userError !== ""} />
						<Form.Control.Feedback type="invalid">
							{userError}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicPassword">
						<Form.Label>
              Password
							<Link style={{ justifyContent: "right" }} to="/account-recovery" className={styles.forgotPasswordText}>Forgot Password?</Link>
						</Form.Label>
						<Form.Control type="password" placeholder="Password" name="password" isInvalid={passwordError !== ""} />
						<Form.Control.Feedback type="invalid">
							{passwordError}
						</Form.Control.Feedback>
					</Form.Group>
					<Button variant="primary" type="submit" className="submitButton" disabled={loading}>
						{(loading) ? <RotatingLines
							strokeColor="white"
							strokeWidth="5"
							animationDuration="0.75"
							width="20"
							visible={true}
						/> : "Submit"}
					</Button>
				</Form>
				<div className={styles.footer}>
          Not registered? <Link to="/register" className={styles.registerLink}>Sign up here</Link>
				</div>
			</div>
		</div >
	);
}

