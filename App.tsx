
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import HowToUsePage from './pages/HowToUsePage';
import Layout from './components/Layout';
import { storageService } from './services/storageService';
import { ThemeOption } from './types';

const App: React.FC = () => {
  // Theme & Accessibility Manager
  useEffect(() => {
    const applySettings = () => {
      const settings = storageService.getSettings();
      const root = window.document.documentElement;
      const body = window.document.body;
      
      // 1. Theme
      const theme = settings.theme || 'system';
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // 2. Senior Mode (Accessibility)
      // We apply a 'senior-mode' class which increases base font size via CSS utility
      if (settings.isSeniorMode) {
        root.classList.add('senior-mode');
        // Manually boost body font size for rapid effect
        body.style.fontSize = '120%';
      } else {
        root.classList.remove('senior-mode');
        body.style.fontSize = '';
      }
    };

    // Initial apply
    applySettings();

    // Check periodically for changes (reacting to SettingsModal or System changes)
    const interval = setInterval(applySettings, 1000);
    
    // Listen for system preference changes if in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => applySettings();
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
