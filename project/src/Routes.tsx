import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import ForumPage from './pages/ForumPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/anime/:id" element={<AnimeDetailPage />} />
      <Route path="/anime" element={<AnimeDirectoryPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default RoutesComponent;
