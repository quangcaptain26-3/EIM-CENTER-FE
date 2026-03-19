import { useState, useCallback } from 'react';

export interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
}

/**
 * Hook hỗ trợ phân trang cơ bản
 */
export const usePagination = ({ initialPage = 1, initialLimit = 10 }: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const offset = (page - 1) * limit;

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset về trang 1 khi đổi số lượng hiển thị
  }, []);

  return {
    page,
    limit,
    offset,
    setPage: onPageChange,
    setLimit: onLimitChange,
  };
};
