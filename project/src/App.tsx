import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import ForumPage from './pages/ForumPage';
import NewsPage from './pages/NewsPage';

function App() {
  const isLoggedIn = !!localStorage.getItem('userData'); // Check if user is logged in

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/directory" element={<AnimeDirectoryPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/auth" />}
        />
      </Routes>
    </Router>
  );
}

export default App;