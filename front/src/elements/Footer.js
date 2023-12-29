import React from "react";

//--Material UI imports--
import { Box } from "@mui/material";

import "../css/App.css";
const Futer = () => {
  return (
    <Box
      display={"flex"}
      flexDirection="row"
      justifyContent={"center"}
      backgroundColor={"#b08b46"}
      width={"100%"}
      padding={"auto"}
    >
      <h4 style={{ color: "#FFFFFF" }}>Copyright : team © 2023</h4>
    </Box>
  );
};
export default Futer;
