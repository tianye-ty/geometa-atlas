import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import 'leaflet/dist/leaflet.css'
import App from './CleanApp'
import './clean.css'
import './minimal.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
