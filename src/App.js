// App.js
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";

import History from "./tampilan/History.js";
import Home from "./tampilan/Home.js";
import NavbarPage from "./tampilan/NavbarPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/*"
            element={
              <>
                <NavbarPage />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/history" element={<History />} />
                </Routes>
              </>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
