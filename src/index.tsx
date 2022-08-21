import React from "react";
import ReactDOM from "react-dom/client";
import Board from "./board";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Board />
  </React.StrictMode>
);
