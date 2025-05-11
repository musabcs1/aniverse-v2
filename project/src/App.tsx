import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ForumPage from './pages/ForumPage';
import ForumThreadDetailPage from './pages/ForumThreadDetailPage';
import NewsPage from './pages/NewsPage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import AnimeSeasonPage from './pages/AnimeSeasonPage';
import BannedPage from './pages/BannedPage';
import MessagesPage from './pages/MessagesPage';
import MessageDetailPage from './pages/MessageDetailPage';
import NewMessagePage from './pages/NewMessagePage';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/ToastContainer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/anime" element={<AnimeDirectoryPage />} />
                  <Route path="/anime/:animeId" element={<AnimeDetailPage />} />
                  <Route path="/anime/:animeId/season/:seasonName" element={<AnimeSeasonPage />} />
                  <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
                  <Route path="/forum/:threadId" element={<ProtectedRoute><ForumThreadDetailPage /></ProtectedRoute>} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/profile/:username" element={<ProfilePage />} />
                  <Route path="/user/:userId" element={<ProfilePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin-login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="/messages/new" element={<ProtectedRoute><NewMessagePage /></ProtectedRoute>} />
                  <Route path="/messages/:conversationId" element={<ProtectedRoute><MessageDetailPage /></ProtectedRoute>} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/banned" element={<BannedPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;