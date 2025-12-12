import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Navbar: React.FC = () => {
    const { user, logout, isAdmin, isUser, isStoreOwner } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <span className="logo-icon">⭐</span>
                    <span className="logo-text">StoreReviewer</span>
                </Link>
            </div>

            <div className="navbar-menu">
                {isAdmin && (
                    <>
                        <Link to="/admin" className="nav-link">Dashboard</Link>
                        <Link to="/admin/users" className="nav-link">Users</Link>
                        <Link to="/admin/stores" className="nav-link">Stores</Link>
                    </>
                )}
                {isUser && (
                    <>
                        <Link to="/user" className="nav-link">Stores</Link>
                        <Link to="/user/password" className="nav-link">Settings</Link>
                    </>
                )}
                {isStoreOwner && (
                    <>
                        <Link to="/owner" className="nav-link">Dashboard</Link>
                        <Link to="/owner/password" className="nav-link">Settings</Link>
                    </>
                )}
            </div>

            <div className="navbar-end">
                {user && (
                    <>
                        <span className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role.replace('_', ' ')}</span>
                        </span>
                        <button onClick={handleLogout} className="btn btn-logout">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
