import React, { useState, useEffect } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {
  ButtonGroup,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  MenuItem,
} from "@mui/material";
import { api } from "../App";

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
export default function Rasa() {
  const [lokacije, setLokacije] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [nizDrzava, setNizDrzava] = useState([]);
  const [drzava, setDrzava] = useState({});

  const handleObrisi = async (id) => {
    await fetch(api + `deleteBreed/` + id, {
      method: "DELETE",
      withCredentials: true,
    })
    loadData();
  };

  const handleDodaj = async (event) => {
    let podaci = { name: naziv, idType: drzava.identity };
    await fetch(api + `postBreed/`, {
      withCredentials: true,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podaci),
    })
    loadData();
  };

  const loadData = async () => {
    fetch(api + `getTypeBreeds` + "/" + drzava.identity, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setLokacije(actualData);
      });
  };

  useEffect(() => {
    const get = async () => {
      await fetch(api + `getTypes`, {
        method: "GET",
        withCredentials: true,
      })
        .then((response) => {
          return response.json();
        })
        .then((actualData) => setNizDrzava(actualData));
    };
    get();
  }, []);

  useEffect(() => {
    if (drzava != "") {
      loadData();
    }
  }, [drzava]);

  return (
    <Grid container overflow={"scroll"} ju>
      <Grid item md={12} padding={"1rem"}>
        <Typography variant={"h4"} sx={{ mb: "1rem" }}>
          Rase
        </Typography>
        <Grid width={"50%"}>
          <Typography variant={"h6"} sx={{ mb: "0.5rem" }}>
            Dodajte rasu tipa
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="demo-simple-select-label">Rase</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Drzava"
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
          <TextField
            variant={"outlined"}
            sx={{ mb: "0.5rem" }}
            value={naziv}
            placeholder="Unesite naziv rase"
            onChange={(event) => setNaziv(event.target.value)}
            fullWidth
          />

          <Button
            variant={"contained"}
            sx={{ mb: "0.5rem" }}
            color={"success"}
            onClick={(event) => handleDodaj()}
          >
            Dodaj rasu
          </Button>
        </Grid>
      </Grid>
      <Grid item md={12} padding={"1rem"}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Dostupne rase</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lokacije.map((row) => (
                <TableRow
                  key={row.identity}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.properties.name}</TableCell>
                  <TableCell align={"right"}>
                    <ButtonGroup>
                      <Button
                        color={"error"}
                        onClick={(event) => handleObrisi(row.identity)}
                      >
                        {" "}
                        Obriši
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
