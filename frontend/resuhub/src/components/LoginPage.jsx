import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AmbientBackground from './AmbientBackground';

const LoginPage = () => {
    const { user, loading, signInWithGoogle } = useAuth();
    const [signingIn, setSigningIn] = useState(false);

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

    if (user) return <Navigate to="/" replace />;

    const handleGoogleLogin = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Login error:', err);
            setSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <AmbientBackground />
            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" style={{ animation: 'pulseDot 3s ease-in-out infinite' }} />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold gradient-text-animated tracking-tight">ResuHub</h1>
                    <p className="text-slate-500 text-sm mt-1">Resume Intelligence Platform</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-extrabold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400 text-sm">Sign in to manage your resumes</p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={signingIn}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-wait bg-white text-gray-800 hover:bg-gray-100"
                    >
                        {signingIn ? (
                            <>
                                <span className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-slate-600 text-xs">By signing in, you agree to our Terms of Service</p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">© 2026 ResuHub. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;
