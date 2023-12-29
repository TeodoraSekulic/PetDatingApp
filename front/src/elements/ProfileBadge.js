import { React, useEffect } from "react";

//--CSS imports--
import "../css/App.css";

import { useNavigate } from "react-router-dom";

//--Material UI imports--
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Avatar } from "@mui/material";

import Button from "@mui/material/Button";

const ProfileBadge = (props) => {
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const doUsera = () => {
    navigate("/UserProfil/" + props.user[0].properties.username, {
      state: {
        identity:props.user[0].identity,
        name: props.user[0].properties.name,
        username: props.user[0].properties.username,
        bio: props.user[0].properties.bio,
        profilePictureUrl: props.user[0].properties.profilePictureUrl,
        age: props.user[0].properties.age,
        priceLevel:props.user[0].properties.priceLevel,
        pedigreUrl:props.user[0].properties.pedigreUrl,
        active:props.user[0].properties.active,
        userType:props.user[0].properties.userType,
        city:props.user[2].properties.name,
        country:props.user[3].properties.name,
        race:props.user[1].properties.name,
      },
    });
  };

  return (
    <Button
      onClick={doUsera}
      sx={{ border: "2px solid #012A4A", borderRadius: "25px" }}
    >
      <Grid
        sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Avatar alt="U" src={props.user[0].properties.profilePictureUrl} />
        <Typography fontWeight="600" sx={{ ml: 1.5 }}>
          {props.user[0].properties.name}
        </Typography>
      </Grid>
    </Button>
  );
};

export default ProfileBadge;
