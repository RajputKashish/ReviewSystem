import React, { useEffect, useState, useCallback } from 'react';
import { userService } from '../../services';
import type { User, PaginationInfo } from '../../types';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import '../../components/common/Common.css';

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
        page: 1,
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formLoading, setFormLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await userService.getUsers({
                search: filters.search || undefined,
                role: filters.role || undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                page: filters.page,
                limit: 10,
            });
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSort = (key: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: key,
            sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            page: 1,
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (formData.name.length < 20) errors.name = 'Name must be at least 20 characters';
        if (formData.name.length > 60) errors.name = 'Name must not exceed 60 characters';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
        if (formData.password.length < 8 || formData.password.length > 16) {
            errors.password = 'Password must be 8-16 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            errors.password = 'Password must contain uppercase letter';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
            errors.password = 'Password must contain special character';
        }
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
            await userService.createUser(formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', address: '', role: 'USER' });
            fetchUsers();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setFormErrors({ general: error.response?.data?.message || 'Failed to create user' });
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'address', label: 'Address', sortable: true },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user: User) => (
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (user: User) => (
                user.store?.averageRating ? `⭐ ${user.store.averageRating}` : '-'
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage all users on the platform</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add User
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
                        placeholder="Search by name, email, address..."
                    />
                </div>
                <div className="filter-group">
                    <label>Role</label>
                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                        <option value="STORE_OWNER">Store Owner</option>
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSort={handleSort}
                emptyMessage="No users found"
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User" size="md">
                <form onSubmit={handleSubmit} className="auth-form">
                    {formErrors.general && <div className="auth-error">{formErrors.general}</div>}

                    <div className="form-group">
                        <label>Name (20-60 characters)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={formErrors.name ? 'error' : ''}
                        />
                        {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={formErrors.email ? 'error' : ''}
                        />
                        {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password (8-16 chars, 1 uppercase, 1 special)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={formErrors.password ? 'error' : ''}
                        />
                        {formErrors.password && <span className="error-message">{formErrors.password}</span>}
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
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="USER">Normal User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="STORE_OWNER">Store Owner</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>
                        {formLoading ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </Modal>

            <style>{`
        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .role-admin { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .role-user { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        .role-store_owner { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
      `}</style>
        </div>
    );
};

export default Users;
