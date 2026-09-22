import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { runStartupMigrations } from "./utils/migrations";

import "./styles/globals.css";

// Must run before anything reads sessions, so every screen sees the
// migrated shape from the first render.
runStartupMigrations();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
