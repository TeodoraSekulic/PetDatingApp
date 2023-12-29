import React, { useState, useEffect } from "react";

//--CSS imports--
import "../css/Chat.css";
import undf from "../assets/undefined.png";

//--Material UI imports--
import Grid from "@mui/material/Grid";
import { Avatar } from "@mui/material";
import { Typography, TextField } from "@mui/material";

import ResponsiveAppBar from "../elements/ResponsiveAppBar.js";
import Futer from "../elements/Footer.js";
import SingleChat from "./SingleChat";
import { api } from "../App";

const Chat = () => {
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const [listaKorisnika, setListaKorisnika] = useState([]);
  const [prikaz, setPrikaz] = useState({});
  const [filter, setFilter] = useState("");
  const [filtrirano, setFiltrirano] = useState([]);

  useEffect(() => {
    let temp = [];
    listaKorisnika.forEach((e) => {
      if (
        e.user1id != user[0].identity &&
        (e.user1name).includes(filter)
      ) {
        temp.push(e);
      } else if (
        e.user1id  == user[0].identity &&
        (e.user2name).includes(filter)
      ) {
        temp.push(e);
      }
    });
    setFiltrirano(temp);
  }, [filter]);

  useEffect(() => {
    const getKonverzacije = async () => {
      fetch(api + `getChatForUser/` + user[0].identity)
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setListaKorisnika(actualData);
          setFiltrirano(actualData);
        });
    };
    getKonverzacije();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "10%" }}>
        <ResponsiveAppBar user={user} />
      </div>

      <Grid container style={{ height: "82%" }}>
        <Grid
          item
          className="leviItem"
          xs={12}
          sm={12}
          md={3}
          sx={{ xs: { height: "200px" }, md: { height: "100%" } }}
        >
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              label="Pretraga"
              fullWidth
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              variant="outlined"
            />
          </Grid>
          {filtrirano.map((chat) => (
            <Grid item xs={12} sm={12} md={12} mt="1rem" key={chat.chatid}>
              <div
                className="contact"
                onClick={(event) => {
                  chat.user1id
                  == user[0].identity
                    ? setPrikaz(chat)
                    : setPrikaz(chat); //postavi chat kao glavni koristi se u singleChat
                }}
              >
                {chat.user1id != user[0].identity
                    ? (<Avatar alt={undf} margin="auto" src={chat.user1photo} />)
                    : (<Avatar alt={undf} margin="auto" src={chat.user2photo} />) }
                
                <Typography margin="auto" align="center" sx={{ ml: 1.5 }}>
                  {chat.user1id != user[0].identity
                    ? chat.user1name
                    : chat.user2name }
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={12} sm={12} md={9} style={{ height: "100%" }}>
          {Object.keys(prikaz).length != 0 ? (
            <SingleChat sagovornik={prikaz} />
          ) : null}
        </Grid>
      </Grid>
      <Futer />
    </div>
  );
};

export default Chat;
