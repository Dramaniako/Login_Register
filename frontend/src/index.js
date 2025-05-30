import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for createRoot
import App from './App';
import "bulma/css/bulma.css";
import axios from "axios";

axios.defaults.withCredentials = true; // This line is fine where it is

// 1. Get the root DOM element
const container = document.getElementById('root');

// 2. Create a root using the ReactDOM from 'react-dom/client'
const root = ReactDOM.createRoot(container);

// 3. Render your App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);