// src/App.js
import React from "react";
import RealtimeData from "./components/RealtimeData";

function App() {
  return (
    <div className="App">
      <h1 className="text-2xl font-bold m-4">Theo dõi không khí lớp học</h1>
      <RealtimeData />
    </div>
  );
}

export default App;
