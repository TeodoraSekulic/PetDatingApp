import { React, useState, useEffect } from "react";
//--Material UI imports--
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { FormControlLabel, Radio, Rating, TextField } from "@mui/material";
import { ControlledAccordions } from "../elements/ControlledAccordions";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../App";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";

import { ColorButton } from "./Theme";
import ResponsiveAppBar from "../elements/ResponsiveAppBar";
import Futer from "../elements/Footer";
import "react-toastify/ReactToastify.min.css";

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
const UserPretraga = () => {
  const [minAge, setMinAge] = useState("-1");
  const [maxAge, setMaxAge] = useState("-1");
  const inputMinAge = (event) => setMinAge(event.target.value);
  const inputMaxAge = (event) => setMaxAge(event.target.value);
  const [nizDrzava, setNizDrzava] = useState([]);
  const [nizRasa, setNizRasa] = useState([]);
  const [drzava, setDrzava] = useState({});
  const [nizGrad, setNizGrad] = useState([]);
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const [rasa, setRasa] = useState({});
  const [active, setActive] = useState(false);
  const [grad, setGrad] = useState({});
  const [ljubimciPretrage, setLjubimciPretrage] = useState([]);
  const [value, setValue] = useState(0);

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

      let breed;
      await fetch(api + `getBreedType/` + user[1].identity, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          breed = actualData;
        });

      await fetch(api + `getTypeBreeds/` + breed[0].identity, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setNizRasa(actualData);
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

  const klikPretraga = () => {
    const get = async () => {
      let rasaId;
      if (rasa.identity === undefined) rasaId = -1;
      else rasaId = rasa.identity;

      let drzavaId;
      if (drzava.identity === undefined) drzavaId = -1;
      else drzavaId = drzava.identity;

      let gradId;
      if (grad.identity === undefined) gradId = -1;
      else gradId = grad.identity;

      let val;
      if (value === null || value === 0) val = -1;
      else val = value;

      await fetch(
        api +
          `getUsersWithFilters/` +
          user[0].identity +
          "/" +
          rasaId +
          "/" +
          minAge +
          "/" +
          maxAge +
          "/" +
          active +
          "/" +
          gradId +
          "/" +
          drzavaId +
          "/" +
          val,
        {
          method: "GET",
          withCredentials: true,
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((actualData) => {
          setLjubimciPretrage(actualData);
        });
    };
    get();
  };

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
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        mt="1rem"
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="600"
            borderBottom="2px solid gray"
          >
            Pretraga ljubimaca
          </Typography>
        </Box>
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={8}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          component={Paper}
          padding={"0.5rem"}
          elevation={10}
          sx={{ marginTop: "2rem", marginBottom: "1rem" }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-evenly"
            mb="1rem"
            mt="1rem"
          >
            <Typography
              variant="h5"
              color="text.secondary"
              marginBottom={"1rem"}
            >
              Parametri pretrage
            </Typography>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-evenly"
              gap="1rem"
            >
              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h6"
              >
                Minimalna starost
              </Typography>
              <TextField
                margin="normal"
                onChange={inputMinAge}
                placeholder={"0"}
                type="number"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                fullWidth
                name="prezime"
                id="prezime"
              />
              <Typography
                color="primary"
                component="h1"
                fontWeight="600"
                variant="h6"
              >
                Maximalna starost
              </Typography>
              <TextField
                margin="normal"
                onChange={inputMaxAge}
                placeholder={"0"}
                type="number"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                fullWidth
                name="prezime"
                id="prezime"
              />
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="2rem"
          >
            <Typography
              color="primary"
              component="h1"
              fontWeight="600"
              variant="h6"
            >
              Trazi partnera
            </Typography>
            <FormControlLabel
              value="true"
              control={
                <Radio
                  onChange={(event) => {
                    setActive(true);
                  }}
                />
              }
              checked={active === true}
              label="Da"
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
              checked={active === false}
              label="Ne"
            />
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
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-evenly"
          >
            <Box sx={{ mx: 2 }} width="40%">
              <FormControl fullWidth sx={{ mr: 2 }}>
                <InputLabel id="demo-simple-select-label">Rasa</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Oblast"
                  renderValue={(value) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      <Chip key={value} label={value} />
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {nizRasa.map((rasa) => (
                    <MenuItem
                      key={rasa.identity}
                      value={rasa.properties.name}
                      onClick={(e) => setRasa(rasa)}
                    >
                      {rasa.properties.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ my: 5, mx: 3 }} width="40%">
              <FormControl fullWidth sx={{ mr: 2 }}>
                <InputLabel id="demo-simple-select-label">
                  Lokacija drzava
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Lokacija drzava"
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
                      onClick={(e) => setDrzava(drzava)}
                    >
                      {drzava.properties.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ my: 5, mx: 3 }} width="40%">
              <FormControl fullWidth sx={{ mr: 2 }}>
                <InputLabel id="demo-simple-select-label">
                  Lokacija grad
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Lokacija grad"
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
        <Grid
          item
          display="flex"
          justifyContent="center"
          flexDirection="column"
          sx={{ marginTop: "0.2rem", width: 300 }}
        >
          <ColorButton
            fullWidth
            onClick={klikPretraga}
            sx={{ marginTop: "0.2rem", marginBottom: "1rem" }}
            startIcon={<SearchIcon />}
          >
            Pretraga
          </ColorButton>
        </Grid>
      </Grid>

      <Grid container justifyContent={"space-around"} mb="1rem">
        <ControlledAccordions profili={ljubimciPretrage} naslov={"Pretraženi profili"}/>
      </Grid>
      <Futer />
    </div>
  );
};

export default UserPretraga;
