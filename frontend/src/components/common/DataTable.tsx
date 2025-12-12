import React from 'react';
import './Common.css';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (key: string) => void;
    loading?: boolean;
    emptyMessage?: string;
}

function DataTable<T extends { id: number }>({
    columns,
    data,
    sortBy,
    sortOrder,
    onSort,
    loading = false,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    const handleSort = (key: string, sortable?: boolean) => {
        if (sortable && onSort) {
            onSort(key);
        }
    };

    if (loading) {
        return (
            <div className="table-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={col.sortable ? 'sortable' : ''}
                                onClick={() => handleSort(col.key, col.sortable)}
                            >
                                <span className="th-content">
                                    {col.label}
                                    {col.sortable && (
                                        <span className="sort-icon">
                                            {sortBy === col.key ? (
                                                sortOrder === 'asc' ? '↑' : '↓'
                                            ) : '↕'}
                                        </span>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="empty-message">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id}>
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`}>
                                        {col.render
                                            ? col.render(item)
                                            : (item as Record<string, unknown>)[col.key]?.toString() || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
