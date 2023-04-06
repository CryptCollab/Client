import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import LinkMUI from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import useAxios from "../hooks/useAxios";
import { cryptoUtils } from "../App";
import { sendPreKeyBundleToServer } from "../utils/networkUtils";

const theme = createTheme();

//TODO add better error mesaage display
export default function Login() {
  const user = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axios = useAxios()
  console.log(axios.defaults.baseURL)


  //used in error attribute in TextField
  //setIsError not yet added
  const [isError, setIsError] = React.useState("");

  // login user and store user data in redux store
  // redirect to requested page
  const handleLoginClick: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const loginResponse = await axios.post<UserLoginDataState>(
        "/api/login",
        {
          "email": event.currentTarget.email.value,
          "password": event.currentTarget.passwordInputBox.value
        }, {
        withCredentials: true
      });
      console.log(loginResponse.data);
      sendPreKeyBundleToServer(loginResponse.data, axios);
      user.loginUser(loginResponse.data);
      const redirectURL: string = searchParams.get("redirectURL") ?? "/dashboard";
      navigate(redirectURL);
    }
    catch (error: any) {
      console.error(error);
      setIsError(error?.response?.data);
    }
  };

  /*return (
      <div className={styles.main}>
          Welcome back! Please login to continue<br />
          <form onSubmit={event => event.preventDefault()}>
              <label htmlFor="usernameInputBox">Username: </label>
              <input id="usernameInputBox" type="text" name="usernameInputBox" /><br />
              <label htmlFor="passwordInputBox">Password: </label>
              <input id="passwordInputBox" type="password" name="passwordInputBox" /><br />
              <input id="submitButton" onClick={handleLoginClick} type="submit" value="Login" /><br />
          </form><br />
          <span> New User? Sign up <Link to="/register">here</Link></span>
      </div>
  )*/

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Log in
          </Typography>
          <Box component="form" onSubmit={handleLoginClick} noValidate sx={{ mt: 1 }}>
            <TextField
              error={isError !== ""}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              helperText={isError}
            />
            <TextField
              error={isError !== ""}
              margin="normal"
              required
              fullWidth
              name="passwordInputBox"
              label="Password"
              type="password"
              id="passwordInputBox"
              autoComplete="current-password"
              helperText={isError}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Log In
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <LinkMUI href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </LinkMUI>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
