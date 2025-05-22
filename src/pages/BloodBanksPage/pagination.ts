// Define pagination response interface
export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Extract results array from a paginated response or return empty array
export function getResultsFromPaginatedResponse<T>(data: PaginatedResponse<T> | undefined): T[] {
  return data?.results || [];
}

// Extract pagination information
export function getPaginationInfo(data: PaginatedResponse<any> | undefined) {
  return {
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 0,
    totalResults: data?.totalResults || 0,
    limit: data?.limit || 10,
    hasNextPage: data ? data.page < data.totalPages : false,
    hasPreviousPage: data ? data.page > 1 : false
  };
}

// Generate page numbers for pagination
export function getPageNumbers(currentPage: number, totalPages: number, maxVisiblePages = 5): number[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Calculate start and end page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  
  // Adjust if end page exceeds total pages
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
}
