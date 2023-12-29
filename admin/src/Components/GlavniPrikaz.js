import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import React from "react";
import { Grid, Typography } from "@mui/material";
import { api } from "../App";
import { Chart as ChartJS } from "chart.js/auto";

export default function GlavniPrikaz() {
  const [users, setUsers] = useState();
  const [dataKategorije, setDatakategorije] = useState({
    labels: [],
    datasets: [
      {
        backgroundColor: ["rgba(0,10,220,0.5)"],
        label: "Po lokaciji drzave",
        data: [],
      },
    ],
  });

  const [dataLokacije, setDataLokacije] = useState({
    labels: [],
    datasets: [
      {
        backgroundColor: "rgba(220,0,10,0.5)",
        label: "Po lokaciji grada",
        data: [],
      },
    ],
  });

  const vratiData = async () => {
    let data = {
      labels: [],
      datasets: [
        {
          backgroundColor: ["rgba(0,10,220,0.5)"],
          label: "Po lokaciji drzave",
          data: [],
        },
      ],
    };

    let classes;
    await fetch(api + `getUsers`, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => classes=actualData);
      
    await fetch(api + `getLocationCountry`, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        actualData.forEach((kategorija) => {
          data.labels.push(kategorija.properties.name);
        });
      });

    data.labels.forEach((value, index) => {
      let counter = 0;
      classes.forEach((cls) => {
        if (cls[3].properties.name == value) counter++;
      });
      data.datasets[0].data.splice(index, 0, counter);
      counter = 0;
    });
    setDatakategorije(data);

    let dataLoc = {
      labels: [],
      datasets: [
        {
          backgroundColor: "rgba(220,0,10,0.5)",
          label: "Po lokaciji grada",
          data: [],
        },
      ],
    };

    await fetch(api + `getLocationCity`, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => {
        actualData.forEach((lokacija) => {
          dataLoc.labels.push(lokacija.properties.name);
        });
      });

    dataLoc.labels.forEach((value, index) => {
      let counter = 0;
      classes.forEach((cls) => {
        if (cls[2].properties.name == value) counter++;
      });
      dataLoc.datasets[0].data.splice(index, 0, counter);
      counter = 0;
    });
    setDataLokacije(dataLoc);
  };

  const vratiBrojeve = async () => {
    await fetch(api + `getUsers`, {
      method: "GET",
      withCredentials: true,
    })
      .then((response) => {
        return response.json();
      })
      .then((actualData) => setUsers(actualData.length));
  };

  useEffect(() => {
    vratiData();
    vratiBrojeve();
  }, []);

  return (
    <Grid container sx={{ height: "100%" }}>
      <Grid item xs={12} padding={"1rem"} sx={{ height: "40%" }}>
        <Typography variant={"h4"} sx={{ mb: "1rem",mt: "5rem" }}>
          Broj korisnika platforme : {users}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Bar data={dataKategorije} />
      </Grid>
      <Grid item xs={6}>
        <Bar data={dataLokacije} />
      </Grid>
    </Grid>
  );
}
