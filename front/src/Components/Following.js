import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { ControlledAccordions } from "../elements/ControlledAccordions";
import Futer from "../elements/Footer";
import ResponsiveAppBar from "../elements/ResponsiveAppBar";
import { api } from "../App";

const Following = () => {
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const [praceniLjubimci,setPraceniLjubimci]=useState([]);

  useEffect(() => {
    const get = async () => {
      await fetch(
        api +`getInterestedUsers/` +user[0].identity,
          {
            method: "GET",
            withCredentials: true,
          }
      )
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setPraceniLjubimci(actualData);
        });
    };
    get();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <div style={{ height: "10%" }}>
        <ResponsiveAppBar user={user} />
      </div>
      <Grid container flexDirection="column" alignItems="center">
        <Grid container justifyContent={"space-around"} mb="1rem">
          <ControlledAccordions profili={praceniLjubimci} naslov={"Profili koje pratite"} />
        </Grid>
      </Grid>
      <Futer />
    </div>
  );
};

export default Following;
