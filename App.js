import React from "react";
import Scanner from "./components/Scanner";
import io from "socket.io-client";
import Active from "./components/Actice";

function App() {
  return (
    <>
      <Scanner />
    </>
  );
}

export default () => {
  return <App />;
};
