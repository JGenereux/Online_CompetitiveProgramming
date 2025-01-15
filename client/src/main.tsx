import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { GoogleOAuthProvider } from "@react-oauth/google"

const theme = createTheme();

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='471891001707-ae6digu6r35rreiop75toneq49iskhfc.apps.googleusercontent.com'>
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StrictMode >
  </GoogleOAuthProvider>
)
