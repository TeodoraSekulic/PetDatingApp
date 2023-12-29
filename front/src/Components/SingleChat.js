import React, { useEffect, useState, useRef } from "react";

import { api } from "../App.js";
import { TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { ChipCopy } from "./Theme";
import { Avatar } from "@mui/material";
import Box from "@mui/material/Box";
import SendIcon from "@mui/icons-material/Send";

const SingleChat = (props) => {
  const skrol = useRef();
  let userLogged = localStorage.getItem("user");
  const user = JSON.parse(userLogged);
  const [messages, setMessages] = useState([]);
  const [novaPoruka, setNovaPoruka] = useState("");

  const posaljiPoruku = async () => {
    let podaci = {
      messageid:new Date().valueOf(),
      text: novaPoruka,
      date: Date.now(),
      senderid: user[0].identity,
      chatid: props.sagovornik.chatid,
    };
    await fetch(api + `addMessage`, {
      withCredentials: true,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(podaci),
    }).then((response) => {
      setNovaPoruka("");
      return response.json();
    });
    ucitajPoruke();
    skrol.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    skrol.current.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const ucitajPoruke = async () => {
    await fetch(api + `getMessages/` + props.sagovornik.chatid)//chatID
      .then((response) => {
        return response.json();
      })
      .then((actualData) => setMessages(actualData));
  };
  useEffect(() => {
    const interval = setInterval(() => {
      //POKUPI SVE PORUKE!!!

      ucitajPoruke();
    }, 1000);

    return () => clearInterval(interval);
  }, [props.sagovornik]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "0.5rem",
          borderBottom: "2px solid dimGray",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          backgroundColor: "white",
          height: "8%",
        }}
      >
        {props.sagovornik.user1id != user[0].identity ? (
          <Avatar
             src={props.sagovornik.user1photo}
            style={{ marginRight: "1rem" }}
          ></Avatar>
        ) : (
          <Avatar
            src={props.sagovornik.user2photo}
            style={{ marginRight: "1rem" }}
          ></Avatar>
        )}
        <Typography variant="h4">
          {props.sagovornik.user1id != user[0].identity
            ? props.sagovornik.user1name 
            : props.sagovornik.user2name}
        </Typography>
      </div>

      <div style={{ height: "80%", overflowY: "scroll" }}>
        {messages.map((message) => {
          const date = new Date(Number(message.datemessage));
          const humanDateFormat = date.toLocaleTimeString();
          if (message.senderid == user[0].identity) {
            return (
              <div
                key={message.idmessage}
                style={{ display: "flex", flexDirection: "row-reverse" }}
              >
                <Box>
                  <ChipCopy
                    ja={true}
                    poruka={message.textmessage}
                    vreme={humanDateFormat}
                    boja={"#1f5d78"}
                  />
                </Box>
              </div>
            );
          } else {
            return (
              <div key={message.idmessage}>
                <Box>
                  {props.sagovornik.user1id != user[0].identity ? (
                    <ChipCopy
                      foto={props.sagovornik.user1photo}
                      vreme={humanDateFormat}
                      poruka={message.textmessage}
                      boja={"gray"}
                    />
                  ) : (
                    <ChipCopy
                      foto={props.sagovornik.user2photo}
                      vreme={humanDateFormat}
                      poruka={message.textmessage}
                      boja={"gray"}
                    />
                  )}
                </Box>
              </div>
            );
          }
        })}
        <div ref={skrol}></div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "10%",
        }}
      >
        <TextField
          value={novaPoruka}
          onChange={(e) => setNovaPoruka(e.target.value)}
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              posaljiPoruku();
            }
          }}
          style={{ width: "95%" }}
        ></TextField>
        <SendIcon
          fontSize="large"
          onClick={posaljiPoruku}
          style={{ width: "5%" }}
        />
      </div>
    </div>
  );
};

export default SingleChat;
