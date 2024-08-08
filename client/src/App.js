// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProjectListings from './pages/ProjectListings';
import CreateProject from './pages/CreateProject';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<CreateProject />} />
          <Route path="/projects" element={<ProjectListings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
