import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/components/button.css'
import './styles/components/topbar.css'
import App from './App.jsx'

// Finds the root div in index.html and mounts the React app inside it.
createRoot(document.getElementById('root')).render(
  // StrictMode helps React warn about possible issues during development.
  <StrictMode>
    <App />
  </StrictMode>,
)
