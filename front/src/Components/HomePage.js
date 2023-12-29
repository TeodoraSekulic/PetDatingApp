import React, { useEffect, useState } from "react";

//--Material UI imports--
import CssBaseline from "@mui/material/CssBaseline";

import UserPocetna from "./UserPocetna.js";
import ResponsiveAppBar from "../elements/ResponsiveAppBar";
import Futer from "../elements/Footer";

const HomePage = () => {
  let userLogged = localStorage.getItem("user");
  const [user, setUser] = useState({});

  useEffect(() => {
    const obj = JSON.parse(userLogged);
    setUser(obj);
  }, []);

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
      <CssBaseline />
      <ResponsiveAppBar user={user} />
      {<UserPocetna />}
      <Futer />
    </div>
  );
};

export default HomePage;
