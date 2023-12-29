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
import Avatar from "@mui/material/Avatar";
import { ButtonGroup, Typography, TextField, Box } from "@mui/material";
import { api } from "../App";

export default function Korisnici() {
  const [korisnici, setKorisnici] = useState([]);
  const [filter, setFilter] = useState("");
  const [filtrirano, setFiltrirano] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };

  const handleReset = async (idKorisnika) => {
    await fetch(api + `deleteUser/` + idKorisnika, {
      method: "DELETE",
      withCredentials: true,
    }).then((response) => {
      users();
      return response.json();
    });
  };

  const users = async () => {
    await fetch(api + `getUsers`, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        setKorisnici(actualData);
        setFiltrirano(actualData);
      });
  };

  useEffect(() => {
    users();
  }, []);

  useEffect(() => {
    let temp = [];
    korisnici.forEach((korisnik) => {
      if (korisnik[0].properties.username.includes(filter)) {
        temp.push(korisnik);
      }
    });
    setFiltrirano(temp);
  }, [filter]);

  return (
    <Grid container overflow={"scroll"}>
      <Grid item md={12} padding={"1rem"}>
        <Box width={"30%"}>
          <Typography variant={"h4"} sx={{ mb: "1rem" }}>
            Pregled korisnika
          </Typography>
          <Typography>Pretraga po username-u korisnika</Typography>
          <TextField
            variant={"outlined"}
            value={filter}
            onChange={handleFilter}
            fullWidth
          />
        </Box>
      </Grid>
      <Grid item md={12} padding={"1rem"}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Fotografija</TableCell>
                <TableCell>ID korisnika</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Ime</TableCell>
                <TableCell>Rasa</TableCell>
                <TableCell>Starost</TableCell>
                <TableCell>Aktivan</TableCell>
                <TableCell>Cenovni rang</TableCell>
                <TableCell>Biografija</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrirano.map((row) => (
                <TableRow
                  hover={true}
                  key={row[0].identity}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Avatar src={row[0].properties.profilePictureUrl} />
                  </TableCell>
                  <TableCell>{row[0].identity}</TableCell>
                  <TableCell>{row[0].properties.username}</TableCell>
                  <TableCell>{row[0].properties.name}</TableCell>
                  <TableCell>{row[0].properties.name /*treba rasa*/}</TableCell>
                  <TableCell>{row[0].properties.age}</TableCell>
                  <TableCell>{row[0].properties.active}</TableCell>
                  <TableCell>{row[0].properties.priceLevel}</TableCell>
                  {row[0].properties.bio.length > 20 ? (
                    <>
                      <TableCell>
                        {row[0].properties.bio.substring(0, 20) + "..."}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell>{row[0].properties.bio}</TableCell>
                  )}

                  <TableCell align={"right"}>
                    <ButtonGroup>
                      <Button
                        color={"error"}
                        onClick={(event) => handleReset(row[0].identity)}
                      >
                        Obriši korisnika
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
