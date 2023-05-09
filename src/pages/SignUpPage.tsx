import { Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import useLoadingDone from "../hooks/useLoadingDone";
import styles from "../styles/login-signup.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import useErrorHandler from "../hooks/useErrorHandler";
import * as yup from "yup";
import ParamErrorListSchema, { ParamError } from "../schema/ParamErrorSchema";
import { RotatingLines } from "react-loader-spinner";

const emailSchema = yup.string().email().required();
export default function SignUp() {

	useLoadingDone();
	const axios = useAxios();
	const errorHandler = useErrorHandler();
	const [usernameError, setUsernameError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [loading, setLoading] = useState(false);
	const userAuth = useAuth();

	const handleSignUpSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setUsernameError("");
		setEmailError("");
		setPasswordError("");
		setLoading(true);

		try {
			const username = event.target["username"].value;
			const email = event.target["email"].value;
			const password = event.target["password"].value;

			if (username == false || email == false || password == false) {
				if (username == false) setUsernameError("Username is a required field");
				if (email == false) setEmailError("Email is a required field");
				else if (emailSchema.isValidSync(email) == false) setEmailError("This Email is not valid");
				if (password == false) setPasswordError("Password is a required field");
				//TODO strong password check
				return;
			}

			const userData = await axios.post("/api/register", {
				"userName": username,
				"email": email,
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
				case "username":
					setUsernameError(paramError.msg);
					break;
				case "email":
					setEmailError(paramError.msg);
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
        Register with <code className={styles.title}>Cryptcollab</code>
			</span>
			<div className={styles.container} >
				<Form onSubmit={handleSignUpSubmit} noValidate>
					<Form.Group className="mb-3" controlId="formBasicUsername" >
						<Form.Label>
              Username
						</Form.Label>
						<Form.Control type="text" placeholder="Enter username" name="username" isInvalid={usernameError !== ""} />
						<Form.Control.Feedback type="invalid">
							{usernameError}
						</Form.Control.Feedback>
					</Form.Group>
					<Form.Group className="mb-3" controlId="formBasicEmail" >
						<Form.Label>
              Email address
						</Form.Label>
						<Form.Control type="email" placeholder="Enter email" name="email" isInvalid={emailError !== ""} />
						<Form.Control.Feedback type="invalid">
							{emailError}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicPassword">
						<Form.Label>
              Password
						</Form.Label>
						<Form.Control type="password" placeholder="Password" name="password" isInvalid={passwordError !== ""} autoComplete="new-password" />
						<Form.Control.Feedback type="invalid">
							{passwordError}
						</Form.Control.Feedback>
					</Form.Group>
					<Button variant="primary" type="submit" style={{ width: "100%" }} disabled={loading} >
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
          Already registered? <Link to="/register" className={styles.registerLink}>Log in here</Link>
				</div>
			</div>
		</div >
	);
}
