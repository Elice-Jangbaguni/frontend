import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './Main/MainPage.jsx';
import LoginPage from './Auth/LogInPage.jsx';
import SignupPage from './Auth/SignUpPage.jsx';
import TermsPage from './Auth/TermsPage.jsx';
import ProductsPage from './Products/ProductsPage.jsx';
import GroupBuyPage from './GroupBuy/GroupBuyPage.jsx';
import GroupBuyDetailPage from './GroupBuy/GroupBuyDetailPage.jsx'; 


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/groupbuy" element={<GroupBuyPage />} />
        <Route path="/groupbuy/detail" element={<GroupBuyDetailPage />} />

      </Routes>
    </BrowserRouter>
  );
}