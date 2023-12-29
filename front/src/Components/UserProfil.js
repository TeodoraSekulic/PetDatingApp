import { React, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "react-toastify/ReactToastify.min.css";
//--CSS imports--
import "../css/App.css";

//--Material UI imports--
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Card, CardMedia, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import MailIcon from "@mui/icons-material/Mail";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { ToastContainer, toast } from "react-toastify";
// import io from "socket.io-client";
// import Redis from "ioredis";
import "react-toastify/ReactToastify.min.css";

import ResponsiveAppBar from "../elements/ResponsiveAppBar";
import { ColorButton } from "./Theme";
import { Avatar, Rating } from "@mui/material";
import { api } from "../App";
import io from "socket.io-client";

const UserProfil = (props) => {
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const location = useLocation();
  const navigate = useNavigate();
  const [objave, setObjave] = useState([]);
  const [followed, setFollowed] = useState(false);
  const socket = io("http://localhost:3001");
  
  const doPoruka = () => {
    let podaci = {
      chatid: new Date().valueOf(),
      idUser1: location.state.identity,
      idUser2: user[0].identity,
      user1name: location.state.name,
      user2name: user[0].properties.name,
      user1photo: location.state.profilePictureUrl,
      user2photo: user[0].properties.profilePictureUrl,
    };
    const func = async () => {
      await fetch(api + `addChat`, {
        withCredentials: true,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(podaci),
      }).then((actualData) => {
        navigate("/chat", { state: actualData });
      });
    };
    if (user.id !== null) func();
  };

  const odprati = async () => {
    await fetch(
      api +
        `deleteInterestedInUser/` +
        user[0].identity +
        "/" +
        location.state.identity,
      {
        method: "DELETE",
      }
    ).then((response) => {
      toast.success("Otpratili ste korisnika!");
      return response;
    });
    await fetch(
      api +
        `getIsInterestedInUser/` +
        user[0].identity +
        "/" +
        location.state.identity
    )
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setFollowed(actualData[0]);
      });
  };

  const zaprati = async () => {
    const data = {
      userId: location.state.identity,
      followedById: user[0].identity,
      username: user[0].properties.username,
      name: user[0].properties.name,
      profilePictureUrl: user[0].properties.profilePictureUrl,
    };

    socket.emit("message", data);

    await fetch(
      api +
        `InterestedInUser/` +
        user[0].identity +
        "/" +
        location.state.identity,
      {
        withCredentials: true,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      toast.success("Zapratili ste korisnika!");

      return response;
    });
    await fetch(
      api +
        `getIsInterestedInUser/` +
        user[0].identity +
        "/" +
        location.state.identity
    )
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setFollowed(actualData[0]);
      });

  };

  const getPostove = async () => {
    await fetch(api + `getUserPosts/` + location.state.identity)
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setObjave(actualData);
      });
    await fetch(
      api +
        `getIsInterestedInUser/` +
        user[0].identity +
        "/" +
        location.state.identity
    )
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setFollowed(actualData[0]);
      });
  };

  useEffect(() => {
    getPostove();
  }, []);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"space-between"}
      height={"100%"}
    >
      <ResponsiveAppBar user={user} />
      <Grid
        container
        display={"flex"}
        flexDirection="column"
        alignItems="center"
      >
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={9}
          component={Paper}
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="2rem"
          style={{ marginTop: 15 }}
        >
          <Avatar
            src={location.state.profilePictureUrl}
            alt="U"
            sx={{ width: "200px", height: "200px" }}
          />
          <Typography
            variant="h4"
            fontWeight="700"
            marginBottom="2rem"
            borderBottom="2px solid gray"
          >
            {location.state.name} {location.state.surname}
          </Typography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            gap="2rem"
          >
            <ColorButton
              onClick={doPoruka}
              style={{ width: "10rem", height: "4rem" }}
            >
              Pošaljite poruku{" "}
              <MailIcon fontSize="large" style={{ width: "25%" }} />
            </ColorButton>
            {followed ? (
              <>
                <ColorButton
                  onClick={odprati}
                  style={{ width: "10rem", height: "4rem" }}
                >
                  Odprati{" "}
                  <FavoriteIcon fontSize="large" style={{ width: "25%" }} />
                </ColorButton>
              </>
            ) : (
              <>
                <ColorButton
                  onClick={zaprati}
                  style={{ width: "10rem", height: "4rem" }}
                >
                  Zaprati{" "}
                  <FavoriteBorderIcon
                    fontSize="large"
                    style={{ width: "25%" }}
                  />
                </ColorButton>
              </>
            )}
          </Box>
        </Grid>
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={9}
          component={Paper}
          display="flex"
          flexDirection="column"
          padding="2rem"
          style={{ marginTop: 15, marginBottom: 15 }}
        >
          <Typography variant="h5" fontWeight="600">
            Trazi partnera:
            {location.state.active ? " da" : " ne"}
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="h5" fontWeight="600">
              Cenovni rang:
            </Typography>
            <Rating
              name="read-only"
              precision={0.1}
              value={location.state.priceLevel}
              icon={<PaidIcon fontSize="inherit" />}
              emptyIcon={<PaidOutlinedIcon fontSize="inherit" />}
              max={3}
              readOnly
              sx={{ marginLeft: "0.5rem", marginRight: "1rem" }}
            />
          </Box>
          <Typography variant="h5" fontWeight="600">
            Rasa:
            {" " + location.state.race}
          </Typography>
          <Typography variant="h5" fontWeight="600">
            Starost:
            {" " + location.state.age + " god."}
          </Typography>
          <Typography variant="h5" fontWeight="600">
            Lokacija:
            {" " + location.state.city + ", " + location.state.country}
          </Typography>
          <Typography variant="h5" fontWeight="600" borderTop="1px solid gray">
            Biografija:
          </Typography>
          <Typography variant="h6" fontWeight="500">
            {location.state.bio}{" "}
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={9}
          component={Paper}
          display="flex"
          flexDirection="column"
          padding="2rem"
          style={{ marginBottom: 15 }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            marginBottom="1rem"
            borderBottom="1px solid gray"
          >
            Objave
          </Typography>
          <Grid item container spacing={5}>
            {objave.map((objava) => {
              return (
                <Grid key={objava.id} item md={4} sm={6} xs={12}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="240"
                      image={objava.properties.imageURL}
                      sx={{ background: "#f5f5f5", objectFit: "contain" }}
                    />
                    <CardContent>
                      <Typography component="h1" variant="h6" align="right">
                        {"Datum objave: " +
                          new Date(
                            Number(objava.properties.date)
                          ).toLocaleDateString("de-DE", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "numeric",
                            minute: "numeric",
                          })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
      <Box
        display={"flex"}
        flexDirection="row"
        justifyContent={"center"}
        sx={{ background: "#b08b46" }}
        width={"100%"}
        margin={"auto"}
        padding={"auto"}
      >
        <h4 style={{ color: "#FFFFFF" }}>Copyright : team © 2023</h4>
      </Box>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop
      />
    </Box>
  );
};

export default UserProfil;
