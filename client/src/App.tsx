import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Components/Home"
import Lobby from "./Components/Lobby"
import Match from "./Components/Match"
import Result from "./Components/Result"
import { UserProvider } from "./Components/Contexts/userContext"
import Login from "./Components/Login"
import SignupForm from "./Components/SignUpForm"
import PrivateLobby from "./Components/PrivateLobby"
import { ProtectedRoute } from "./Components/Contexts/ProtectedRoutes"
import { QuestionProvider } from "./Components/Contexts/questionContext"
import { TokenProvider } from "./Components/Contexts/tokenContext"
import Settings from "./Components/Settings"

import { useMemo } from "react";
import { createTheme } from "@mui/material";

import { ThemeProvider } from "@mui/material"
import { getDesignTokens } from "./Components/shared-theme/themePrimitives"

function App() {
  const theme = useMemo(() => createTheme(getDesignTokens("dark")), []);

  return (
    <UserProvider>
      <TokenProvider>
        <QuestionProvider>
          <BrowserRouter>
            <ThemeProvider theme={theme} >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/settings" element={<ProtectedRoute> <Settings /> </ProtectedRoute>} />
                <Route
                  path="/lobby"
                  element={
                    <ProtectedRoute>
                      <Lobby isPublic={true} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/lobby/:id" element={<ProtectedRoute> <Match /> </ProtectedRoute>} />
                <Route path="/privateLobby" element={<ProtectedRoute> <PrivateLobby /> </ProtectedRoute>} />
                <Route path="/privateLobby/:id" element={<ProtectedRoute> <Lobby isPublic={false} /> </ProtectedRoute>} />
                <Route path="/result/:id" element={<ProtectedRoute> <Result /> </ProtectedRoute>} />
              </Routes>
            </ThemeProvider>
          </BrowserRouter >
        </QuestionProvider>
      </TokenProvider>
    </UserProvider>
  )
}

export default App
