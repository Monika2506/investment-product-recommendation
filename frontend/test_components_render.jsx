import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

global.localStorage = {
  getItem: (key) => key === 'investiq_token' ? 'mock-token' : null,
  setItem: () => {},
  removeItem: () => {},
};

import { ToastProvider } from './src/context/ToastContext.jsx';
import { AuthProvider } from './src/context/AuthContext.jsx';

import Navbar from './src/components/Navbar.jsx';
import Sidebar from './src/components/Sidebar.jsx';
import Footer from './src/components/Footer.jsx';
import StatCard from './src/components/StatCard.jsx';
import SecurityShieldBadge from './src/components/SecurityShieldBadge.jsx';
import ThreatMeter from './src/components/ThreatMeter.jsx';
import Modal from './src/components/Modal.jsx';
import SkeletonLoader from './src/components/SkeletonLoader.jsx';
import ProtectedRoute from './src/components/ProtectedRoute.jsx';
import AppLayout from './src/layouts/AppLayout.jsx';

const components = [
  ['Navbar', () => React.createElement(Navbar, { onToggleSidebar: () => {}, isSidebarCollapsed: false })],
  ['Sidebar', () => React.createElement(Sidebar, { isCollapsed: false, onToggle: () => {} })],
  ['Footer', () => React.createElement(Footer)],
  ['StatCard', () => React.createElement(StatCard, { title: 'Test', value: '100' })],
  ['SecurityShieldBadge', () => React.createElement(SecurityShieldBadge)],
  ['ThreatMeter', () => React.createElement(ThreatMeter)],
  ['SkeletonLoader', () => React.createElement(SkeletonLoader)],
  ['AppLayout', () => React.createElement(AppLayout)],
];

console.log('Testing components render...');
for (const [name, fn] of components) {
  try {
    const html = renderToString(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(MemoryRouter, null, fn())
        )
      )
    );
    console.log(`[PASS] ${name}: ${html.length} bytes`);
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err);
  }
}
