import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserProvider } from './components/contexts/UserContext';
import App from './App';
import { UserContext } from './components/contexts/UserContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
