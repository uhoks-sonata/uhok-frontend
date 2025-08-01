import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import Main from './pages/home_shopping/HomeShoppingMain';

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