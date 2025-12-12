import React, { useEffect, useState } from 'react';
import { storeService } from '../../services';
import type { Rating } from '../../types';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import '../../components/common/Common.css';
import '../user/User.css';

interface StoreData {
    id: number;
    name: string;
    email: string;
    address: string;
    averageRating: string | null;
    totalRatings: number;
    ratings: Rating[];
}

const OwnerDashboard: React.FC = () => {
    const [store, setStore] = useState<StoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyStore();
    }, []);

    const fetchMyStore = async () => {
        try {
            const response = await storeService.getMyStore();
            setStore(response.store as unknown as StoreData);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading your store...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h2>⚠️ {error}</h2>
                    <p>Please contact an administrator if you believe this is an error.</p>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h2>No store found</h2>
                    <p>You don't appear to own a store. Please contact an administrator.</p>
                </div>
            </div>
        );
    }

    const columns = [
        {
            key: 'user',
            label: 'Customer Name',
            render: (rating: Rating) => rating.user?.name || 'Unknown',
        },
        {
            key: 'email',
            label: 'Customer Email',
            render: (rating: Rating) => rating.user?.email || '-',
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (rating: Rating) => (
                <div className="rating-display">
                    <StarRating value={rating.rating} readonly size="sm" />
                    <span className="rating-number">{rating.rating}/5</span>
                </div>
            ),
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (rating: Rating) => new Date(rating.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{store.name}</h1>
                    <p className="page-subtitle">Store Owner Dashboard</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">⭐</div>
                    <div className="stat-card-value">
                        {store.averageRating || 'N/A'}
                    </div>
                    <div className="stat-card-label">Average Rating</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">📝</div>
                    <div className="stat-card-value">{store.totalRatings}</div>
                    <div className="stat-card-label">Total Reviews</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">📍</div>
                    <div className="stat-card-value" style={{ fontSize: '1rem' }}>
                        {store.address.substring(0, 50)}...
                    </div>
                    <div className="stat-card-label">Store Location</div>
                </div>
            </div>

            <div className="section-header">
                <h2>Customer Ratings</h2>
            </div>

            <DataTable
                columns={columns}
                data={store.ratings.map((r, i) => ({ ...r, id: r.id || i }))}
                emptyMessage="No ratings yet"
            />

            <style>{`
        .error-container {
          display: flex;
          justify-content: center;
          padding: 4rem 2rem;
        }
        .error-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: var(--radius-lg);
          text-align: center;
          border: 1px solid var(--border);
        }
        .error-card h2 {
          color: var(--text-primary);
          margin: 0 0 1rem;
        }
        .error-card p {
          color: var(--text-secondary);
          margin: 0;
        }
        .section-header {
          margin: 2rem 0 1rem;
        }
        .section-header h2 {
          color: var(--text-primary);
          font-size: 1.25rem;
          margin: 0;
        }
        .rating-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .rating-number {
          color: var(--accent);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
};

export default OwnerDashboard;
