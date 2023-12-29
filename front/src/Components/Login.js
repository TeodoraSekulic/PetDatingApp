import React, { useState } from "react";

//--image imports--
import logo2 from "../assets/logo5.png";

import photo1 from "../assets/photo1.jpg";
import photo2 from "../assets/photo2.jpg";
import photo3 from "../assets/photo3.jpg";

//--CSS imports--
import "../css/Login.css";
import { ColorButton } from "./Theme";

//--Material UI imports--
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { api } from "../App";
import useAuth from "../hooks/useAuth";

import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const nizSlika = [photo1, photo2, photo3];
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [rand, setRand] = useState(Math.floor(Math.random() * 3));

  const from = location.state?.from?.pathname || "/";

  const inputEmail = (event) => {
    setEmail(event.target.value);
  };
  const inputPassword = (event) => setPassword(event.target.value);

  const handleSubmit = async (event) => {
    const podaci = {
      username: email,
      password: password,
    };
    await fetch(api + `login`, {
      withCredentials: true,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podaci),
    })
      .then((response) => {
        if (response.statusText == "Unauthorized")
          toast.error("Neispravni podaci za nalog!");
        return response.json();
      })
      .then((actualData) => {
        let roles = [];
        roles.push("user");
        const user = [];
        user.push(actualData);
        setAuth({ user, roles });
        localStorage.setItem("user", JSON.stringify(actualData));
        navigate(from, { replace: true });
      });
  };

  return (
    <div>
      <Grid
        container
        component="main"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100vh" }}
      >
        <CssBaseline />

        <Grid
          item
          style={{ paddingTop: "3%", paddingBottom: "4%" }}
          component={Paper}
          elevation={12}
          display="flex"
          flexDirection="row"
          alignItems="center"
        >
          <Grid item style={{ paddingTop: 16, marginLeft: 25 }}>
            <img src={nizSlika[rand]} style={{ maxHeight: "30em" }} />
          </Grid>

          <Box className="glavniBox" component="form" noValidate sx={{ mt: 1 }}>
            <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" mb="2rem">
              <img src={logo2} style={{ maxHeight: 100 }} />
              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h3"
              >
                PetDatingApp
              </Typography>
            </Box>
            <Typography color="primary" component="h1" variant="h5">
              Prijava korisnika
            </Typography>
            <TextField
              margin="normal"
              required
              onChange={inputEmail}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  handleSubmit(e);
                }
              }}
              fullWidth
              id="email"
              label="Email Adresa"
              name="email"
              autoComplete="email"
            />

            <TextField
              margin="normal"
              required
              onChange={inputPassword}
              fullWidth
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  handleSubmit(e);
                }
              }}
              name="password"
              label="Lozinka"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Box>
              <ColorButton
                fullWidth
                onClick={handleSubmit}
                variant="contained"
                sx={{ mt: 3, mb: 2, height: "40px" }}
              >
                Prijavite se
              </ColorButton>

              <Grid
                container
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Grid item style={{ marginTop: "3%" }}>
                  <Link href="/signup" variant="body1">
                    {"Nemate nalog? Napravite ga!"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop
      />
    </div>
  );
};

export default Login;
