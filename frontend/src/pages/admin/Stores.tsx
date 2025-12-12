import React, { useEffect, useState, useCallback } from 'react';
import { storeService, userService } from '../../services';
import type { Store, User, PaginationInfo } from '../../types';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import '../../components/common/Common.css';

const Stores: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [availableOwners, setAvailableOwners] = useState<User[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
        page: 1,
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        ownerId: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formLoading, setFormLoading] = useState(false);

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

    const fetchAvailableOwners = async () => {
        try {
            const response = await userService.getUsers({ limit: 100 });
            // Filter users who don't already own a store
            const owners = response.users.filter(u => !u.store);
            setAvailableOwners(owners);
        } catch (error) {
            console.error('Failed to fetch owners:', error);
        }
    };

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
            [e.target.name]: e.target.value,
            page: 1,
        }));
    };

    const openModal = () => {
        fetchAvailableOwners();
        setShowModal(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (formData.name.length < 20) errors.name = 'Name must be at least 20 characters';
        if (formData.name.length > 60) errors.name = 'Name must not exceed 60 characters';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
        if (formData.address.length === 0) errors.address = 'Address is required';
        if (formData.address.length > 400) errors.address = 'Address must not exceed 400 characters';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setFormLoading(true);
        try {
            await storeService.createStore({
                name: formData.name,
                email: formData.email,
                address: formData.address,
                ownerId: formData.ownerId ? parseInt(formData.ownerId) : undefined,
            });
            setShowModal(false);
            setFormData({ name: '', email: '', address: '', ownerId: '' });
            fetchStores();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setFormErrors({ general: error.response?.data?.message || 'Failed to create store' });
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'address', label: 'Address', sortable: true },
        {
            key: 'averageRating',
            label: 'Rating',
            render: (store: Store) => (
                store.averageRating ? (
                    <span className="rating-display">
                        ⭐ {store.averageRating} ({store.totalRatings})
                    </span>
                ) : (
                    <span className="no-rating">No ratings yet</span>
                )
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Store Management</h1>
                    <p className="page-subtitle">Manage all stores on the platform</p>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    + Add Store
                </button>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by name or address..."
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Store" size="md">
                <form onSubmit={handleSubmit} className="auth-form">
                    {formErrors.general && <div className="auth-error">{formErrors.general}</div>}

                    <div className="form-group">
                        <label>Store Name (20-60 characters)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={formErrors.name ? 'error' : ''}
                        />
                        {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Store Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={formErrors.email ? 'error' : ''}
                        />
                        {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Address (max 400 characters)</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className={formErrors.address ? 'error' : ''}
                        />
                        {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                    </div>

                    <div className="form-group">
                        <label>Store Owner (Optional)</label>
                        <select
                            value={formData.ownerId}
                            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                        >
                            <option value="">No owner assigned</option>
                            {availableOwners.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.name} ({owner.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>
                        {formLoading ? 'Creating...' : 'Create Store'}
                    </button>
                </form>
            </Modal>

            <style>{`
        .rating-display {
          color: var(--accent);
          font-weight: 600;
        }
        .no-rating {
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
        </div>
    );
};

export default Stores;
