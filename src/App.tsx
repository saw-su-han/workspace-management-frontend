// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './pages/DashboardLayout'; // ⚡ Imported your complete workspace dashboard
import { ThemeToggle } from './Components/ThemeToggle';
import { WorkspaceDetail } from './pages/WorkspacePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f3f6f9] dark:bg-[#0b121f] text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xl animate-pulse text-sky-600 dark:text-sky-400 font-sans">≈</span>
          Synchronizing Workspace...
        </div>
      </div>
    );
  }

  if (!token || !user) {
    // return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>


      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId"
          element={
            <ProtectedRoute>
              <WorkspaceDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;