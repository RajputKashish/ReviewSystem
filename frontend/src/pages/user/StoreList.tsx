import React, { useEffect, useState, useCallback } from 'react';
import { storeService, ratingService } from '../../services';
import type { Store, PaginationInfo } from '../../types';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import '../../components/common/Common.css';
import './User.css';

const StoreList: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [ratingLoading, setRatingLoading] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
        page: 1,
    });

    const fetchStores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await storeService.getStores({
                search: filters.search || undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: 10,
            });
            setStores(response.stores);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleSort = (key: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: key,
            sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({
            ...prev,
            search: e.target.value,
            page: 1,
        }));
    };

    const handleRating = async (storeId: number, rating: number, hasExisting: boolean) => {
        setRatingLoading(storeId);
        try {
            if (hasExisting) {
                await ratingService.updateRating(storeId, { rating });
            } else {
                await ratingService.submitRating({ storeId, rating });
            }
            fetchStores();
        } catch (error) {
            console.error('Failed to submit rating:', error);
        } finally {
            setRatingLoading(null);
        }
    };

    const columns = [
        { key: 'name', label: 'Store Name', sortable: true },
        { key: 'address', label: 'Address', sortable: true },
        {
            key: 'averageRating',
            label: 'Overall Rating',
            render: (store: Store) => (
                <div className="overall-rating">
                    {store.averageRating ? (
                        <>
                            <StarRating value={parseFloat(store.averageRating)} readonly size="sm" />
                            <span className="rating-value">{store.averageRating}</span>
                            <span className="rating-count">({store.totalRatings} reviews)</span>
                        </>
                    ) : (
                        <span className="no-rating">No ratings yet</span>
                    )}
                </div>
            ),
        },
        {
            key: 'userRating',
            label: 'Your Rating',
            render: (store: Store) => (
                <div className="user-rating">
                    {store.userRating ? (
                        <span className="your-score">⭐ {store.userRating}</span>
                    ) : (
                        <span className="not-rated">Not rated</span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Rate Store',
            render: (store: Store) => (
                <div className="rating-action">
                    {ratingLoading === store.id ? (
                        <span className="rating-loading">Saving...</span>
                    ) : (
                        <StarRating
                            value={store.userRating || 0}
                            onChange={(rating) => handleRating(store.id, rating, !!store.userRating)}
                            size="md"
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Browse Stores</h1>
                    <p className="page-subtitle">Discover and rate your favorite stores</p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group" style={{ flex: 1 }}>
                    <label>Search Stores</label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by store name or address..."
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={stores}
                loading={loading}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSort={handleSort}
                emptyMessage="No stores found"
            />

            {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </button>
                    <span>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default StoreList;
