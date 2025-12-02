import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import UserAccountPage from './pages/UserAccountPage';
import RephraseTextPage from './pages/RephraseTextPage';
import './index.css';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<UserAccountPage />} />
          <Route path="/rephrase" element={<RephraseTextPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
