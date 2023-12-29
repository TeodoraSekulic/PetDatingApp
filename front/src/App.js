//--CSS imports--
import "./css/App.css";

//--Component imports--
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import HomePage from "./Components/HomePage";
import Profile from "./Components/Profile";
import NotFound from "./Components/NotFound";
import Chat from "./Components/Chat";
import Following from "./Components/Following";
import UserPretraga from "./Components/UserPretraga";
import UserProfil from "./Components/UserProfil";

//--Firebase imports--
import { initializeApp } from "firebase/app";

import React from "react";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./Components/Theme";
import Layout from "./Components/Layout";
import RequireAuth from "./Components/RequireAuth";
const ROLES = {
  User: "user",
  Admin: "admin",
};
const firebaseConfig = {
  apiKey: "AIzaSyAu64JjT9hiv8YROXVUGtGUj8dywJc6GY8",
  authDomain: "nbp-redisandneo4j.firebaseapp.com",
  projectId: "nbp-redisandneo4j",
  storageBucket: "nbp-redisandneo4j.appspot.com",
  messagingSenderId: "295371484101",
  appId: "1:295371484101:web:2db9962a831243e05279ac"
  // measurementId: "G-066LSSZJBH",
};

export const api = "http://localhost:3001/";

export const app = initializeApp(firebaseConfig);

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            element={
              <RequireAuth allowedRoles={[ROLES.User]} />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<Chat />} />            
            <Route path="/following" element={<Following />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/userPretraga" element={<UserPretraga />} />
            <Route path="/UserProfil/:id" element={<UserProfil />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};
export default App;
