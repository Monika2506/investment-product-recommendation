import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

global.localStorage = {
  getItem: (key) => {
    if (key === 'investiq_token') return 'mock-jwt-token';
    if (key === 'investiq_user') return JSON.stringify({ id: 1, full_name: 'Alex Vance', email: 'user@investiq.local', role: 'user' });
    return null;
  },
  setItem: () => {},
  removeItem: () => {},
};

import { ToastProvider } from './src/context/ToastContext.jsx';
import { AuthProvider } from './src/context/AuthContext.jsx';
import AppLayout from './src/layouts/AppLayout.jsx';
import UserDashboard from './src/pages/UserDashboard.jsx';

console.log('Testing render of AppLayout with UserDashboard...');

try {
  const html = renderToString(
    React.createElement(
      ToastProvider,
      null,
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/dashboard'] },
          React.createElement(
            Routes,
            null,
            React.createElement(
              Route,
              { element: React.createElement(AppLayout) },
              React.createElement(Route, { path: '/dashboard', element: React.createElement(UserDashboard) })
            )
          )
        )
      )
    )
  );
  console.log('[SUCCESS] Rendered dashboard layout! Length:', html.length);
  console.log('Preview:', html.substring(0, 300));
} catch (err) {
  console.error('[ERROR IN DASHBOARD RENDER]:', err);
}
