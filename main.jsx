import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Force dark theme for the entire app by adding the Tailwind "dark" class to <html>
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
