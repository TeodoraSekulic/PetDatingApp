import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const [countDown, setCountDown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countDown]);

  if (countDown == 0) {
    navigate("/");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "10%",
      }}
    >
      <h1 style={{ color: "#1f5d78" }}>
        {"Nemate pristup zahtevanoj stranici"}
      </h1>
      {countDown == 1 ? (
        <h2 style={{ color: "#021b2e" }}>
          {"Preusmeravanje na početnu stranicu za " + countDown + " sekundu"}
        </h2>
      ) : countDown == 5 ? (
        <h2 style={{ color: "#021b2e" }}>
          {"Preusmeravanje na početnu stranicu za " + countDown + " sekundi"}
        </h2>
      ) : (
        <h2 style={{ color: "#021b2e" }}>
          {"Preusmeravanje na početnu stranicu za " + countDown + " sekundе"}
        </h2>
      )}
    </div>
  );
}
