import { createTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Avatar } from "@mui/material";
import { Typography } from "@mui/material";
import PropTypes from "prop-types";

import undf from "../assets/undefined.png";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "../css/Chat.css";

export const theme = createTheme({
  status: {
    danger: "#e53e3e",
  },
  palette: {
    primary: {
      main: "#b08b46",
      darker: "#021b2e",
    },
    info: {
      main: "#ffffff",
    },
    neutral: {
      main: "#b08b46",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: "Raleway",
  },
});

export const ColorButton = styled(Button)(({ theme }) => ({
  color: "#f5faf9",
  backgroundColor: "#b08b46",
  "&:hover": {
    backgroundColor: "#806432",
  },
}));

export const ChipCopy = (props) => {
  return (
    <Box
      margin={"1rem"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={props.ja ? "flex-end" : "flex-start"}
      justifyContent={"flex-start"}
      maxWidth={"max-content"}
      width="400px"
      style={{ padding: "0.5rem" }}
    >
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        maxWidth={"max-content"}
        width="400px"
        style={{
          backgroundColor: props.boja,
          color: "white",
          borderRadius: "20px",
          padding: "0.5rem",
        }}
      >
        {props.ja == true ? null : <Avatar alt={undf} src={props.foto} />}
        <Typography marginLeft={"10px"} marginRight={"10px"}>
          {props.poruka}
        </Typography>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        paddingLeft={"0.5rem"}
        paddingRight={"0.5rem"}
        justifyContent={props.ja ? "flex-end" : "flex-start"}
        width="400px"
      >
        <Typography>{props.vreme}</Typography>
      </Box>
    </Box>
  );
};
export const PopupDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const PopupDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      fontWeight="900"
      borderBottom="2px solid grey"
      sx={{ m: 0, p: 2 }}
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

PopupDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};
