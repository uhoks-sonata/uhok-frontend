import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Main from './pages/HomeShoppingMain';

function App() {
  return (
    <div className="wrapper">
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/main" element={<Main />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;