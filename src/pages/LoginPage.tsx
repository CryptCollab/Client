import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { createTheme } from "@mui/material/styles";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAxios from "../hooks/useAxios";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import styles from "../styles/login.module.css";
import { useLoadingContext } from "react-router-loading";
import useLoadingDone from "../hooks/useLoadingDone";
const theme = createTheme();

//TODO add better error mesaage display
export default function Login() {
  const loadingContext = useLoadingContext();
  const user = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axios = useAxios()
  useLoadingDone();



  //used in error attribute in TextField
  //setIsError not yet added
  const [isError, setIsError] = useState("");

  // login user and store user data in redux store
  // redirect to requested page
  const handleLoginClick: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    console.log(event.target["email"].value);
    console.log(event.target["password"].value);
    try {
      const userData = await axios.post<UserLoginDataState>(
        "/api/login",
        {
          "email": event.target["email"].value,
          "password": event.target["password"].value
        });
      user.loginUser(userData.data);
      const redirectURL: string = searchParams.get("redirectURL") ?? "/dashboard";
      navigate(redirectURL);
    }
    catch (error: any) {
      console.error(error);
      setIsError(error?.response?.data);
    }
  };

  const classes = ["container"]

  return (

    <div className={styles.root}>
      <div className={styles.container} >
        <Form onSubmit={handleLoginClick} noValidate>
          <Form.Group className="mb-3" controlId="formBasicEmail" >
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" name="email" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" name="password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Remember me" defaultChecked />
          </Form.Group>
          <Button variant="primary" type="submit" style={{ width: "100%" }}  >
            Submit
          </Button>
        </Form>
      </div>
    </div>

  );
}

