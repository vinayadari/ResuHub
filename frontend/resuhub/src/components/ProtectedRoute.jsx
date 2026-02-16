import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AmbientBackground />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <span className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;
