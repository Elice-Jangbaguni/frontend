import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import apiClient from './API/client';
import MainPage from './Main/MainPage.jsx';
import LoginPage from './Auth/LogInPage.jsx';
import SignupPage from './Auth/SignUpPage.jsx';
import TermsPage from './Auth/TermsPage.jsx';
import ProductsPage from './Products/ProductsPage.jsx';
import GroupBuyPage from './GroupBuy/GroupBuyPage.jsx';
import GroupBuyDetailPage from './GroupBuy/GroupBuyDetailPage.jsx'; 


export default function App() {

  useEffect(() => {
    // 앱이 처음 열릴 때 백엔드 서버를 미리 깨워둠 (응답 결과는 무시)
    apiClient.get('/docs').catch(() => {});
  }, []);

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