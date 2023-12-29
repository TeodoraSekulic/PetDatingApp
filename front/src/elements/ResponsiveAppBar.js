import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//--PNG imports--
import logo4 from "../assets/logo4.png";

//--Material UI imports--
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import { ColorButton } from "../Components/Theme";
import FavoriteIcon from "@mui/icons-material/Favorite";

//--firebase imports--
import { api } from "../App";
import useAuth from "../hooks/useAuth";

const ResponsiveAppBar = (props) => {
  const { setAuth } = useAuth();
  let userLogged = localStorage.getItem("user");
  const [user, setUser] = useState({});
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const obj = JSON.parse(userLogged);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  useEffect(() => {
    setUser(obj);
  }, []);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleProfil = () => {
    navigate("/profile");
  };

  const handleMessage = () => {
    navigate("/chat");
  };

  const handleFollowed = () => {
    navigate("/following");
  };

  const handleOdjava = () => {
    fetch(api + `auth/logout`, {
      method: "GET",
      withCredentials: true,
    }).then((actualData) => {
      localStorage.removeItem("user");
      setAuth({});
      navigate("/login");
    });
  };
  const navigateHome = () => {
    navigate("/");
  };
  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            <ColorButton
              size="large"
              color="inherit"
              onClick={navigateHome}
              mr="2"
            >
              <img src={logo4} height="40" cs={{ mr: 2 }} />
            </ColorButton>
          </Box>
          <Box sx={{ display: { xs: "flex" } }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleMessage}
              mr="2"
            >
              <Badge color="error">
                <MailIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              color="inherit"
              onClick={handleFollowed}
              mr="2"
            >
              <Badge color="error">
                <FavoriteIcon />
              </Badge>
            </IconButton>

            <Box sx={{ ml: 2 }}>
              <Tooltip title="Otvorite podešavanja">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="U" src={obj[0].properties.profilePictureUrl} />
                </IconButton>
              </Tooltip>
              <Menu
                className={"navMenu"}
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleProfil}>
                  <ListItemIcon>
                    <PersonIcon fontSize="medium" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profil</Typography>
                </MenuItem>
                <MenuItem onClick={handleOdjava}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="medium" />
                  </ListItemIcon>
                  <Typography textAlign="center">Odjavite se</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
