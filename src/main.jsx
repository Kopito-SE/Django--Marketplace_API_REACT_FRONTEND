// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

// Create a client with optimal settings for your Django backend
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
      retry: 1,                  // Only retry once if fails
      refetchOnWindowFocus: false, // Don't refetch when tab refocuses
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="15201590657-fl68ek84i4a10vhaobnf08tvn6qltnjd.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)