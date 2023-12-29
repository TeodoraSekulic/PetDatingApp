import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import undef from "../assets/undefined.png";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import {
  Box,
  Rating,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardHeader,
  IconButton,
  CardMedia,
  CardContent,
  Collapse,
} from "@mui/material";
import ProfileBadge from "./ProfileBadge.js";
import { styled } from "@mui/system";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));
export const ControlledAccordions = (props) => {

  const handleExpandClick = (i) => {
    setExpandedId(expandedId === i ? -1 : i);
  };
  const [expandedId, setExpandedId] = useState(-1);
  const [niz, setNiz] = useState([]);
  const [sortValue, setSortValue] = useState("");


  const handleEvent = (event) => {
    let temp = props.profili;
    if (event.target.value === "Cenovni rang") {
      temp.sort((a, b) => b[0].properties.priceLevel - a[0].properties.priceLevel);
    } else if (event.target.value === "Starost") {
      temp.sort((a, b) => b[0].properties.age - a[0].properties.age);
    }

    setNiz(temp);
    setSortValue(event.target.value);
  };

  useEffect(() => {
    let temp = props.profili;
    setNiz(temp);

    temp.reduce(
      (r, e, i) => (i % 4 ? r[r.length - 1].push(e) : r.push([e])) && r,
      []
    ); // => [[0, 1, 2], [3, 4, 5], [6]]
  }, [props.profili]);

  return (
    <Grid item sm={12} md={11}>
      {props.profili.length != 0 ? (
        <Grid container margin={"1rem"}>
          <Grid item xs={12}>
            <Typography borderBottom="solid gray 1px" variant="h4">
              {props.naslov}
            </Typography>
          </Grid>
          <Grid item xs={11} sm={11} md={4} marginTop="2rem">
            <FormControl fullWidth sx={{ backgroundColor: "white" }}>
              <InputLabel id="demo-simple-select-label">Sortiranje</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Sortiranje"
                onChange={(event) => handleEvent(event)}
                renderValue={(value) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Chip key={value} label={value} />
                  </Box>
                )}
              >
                <MenuItem value={"Cenovni rang"}>Cenovni rang</MenuItem>
                <MenuItem value={"Starost"}>Starost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ) : null}
      <Grid sx={{ pl: "5%", pr: "5%" }} item container spacing={7}>
        {niz.map((profil, i) => {
          return (
            <Grid key={profil[0].identity} item md={4} sm={6} xs={12}>
              <Card>
                <CardHeader
                  title={
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      gap="2rem"
                    >
                      <ProfileBadge user={profil} />
                    </Box>
                  }
                />
                {profil[0].properties.profilePictureUrl ? (
                  <CardMedia
                    component="img"
                    height="240"
                    image={profil[0].properties.profilePictureUrl}
                    alt="Slika nije pronadjena"
                    sx={{ background:"#f5f5f5", objectFit: "contain"}}

                  />
                ) : (
                  <CardMedia
                    component="img"
                    height="240"
                    image={undef}
                    alt={undef}
                    sx={{ background:"#f5f5f5", objectFit: "contain"}}
                  />
                )}
                <CardContent>
                  <Typography
                    style={{ display: "flex", alignItems: "center" }}
                    color="primary"
                    component="h1"
                    fontWeight="500"
                    variant="h6"
                  >
                    Cenovni rang:
                    <Rating
                      name="read-only"
                      value={profil[0].properties.priceLevel}
                      icon={<PaidIcon fontSize="inherit" />}
                      emptyIcon={<PaidOutlinedIcon fontSize="inherit" />}
                      max={3}
                      readOnly
                      sx={{ marginLeft: "0.5rem", marginRight: "1rem" }}
                    />
                  </Typography>
                  <Typography
                    sx={{ flexShrink: 0 }}
                    component="h3"
                    fontWeight="500"
                    variant="h6"
                    color="primary"
                    style={{ marginRight: "2rem" }}
                  >
                    Starost: {profil[0].properties.age} god.
                  </Typography>
                  <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <Typography
                      sx={{ flexShrink: 0 }}
                      component="h3"
                      fontWeight="500"
                      variant="h6"
                      color="primary"
                      style={{ marginRight: "2rem" }}
                    >
                      Trazi partnera:
                      {profil[0].properties.active ? " da" : " ne"}
                    </Typography>
                    <ExpandMore
                      onClick={() => handleExpandClick(i)}
                      aria-expanded={expandedId === i}
                      aria-label="show more"
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </Box>
                </CardContent>

                <Collapse in={expandedId === i} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Box borderTop="1px solid gray">
                      <Typography
                        sx={{ flexShrink: 0 }}
                        component="h3"
                        fontWeight="500"
                        variant="h7"
                        style={{ marginRight: "2rem" }}
                      >
                        Rasa: {profil[1].properties.name}
                      </Typography>
                      <Typography
                        sx={{ flexShrink: 0 }}
                        component="h3"
                        fontWeight="500"
                        variant="h7"
                        style={{ marginRight: "2rem" }}
                      >
                        Lokacija: {profil[2].properties.name}, {profil[3].properties.name}
                      </Typography>
                      <Typography component="h3" fontWeight="500" variant="h7">
                        Opis: {profil[0].properties.bio}
                      </Typography>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};
