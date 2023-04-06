import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as React from "react";
import { createTheme } from "@mui/material/styles";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import useLoadingDone from "../hooks/useLoadingDone";
import styles from "../styles/login-signup.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { sendPreKeyBundleAndUserKeyStoreToServer } from "../utils/networkUtils";

const theme = createTheme();

//TODO add better error mesaage display
export default async function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const axios = useAxios();
  useLoadingDone();

  const user = useAuth();
  const handleSignUp: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const userData = await axios.post("/api/register", {
        "userName": event.target["username"].value,
        "email": event.target["email"].value,
        "password": event.target["password"].value
      }, {
        withCredentials: true
      });
      
      sendPreKeyBundleAndUserKeyStoreToServer(userData.data, axios);
      user.loginUser(userData.data);
      const redirectURL: string = searchParams.get("redirectURL") ?? "/dashboard";
      navigate(redirectURL);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className={styles.root}>
      <img src='logo_200_light.png' width="auto" height="150px" />
      <span className={styles.welcomeText}>
        Register with <code className={styles.title}>Cryptcollab</code>
      </span>
      <div className={styles.container} >
        <Form onSubmit={handleSignUp} noValidate>
          <Form.Group className="mb-3" controlId="formBasicEmail" >
            <Form.Label>
              Username
            </Form.Label>
            <Form.Control type="text" placeholder="Enter username" name="username" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail" >
            <Form.Label>
              Email address
            </Form.Label>
            <Form.Control type="email" placeholder="Enter email" name="email" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Password
            </Form.Label>
            <Form.Control type="password" placeholder="Password" name="password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Remember me" defaultChecked />
          </Form.Group>
          <Button variant="primary" type="submit" style={{ width: "100%" }}  >
            Submit
          </Button>
        </Form>
        <div className={styles.footer}>
          Already registered? <Link to="/register" className={styles.registerLink}>Log in here</Link>
        </div>
      </div>
    </div >
  );
}
