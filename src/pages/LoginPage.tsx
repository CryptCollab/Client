import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import { AxiosError } from "axios"
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert"
import styles from "../styles/login-signup.module.css";
import useLoadingDone from "../hooks/useLoadingDone";

interface PostError {
  errors: [
    {
      msg: string,
      param: string,
      location: string
    }
  ]
}

export default function Login() {
  const user = useAuth();
  const axios = useAxios();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unknownError, setUnknownError] = useState("");
  const location = useLocation();
  useLoadingDone();



  //used in error attribute in TextField
  //setIsError not yet added

  // login user and store user data in redux store
  // redirect to requested page
  const handleLogin: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();



    try {
      const userData = await axios.post<UserData>(
        "/api/login",
        {
          "user": event.target["user"].value,
          "password": event.target["password"].value,
          "remember": event.target["rememberMe"].checked
        });
      user.loginUser(userData.data);
    }
    catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          setUnknownError(error.response.status);
        }
        else {
          setUnknownError(error.response.data);
        }
      } else if (error.request) {
        setUnknownError(`Server responded with a code of ${error.response.status} with no additional response.`);
      } else {
        console.error(error);
        setUnknownError(error.message);
      }

    }
  };

  return (

    <div className={styles.root}>
      <img src='logo_200_light.png' width="auto" height="150px" />
      <span className={styles.welcomeText}>
        Log in to <code className={styles.title}>Cryptcollab</code>
      </span>
      <div className={styles.container} >
        <Form onSubmit={handleLogin} noValidate>
          <Form.Group className="mb-3" controlId="formBasicEmail" >
            <Form.Label>
              Email address or username
            </Form.Label>
            <Form.Control type="text" placeholder="Enter email or user" name="user" isInvalid={emailError !== ""} />
            <Form.Control.Feedback type="invalid">
              { }
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Password
              <Link style={{ justifyContent: "right" }} to="/account-recovery" className={styles.forgotPasswordText}>Forgot Password?</Link>
            </Form.Label>
            <Form.Control type="password" placeholder="Password" name="password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Remember me" name="rememberMe" defaultChecked />
          </Form.Group>
          <Button variant="primary" type="submit" style={{ width: "100%" }}  >
            Submit
          </Button>
        </Form>
        <div className={styles.footer}>
          Not registered? <Link to="/register" className={styles.registerLink}>Sign up here</Link>
        </div>
      </div>
      {(unknownError !== "") && <Alert variant="danger" onClose={() => setUnknownError("")} dismissible>

        <span>{JSON.stringify(unknownError)}</span>
      </Alert>}
    </div>

  );
}

