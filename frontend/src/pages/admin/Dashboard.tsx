import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services';
import type { DashboardStats } from '../../types';
import '../../components/common/Common.css';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardService.getStats();
            setStats(response.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">System overview and statistics</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">👥</div>
                    <div className="stat-card-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-card-label">Total Users</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">🏪</div>
                    <div className="stat-card-value">{stats?.totalStores || 0}</div>
                    <div className="stat-card-label">Total Stores</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">⭐</div>
                    <div className="stat-card-value">{stats?.totalRatings || 0}</div>
                    <div className="stat-card-label">Total Ratings</div>
                </div>
            </div>

            <div className="dashboard-info">
                <div className="info-card">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <a href="/admin/users" className="action-btn">
                            <span className="action-icon">➕</span>
                            <span>Add New User</span>
                        </a>
                        <a href="/admin/stores" className="action-btn">
                            <span className="action-icon">🏪</span>
                            <span>Add New Store</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
