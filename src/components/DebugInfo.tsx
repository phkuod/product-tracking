import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';

export function DebugInfo() {
  const auth = useAuth();
  const app = useAppContext();

  // Only show debug info in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg max-w-xs">
      <div className="font-bold mb-2">Debug Info</div>
      <div>Auth Loading: {auth.isLoading ? '✅' : '❌'}</div>
      <div>Auth Authenticated: {auth.isAuthenticated ? '✅' : '❌'}</div>
      <div>Auth User: {auth.user?.username || 'None'}</div>
      <div>Auth Error: {auth.error || 'None'}</div>
      <div className="mt-2">
        <div>App Loading: {app.state.isLoading ? '✅' : '❌'}</div>
        <div>App Error: {app.state.error || 'None'}</div>
        <div>Products: {app.state.products.length}</div>
        <div>Routes: {app.state.routes.length}</div>
        <div>Stations: {app.state.stations.length}</div>
      </div>
      <div className="mt-2 text-gray-300">
        Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
      </div>
    </div>
  );
}