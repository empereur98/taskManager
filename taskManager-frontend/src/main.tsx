import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Nettoyage préventif de tout ancien mock dans le navigateur
localStorage.removeItem('task_manager_mock_tasks');
localStorage.removeItem('task_manager_mock_users');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
