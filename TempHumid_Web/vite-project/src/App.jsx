import React from "react";
import {Routes, Route, NavLink, Navigate} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="app">
      <div className="header">
        <div className="header-title align-left">
          <h1 className="header-text">Theo dõi không khí lớp học</h1>
        </div>
      </div>
      <div className="main">
        <Routes>
          <Route path="/" element={<Dashboard />}/>
          <Route path="/*" element={<Navigate to={"/"}/>}/>
        </Routes>
        
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;
