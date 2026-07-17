// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './pages/DashboardLayout';
import { WorkspaceDetail } from './pages/WorkspacePage';
import { ProjectDetail } from './pages/ProjectDetailPage'; // Ensure you have/create this view page
import { InviteMember } from './pages/ProjectInvitation';
import { ProfilePage } from './pages/Profile';
import { AcceptInvitation } from './pages/AcceptInvitation';
import { SignupInvitation } from './pages/SignupInvitation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
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

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Account & Core Landing */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Workspace Management Ecosystem */}
      <Route
        path="/workspaces/:workspaceId"
        element={
          <ProtectedRoute>
            <WorkspaceDetail />
          </ProtectedRoute>
        }
      />

      {/* Individual Project Dashboard View */}
      <Route
        path="/workspaces/:workspaceId/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* Project Task / Member Assignments */}
      <Route
        path="/workspaces/:workspaceId/invite"
        element={<ProtectedRoute>
          <InviteMember />
        </ProtectedRoute>}
      />
      <Route path="/accept-invitation/:token" element={
        <AcceptInvitation />
      }
      />
      <Route path="/signup-invitation/:token" element={
        <SignupInvitation />
      } />

      {/* Catch-all Routing Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}