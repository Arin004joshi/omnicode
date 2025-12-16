import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your context and components
import { AuthProvider, useAuth } from './context/AuthContext';
import Signup from './pages/Signup';
import LoginPage from './pages/LoginPage';
import ChatInterface from './pages/ChatInterface'; // Now importing the full component

// --- Private Route Component ---
// This ensures that only logged-in users can access the chat interface
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show a basic loading screen while checking auth status
    return <h1>Loading Authentication Status...</h1>;
  }

  // If a user is logged in, show the requested page (children)
  return currentUser ? children : <Navigate to="/login" />;
}

// --- Main App Component ---
function App() {
  return (
    // 1. Wrap the entire app in the AuthProvider
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes: Accessible to everyone */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Private Route: Accessible only when logged in */}
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatInterface />
                </PrivateRoute>
              }
            />

            {/* Default Route: Redirects unauthenticated users to login, 
                                and authenticated users to the chat */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/chat" />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;