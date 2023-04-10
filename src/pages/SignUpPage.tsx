import { useNavigate, useSearchParams } from "react-router-dom";
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
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { CryptoUtils } from "../utils/crypto";
import { cryptoUtils } from "../App";
import { InitServerInfo } from "../cryptolib/x3dh";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";
import { sendPreKeyBundleAndUserKeyStoreToServer } from "../utils/networkUtils";

const theme = createTheme();

//TODO add better error mesaage display
export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const axios = useAxios();

  const user = useAuth();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    try {
      const registrationResponse = await axios.post<UserLoginDataState>(
        "/api/register",
        {
          userName: event.currentTarget.username.value,
          email: event.currentTarget.email.value,
          password: event.currentTarget.password.value,
        },
        {
          withCredentials: true,
        }
      );
      sendPreKeyBundleAndUserKeyStoreToServer(registrationResponse.data, axios);

      user.loginUser(registrationResponse.data);
      const redirectURL: string =
        searchParams.get("redirectURL") ?? "/dashboard";
      navigate(redirectURL);
    } catch (error) {
      console.error(error);
      console.log("NHi ho rha kya")
    }
  };
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
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <LinkMUI href="/login" variant="body2">
                  Already have an account? Log in
                </LinkMUI>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
