import React, { useState } from "react";
import Dashboard from "./Components/dashboard/Dashboard";
import SignIn from "./SignIn";

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAu64JjT9hiv8YROXVUGtGUj8dywJc6GY8",
  authDomain: "nbp-redisandneo4j.firebaseapp.com",
  projectId: "nbp-redisandneo4j",
  storageBucket: "nbp-redisandneo4j.appspot.com",
  messagingSenderId: "295371484101",
  appId: "1:295371484101:web:2db9962a831243e05279ac"
  // measurementId: "G-066LSSZJBH",
};

export const app = initializeApp(firebaseConfig);

export const api = "http://localhost:3001/";
const App = () => {
  const [token, setToken] = useState("");
  const obj = localStorage.getItem("user");
  const ucerObj = JSON.parse(obj);
  let role;
  if (ucerObj != null)
    role = ucerObj[0]?.properties.userType;
  else role = "notAdmin";

  const tokenAquire = (val) => {
    localStorage.setItem("token", val);
    setToken(val);
  };

  const logout = () => {
    localStorage.setItem("token", "");
    localStorage.removeItem("user");
    setToken("");
  };

  return role == "admin" ? (
    <Dashboard logout={logout}></Dashboard>
  ) : (
    <SignIn tokenCb={tokenAquire} />
  );
};

export default App;
