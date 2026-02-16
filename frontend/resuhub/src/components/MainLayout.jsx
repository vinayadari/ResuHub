import React from 'react';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';

const MainLayout = () => {
    return (
        <div className="min-h-screen text-white relative">
            <AmbientBackground />
            <div className="relative z-10 w-full">
                <Navigation />
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
