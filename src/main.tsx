import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/globals.css";

import { BrowserRouter } from "react-router-dom";
import { WorkoutProvider } from "./context/WorkoutContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkoutProvider>
        <App />
      </WorkoutProvider>
    </BrowserRouter>
  </React.StrictMode>
);