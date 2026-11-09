import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './Mainpage.jsx';
import LoginPage from './Loginpage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}