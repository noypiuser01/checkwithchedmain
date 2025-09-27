import { useState, useMemo, useCallback, useEffect } from 'react';

export function usePagination(data, pageSize) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        if (pageSize === 'all') {
            return data;
        }
        
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, pageSize]);

    const totalItems = data.length;
    const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalItems / pageSize);
    const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * pageSize;
    const endIndex = pageSize === 'all' ? totalItems : Math.min(startIndex + pageSize, totalItems);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handlePreviousPage = useCallback(() => {
        setCurrentPage(prev => prev > 1 ? prev - 1 : prev);
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage(prev => prev < totalPages ? prev + 1 : prev);
    }, [totalPages]);

    // Reset to first page when data changes
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Reset to first page when data length changes significantly
    useEffect(() => {
        const newTotalPages = pageSize === 'all' ? 1 : Math.ceil(data.length / pageSize);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [data.length, pageSize, currentPage]);

    return {
        currentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        paginatedData,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
        resetPagination
    };
}
