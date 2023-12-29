import React, { useState, useEffect } from "react";
import { Avatar, Typography } from "@mui/material";
import { api } from "../App";

function ProfilBadge(props) {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [foto, setFoto] = useState("");

  useEffect(() => {
    fetch(api + `user/` + props.korisnikID, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setIme(actualData.name);
        setPrezime(actualData.surname);
        setFoto(actualData.imageUrl);
      });
  }, [props]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Avatar src={foto} sizes={"small"} sx={{ mr: "1rem" }} />
      <Typography>{ime + " " + prezime}</Typography>
    </div>
  );
}

export default ProfilBadge;
