import React, { useState, useEffect } from "react";

//--CSS import--
import "../css/SignUp.css";
import { ColorButton } from "./Theme";

//--Material UI imports--
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import CssBaseline from "@mui/material/CssBaseline";
import undf from "../assets/undefined.png";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { api } from "../App";
import { app } from "../App.js";
import UploadIcon from "@mui/icons-material/Upload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import {
  Alert,
  Button,
  Chip,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  Radio,
  Rating,
  Select,
  Snackbar,
  Stack,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ime, setIme] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState();
  const [nizDrzava, setNizDrzava] = useState([]);
  const [drzava, setDrzava] = useState({});
  const [nizGrad, setNizGrad] = useState([]);
  const [grad, setGrad] = useState({});
  const [nizTip, setNizTipova] = useState([]);
  const [tip, setTip] = useState({});
  const [nizRasa, setNizRasa] = useState([]);
  const [rasa, setRasa] = useState({});
  const { setAuth } = useAuth();
  const [file, setFile] = useState("");
  const [image, setImage] = useState("");
  const storage = getStorage(app);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);

  const inputEmail = (event) => setEmail(event.target.value);
  const inputPassword = (event) => setPassword(event.target.value);

  useEffect(() => {
    const get = async () => {
      await fetch(api + `getLocationCountry`, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => setNizDrzava(actualData));

      await fetch(api + `getTypes`, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setNizTipova(actualData);
        });
    };
    get();
  }, []);

  useEffect(() => {
    if (drzava != "") {
      const getGradovi = async () => {
        fetch(api + `getLocationCountryCities/` + drzava.identity, {
          method: "GET",
          withCredentials: true,
        })
          .then((response) => {
            return response.json();
          })
          .then((actualData) => setNizGrad(actualData));
      };

      getGradovi();
    }
  }, [drzava]);

  useEffect(() => {
    if (tip != "") {
      const getRase = async () => {
        fetch(api + `getTypeBreeds/` + tip.identity, {
          method: "GET",
          withCredentials: true,
        })
          .then((response) => {
            return response.json();
          })
          .then((actualData) => setNizRasa(actualData));
      };

      getRase();
    }
  }, [tip]);

  const signUp = async (event) => {
    const podaci = {
      userType: "user",
      username: email,
      password: password,
      name: ime,
      age: age,
      pedigreUrl: "nema",
      bio: bio,
      priceLevel: value,
      profilePictureUrl: image,
      active: active,
      idBreed: rasa.identity,
      idCity: grad.identity,
    };
    if (password.length < 8)
      toast.error("Šifra mora biti duža od 8 karaktera!");
    else {
      await fetch(api + `postUser`, {
        withCredentials: true,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(podaci),
      })
        .then((response) => {
          if (response.status == 409) {
            toast.error("Profil sa unetom email adresom već postoji!");
          }
          return response.json();
        })
        .then((actualData) => {
          let roles = [];
          roles.push("user");
          setAuth({ roles });
          localStorage.setItem("user", JSON.stringify(actualData));
          if (actualData[0].identity != null)
            navigate("/", { replace: true });
        });
    }
  };
  const handleChange = (event) => {
    setFile(event.target.files[0]);
    setOpen(true);
  };
  const promeniSliku = async () => {
    if (!file) {
      alert("Molim Vas izaberite fotografiju !");
    }

    const storageRef = ref(storage, `/files/${file.name}`);
    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(storageRef).then((url) => {
        setImage(url);
      });
    });
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Grid
      container
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
        flexDirection="column"
        alignItems="center"
      >

        <Typography
          color="primary"
          component="h1"
          fontWeight="600"
          variant="h5"
        >
          Napravite novi nalog
        </Typography>
        <Box className="glavniBox" component="form" noValidate sx={{ mt: 1 }}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              sx={{ mr: 2 }}
              style={{ width: "40%" }}
              alignItems="center"
              justifyContent="center"
            >
              <Box>
                {image ? (
                  <img
                    src={image}
                    height="250px"
                    style={{
                      maxHeight: "250px",
                      maxWidth: "250px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <img
                    src={undf}
                    height="250px"
                    style={{
                      maxHeight: "250px",
                      maxWidth: "250px",
                      objectFit: "contain",
                    }}
                  />
                )}
              </Box>
              <Stack
                direction="row"
                alignitems="center"
                spacing={2}
                style={{ marginBottom: "1rem", marginTop: "1rem" }}
              >
                <label htmlFor="contained-button-file">
                  <Input
                    accept="image/*"
                    id="contained-button-file"
                    type="file"
                    onChange={handleChange}
                  />
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    component="span"
                    fullWidth
                  >
                    Dodaj sliku
                  </Button>
                </label>
              </Stack>

              <ColorButton
                startIcon={<PhotoCameraIcon />}
                onClick={promeniSliku}
                fullWidth
              >
                Postavi sliku
              </ColorButton>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                margin="normal"
                required
                onChange={inputEmail}
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
                name="password"
                label="Lozinka"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <TextField
                margin="normal"
                required
                onChange={(e) => setIme(e.target.value)}
                fullWidth
                id="name"
                label="Ime"
                name="ime"
              />

              <TextField
                margin="normal"
                required
                onChange={(e) => setAge(e.target.value)}
                fullWidth
                type="number"
                id="age"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                label="Starost"
                name="age"
              />

              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-evenly"
              >
                <FormControlLabel
                  value="true"
                  control={
                    <Radio
                      onChange={(event) => {
                        setActive(true);
                      }}
                    />
                  }
                  checked={active === true}
                  label="U teranju"
                />
                <FormControlLabel
                  value="false"
                  control={
                    <Radio
                      onChange={(event) => {
                        setActive(false);
                      }}
                    />
                  }
                  checked={active === false}
                  label="Nije u teranju"
                />
              </Box>
              <Box
                display={"flex"}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-evenly"
                gap="1rem"
              >
                <Typography
                  color="primary"
                  component="h1"
                  fontWeight="600"
                  variant="h6"
                >
                  Opseg cene
                </Typography>
                <Rating
                  name="simple-controlled"
                  value={value}
                  onChange={(event, newValue) => {
                    setValue(newValue);
                  }}
                  icon={<PaidIcon fontSize="inherit" />}
                  emptyIcon={<PaidOutlinedIcon fontSize="inherit" />}
                  max={3}
                />
              </Box>
            </Box>
          </Box>
          <TextField
            onChange={(e) => setBio(e.target.value)}
            margin="normal"
            fullWidth
            name="opis"
            id="opis"
            multiline={true}
            label="Opis"
          />
          <Box
            display="flex"
            flexDirection="row"
            alignItems="stretch"
            justifyContent="space-evenly"
            alignContent="stretch"
            gap={"1rem"}
          >
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="demo-simple-select-label">Drzava</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Drzava"
                renderValue={(value) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip key={value} label={value} />
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {nizDrzava.map((drzava) => (
                  <MenuItem
                    key={drzava.identity}
                    value={drzava.properties.name}
                    onClick={(e) => setDrzava(drzava)}
                  >
                    {drzava.properties.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="demo-simple-select-label">Grad</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Grad"
                renderValue={(value) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip key={value} label={value} />
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {nizGrad.map((grad) => (
                  <MenuItem
                    key={grad.identity}
                    value={grad.properties.name}
                    onClick={(e) => setGrad(grad)}
                  >
                    {grad.properties.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            alignItems="stretch"
            justifyContent="space-evenly"
            alignContent="stretch"
            gap={"1rem"}
          >
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="demo-simple-select-label">Tip</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Tip"
                renderValue={(value) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip key={value} label={value} />
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {nizTip.map((tip) => (
                  <MenuItem
                    key={tip.identity}
                    value={tip.properties.name}
                    onClick={(e) => setTip(tip)}
                  >
                    {tip.properties.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="demo-simple-select-label">Rasa</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Rasa"
                renderValue={(value) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip key={value} label={value} />
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {nizRasa.map((rasa) => (
                  <MenuItem
                    key={rasa.identity}
                    value={rasa.properties.name}
                    onClick={(e) => setRasa(rasa)}
                  >
                    {rasa.properties.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <ColorButton
              fullWidth
              onClick={signUp}
              variant="contained"
              sx={{ mt: 3, mb: 2, height: "40px" }}
            >
              Napravite nalog
            </ColorButton>

            <Grid
              container
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Grid item style={{ marginTop: "3%" }}>
                <Link href="/login" variant="body1">
                  {"Već imate nalog? Prijavite se!"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          variant="filled"
          onClose={handleClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Slika je uspšno dodata, možete kliknuti na "Postavi sliku"
        </Alert>
      </Snackbar>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop
      />
    </Grid>
  );
};

export default SignUp;
