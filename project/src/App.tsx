import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ForumPage from './pages/ForumPage';
import NewsPage from './pages/NewsPage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime" element={<AnimeDirectoryPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;