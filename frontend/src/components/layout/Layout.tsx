import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
    requireAuth?: boolean;
    allowedRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ requireAuth = true, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'USER') return <Navigate to="/user" replace />;
        if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
    }

    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <p>&copy; 2024 StoreReviewer. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
