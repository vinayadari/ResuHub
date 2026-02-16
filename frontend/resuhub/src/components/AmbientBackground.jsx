import React from 'react';

const AmbientBackground = () => {
    return (
        <>
            <div className="mesh-bg">
                <div className="mesh-orb" />
            </div>
            <div className="particles">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>
        </>
    );
};

export default AmbientBackground;
