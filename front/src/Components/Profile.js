import { React, useState, useEffect } from "react";

//--CSS imports--
import "../css/App.css";

//--Material UI imports--
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import UploadIcon from "@mui/icons-material/Upload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { styled } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";

//--firebase imports--
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "../App.js";
import ResponsiveAppBar from "../elements/ResponsiveAppBar";
import Futer from "../elements/Footer";
import undf from "../assets/undefined.png";
import { ColorButton } from "./Theme";
import FormControl from "@mui/material/FormControl";
import {
  Alert,
  Chip,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  Rating,
  Select,
  Snackbar,
} from "@mui/material";
import Button from "@mui/material/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { api } from "../App";
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
const Profile = () => {
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const storage = getStorage(app);
  const auth = getAuth(app);
  const [file, setFile] = useState("");
  const [image, setImage] = useState("");
  const [ime, setIme] = useState("");
  const [age, setAge] = useState(user[0].properties.age);
  const [bio, setBio] = useState(user[0].properties.bio);
  const [active, setActive] = useState(user[0].properties.active);
  const [nizDrzava, setNizDrzava] = useState([]);
  const [drzava, setDrzava] = useState({});
  const [nizGrad, setNizGrad] = useState([]);
  const [grad, setGrad] = useState(user[2]);

  const inputIme = (event) => setIme(event.target.value);
  const inputAge = (event) => setAge(event.target.value);
  const inputBio = (event) => setBio(event.target.value);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(user[0].properties.priceLevel);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  useEffect(() => {
    const get = async () => {
      await fetch(api + `getLocationCountry`, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setNizDrzava(actualData);
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
  const handleChange = (event) => {
    setFile(event.target.files[0]);
    setOpen(true);
  };

  const promeniLozinku = () => {
    sendPasswordResetEmail(auth, auth.currentUser.email);
    toast.success(
      "Zahtev za promenu lozinke Vam je poslat. Proverite i spam folder!"
    );
  };

  useEffect(() => {
    setIme(user[0].properties.name);
    // setPrezime(user.surname);
    setImage(user[0].properties.profilePictureUrl);
  }, []);

  const update = async (event) => {
    if (grad !== null) {
      const podaci = {
        userType: user[0].properties.userType,
        username: user[0].properties.username,
        password: user[0].properties.password,
        name: ime,
        age: age,
        pedigreUrl: user[0].properties.pedigreUrl,
        profilePictureUrl: image,
        bio: bio,
        priceLevel: value,
        active: active,
        idCity: grad.identity,
        // competitions: "10",
      };
      await fetch(api + `putUser/` + user[0].identity, {
        withCredentials: true,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(podaci),
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          localStorage.setItem("user", JSON.stringify(actualData));
        });
    } else {
      toast.warning("Morate izabrati i grad ukoliko izaberete drzavu!");
    }

    const podaci = {
      id: user[0].identity,
      name: ime,
      photo: image,
    };
    await fetch(api + `putNamePhotoChat`, {
      withCredentials: true,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podaci),
    })
      .then((response) => {
        return response.json();
      })
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
  const Input = styled("input")({
    display: "none",
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: "100vh",
      }}
    >
      <ResponsiveAppBar user={user} />
      <Grid
        container
        item
        display="flex"
        flexDirection="column"
        alignItems={"center"}
        padding={"1rem"}
      >
        <Grid
          display="flex"
          flexDirection="column"
          component={Paper}
          sx={{ padding: "1rem" }}
        >
          <Grid item display="flex" flexDirection="row" flexWrap="wrap">
            <Box
              display="flex"
              flexDirection="column"
              sx={{ m: 2 }}
              gap="0.5rem"
            >
              <Box>
                {image ? (
                  <img
                    src={image}
                    height="250px"
                    style={{
                      background: "#f5f5f5",
                      objectFit: "contain",
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
                      background: "#f5f5f5",
                      objectFit: "contain",
                      maxHeight: "250px",
                      maxWidth: "250px",
                      objectFit: "contain",
                    }}
                  />
                )}
              </Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="contained-button-file"
                multiple //treba single?
                onChange={handleChange}
                type="file"
              />
              <label htmlFor="contained-button-file">
                <Button
                  variant="contained"
                  fullWidth
                  component="span"
                  size="small"
                >
                  <UploadIcon />
                  Dodaj
                </Button>
              </label>

              <ColorButton onClick={promeniSliku} size="small">
                <PhotoCameraIcon /> Postavi
              </ColorButton>
            </Box>
            <Box sx={{ mr: 2, mt: 2 }}>
              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h5"
              >
                Ime
              </Typography>
              <TextField
                margin="normal"
                onChange={inputIme}
                placeholder={user[0].properties.name}
                fullWidth
                id="ime"
                name="ime"
              />

              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h5"
              >
                Starost
              </Typography>
              <TextField
                margin="normal"
                onChange={inputAge}
                placeholder={user[0].properties.age}
                type="number"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                fullWidth
                name="prezime"
                id="prezime"
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
                  checked={active === "true" || active === true}
                  label="Traži partnera"
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
                  checked={active === "false" || active === false}
                  label="Ne traži partnera"
                />
              </Box>
              <Box
                display={"flex"}
                flexDirection="row"
                alignItems="center"
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
              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h6"
              >
                Trenutna lokacija: {user[2].properties.name},{" "}
                {user[3].properties.name}
              </Typography>
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
                        onClick={(e) => {
                          setGrad(null);
                          setDrzava(drzava);
                        }}
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
            </Box>
          </Grid>
          <Box
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
          >
            <>
              {user[0].properties.userType === "user" ? (
                <>
                  <Typography
                    color="primary"
                    component="h1"
                    fontWeight="600"
                    variant="h5"
                  >
                    Opis
                  </Typography>
                  <TextField
                    onChange={inputBio}
                    margin="normal"
                    placeholder={user[0].properties.bio}
                    fullWidth
                    name="opis"
                    id="opis"
                    multiline={true}
                  />
                </>
              ) : (
                <></>
              )}
            </>
            <Box
              style={{
                marginBottom: 20,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 0,
                borderTop: "solid gray 1px",
                width: "45%",
              }}
            >
              <ColorButton
                onClick={update}
                startIcon={<SaveIcon />}
                variant="contained"
                sx={{ mt: 1, mb: 1 }}
                style={{ width: "100%" }}
              >
                Sačuvaj promene
              </ColorButton>
            </Box>
            <Box
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 0,
                width: "45%",
              }}
            >
            </Box>
          </Box>
        </Grid>
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
      <Futer />
    </div>
  );
};

export default Profile;
