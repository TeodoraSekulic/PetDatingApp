import { React, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import paw from "../assets/paw0.jpg";
import UploadIcon from "@mui/icons-material/Upload";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

//--Material UI imports--
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { app } from "../App.js";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
// import io from "socket.io-client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../App";

//--firebase imports--
import { ColorButton, PopupDialog, PopupDialogTitle } from "./Theme";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import ProfileBadge from "../elements/ProfileBadge";
import io from "socket.io-client";

const UserPocetna = () => {
  let userLogged = localStorage.getItem("user");
  const navigate = useNavigate();
  const obj = JSON.parse(userLogged);
  const [prikaziPostove, setPrikaziPostova] = useState(false);
  const [objave, setObjave] = useState([]);
  const [slicni, setSlicni] = useState([]);
  const [file, setFile] = useState("");
  const [brisanjeId, setBrisanjeId] = useState("");
  const [image, setImage] = useState("");
  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [followed, setFollowed] = useState({});
  const [noFollowers, setnoFollowers] = useState("");

  const storage = getStorage(app);
  const [open3, setOpen3] = useState(false);
  const socket = io("http://localhost:3001"); 
  const channel = obj[0].identity;

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("subscribe", { userId: channel });
    });

    socket.on("message", (data) => {
      if (data.userId == obj[0].identity) {
        fetch(api + `getUserById/` + data.followedById)
          .then((response) => {
            return response.json();
          })
          .then((actualData) => {
            setFollowed(actualData[0]);
            setOpenSnack(true);
          });
      }
    });
  }, []);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnack(false);
  };
  const dodajPost = async () => {
    let podaci = {
      imageURL: image,
      date: Date.now(),
      idUser: obj[0].identity,
    };
    await fetch(api + `postPost`, {
      withCredentials: true,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podaci),
    }).then((response) => {
      getPostove();
      return response.json();
    });
    setImage("");
  };
  const obrisiObjavu = async (objava) => {
    await fetch(api + "deletePost/" + objava, {
      method: "DELETE",
    });
    getPostove();
  };
  const handleChange = async (event) => {
    setFile(event.target.files[0]);
    setOpen(true);
  };
  const promeniSliku = async () => {
    if (!file) {
      alert("Molim Vas izaberite fotografiju !");
    }

    const storageRef = ref(storage, `/files/${new Date().valueOf()}`);
    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(storageRef).then((url) => {
        setImage(url);
      });
    });
  };
  const getPostove = async () => {
    await fetch(api + `getUserPosts/` + obj[0].identity)
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setObjave(actualData);
      });
  };
  const getSimilar = async () => {
    await fetch(api + `getSimilarUsers/` + obj[0].identity)
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setSlicni(actualData);
      });
  };
  useEffect(() => {
    fetch(api + `getNumberOfInterestedUsers/` + obj[0].identity)
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setnoFollowers(actualData);
      });
    getSimilar();
  }, []);
  const klikPretraga = () => {
    navigate("/userPretraga");
  };

  return (
    <div>
      <Grid container flexDirection="column" alignItems="center">
        {!prikaziPostove ? (
          <>
            <Grid
              item
              component={Paper}
              elevation={10}
              sx={{ marginTop: "2rem", marginBottom: "2rem" }}
            >
              <Card sx={{ display: "flex" }}>
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography component="h1" variant="h4">
                    Zdravo {obj[0].properties.name},
                  </Typography>
                  <Box display="flex" flexDirection="row">
                    <Typography component="h1" variant="h5">
                      {"Dobro došli na\xa0"}
                    </Typography>
                    <Typography
                      component="h1"
                      fontWeight="600"
                      variant="h5"
                      color="primary"
                    >
                      PetDatingApp!
                    </Typography>
                  </Box>
                  <Typography color="primary" component="h1" variant="h6">
                    Broj zainteresovanih profila: {noFollowers[0]}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  sx={{ width: 250, display: { xs: "none", sm: "block" } }}
                  image={paw}
                />
              </Card>
            </Grid>

            <Box
              width="40%"
              mb="2rem"
              display="flex"
              flexDirection="row"
              gap="3rem"
            >
              <Box display="flex" flexDirection="column" flexWrap="nowrap">
                <Typography
                  variant="h3"
                  align="center"
                  marginBottom="2rem"
                  fontWeight="700"
                  borderBottom="2px solid gray"
                >
                  Pretražite ljubimce!
                </Typography>
                <ColorButton
                  align="center"
                  fullWidth
                  onClick={klikPretraga}
                  startIcon={<SearchIcon />}
                >
                  Pretraga
                </ColorButton>
              </Box>

              <Box display="flex" flexDirection="column" flexWrap="nowrap">
                <Typography
                  variant="h3"
                  align="center"
                  marginBottom="2rem"
                  fontWeight="700"
                  borderBottom="2px solid gray"
                >
                  Prikaži moje objave!
                </Typography>
                <ColorButton
                  align="center"
                  fullWidth
                  onClick={() => {
                    getPostove();
                    setPrikaziPostova(!prikaziPostove);
                  }}
                  // startIcon={<SearchIcon />}
                >
                  Prikaži
                </ColorButton>
              </Box>
            </Box>

            <Grid
              component={Paper}
              elevation={10}
              display="flex"
              flexDirection={"column"}
              marginBottom="2rem"
              padding="1rem"
              alignItems={"center"}
            >
              <Grid
                item
                xs={12}
                display="flex"
                flexDirection={"row"}
                flexWrap={"wrap"}
              >
                {slicni.map((profil) => {
                  return (
                    <Box
                      component={Paper}
                      elevation={1}
                      sx={{
                        flex: "1",
                        minWidth: "261px",
                        marginRight: "5px",
                        marginLeft: "5px",
                        marginBottom: "1rem",
                      }}
                    >
                      <Card>
                        <CardMedia
                          component="img"
                          height="180"
                          image={profil[0].properties.profilePictureUrl}
                          sx={{ background: "#f5f5f5", objectFit: "contain" }}
                        />
                        <CardContent>
                          <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography component="h1" variant="h6">
                              <ProfileBadge user={profil} />
                            </Typography>
                            <Rating
                              name="read-only"
                              value={profil[0].properties.priceLevel}
                              icon={<PaidIcon fontSize="inherit" />}
                              emptyIcon={
                                <PaidOutlinedIcon fontSize="inherit" />
                              }
                              max={3}
                              readOnly
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Grid>

              <Grid item elevation={3} sx={{ marginTop: "1rem" }}>
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{ marginRight: "auto", marginLeft: "auto" }}
                >
                  Profili koji vas mozda mogu zainteresovati.
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ marginRight: "auto", marginLeft: "auto" }}
                >
                  Predlozi su izabrani na osnovu vase lokacije i rase, takodje
                  svi traze partnera.
                </Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Box mt="2rem" mb="2rem">
              <Typography
                variant="h3"
                align="center"
                marginBottom="2rem"
                fontWeight="700"
                borderBottom="2px solid gray"
              >
                Vaše objave
              </Typography>
              <ColorButton
                align="center"
                fullWidth
                onClick={() => setPrikaziPostova(!prikaziPostove)}
              >
                Sakrij
              </ColorButton>
            </Box>
            <Grid item container spacing={5} sx={{ pl: "10rem", pr: "10rem" }}>
              <Grid item md={4} sm={6} xs={12}>
                <Card>
                  <CardMedia
                    component="img"
                    height="240"
                    image={image}
                    sx={{ background: "#f5f5f5", objectFit: "contain" }}
                  />
                  <CardContent>
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="space-between"
                    >
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
                      <ColorButton
                        size="small"
                        onClick={(event) => dodajPost()}
                      >
                        <SaveIcon />
                        Sačuvaj
                      </ColorButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {objave.map((objava) => {
                const date = new Date(Number(objava.properties.date));
                const humanDateFormat = date.toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "numeric",
                  minute: "numeric",
                });
                return (
                  <Grid key={objava.identity} item md={4} sm={6} xs={12}>
                    <Card>
                      <CardMedia
                        sx={{ background: "#f5f5f5", objectFit: "contain" }}
                        component="img"
                        height="240"
                        image={objava.properties.imageURL}
                      />
                      <CardContent>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-between"
                        >
                          <Typography component="h1" variant="h6">
                            {humanDateFormat}
                          </Typography>
                          <ColorButton
                            size="small"
                            onClick={(event) => {
                              setBrisanjeId(objava.identity);
                              setOpen3(true);
                            }}
                          >
                            <DeleteIcon />
                            Obriši
                          </ColorButton>
                          <PopupDialog
                            onClose={() => setOpen3(false)}
                            fullWidth={true}
                            aria-labelledby="customized-dialog-title"
                            open={open3}
                            BackdropProps={{ style: { opacity: "20%" } }}
                          >
                            <PopupDialogTitle
                              display="flex"
                              flexDirection="row"
                              flexWrap="wrap"
                              justifyContent="space-between"
                              id="customized-dialog-title"
                              onClose={() => {
                                setOpen3(false);
                              }}
                            >
                              Potvrdi brisanje objave.
                              <ColorButton
                                sx={{ mr: "3rem" }}
                                size="small"
                                onClick={() => {
                                  setOpen3(false);
                                  obrisiObjavu(brisanjeId);
                                }}
                              >
                                <DeleteIcon />
                                Obriši
                              </ColorButton>
                            </PopupDialogTitle>
                          </PopupDialog>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Grid>
      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          style={{ backgroundColor: "lightYellow", color: "#b08b46" }}
          sx={{ width: "100%" }}
        >
          <Typography component="h1" variant="h6">
            {"Imate novog pratioca: "}
            <ProfileBadge user={followed} />
          </Typography>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserPocetna;
