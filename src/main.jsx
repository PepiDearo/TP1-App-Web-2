import React from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import App from './App.jsx';
import 'bulma/css/bulma.min.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);