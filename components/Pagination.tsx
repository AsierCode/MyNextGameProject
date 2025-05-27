import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5; 
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - Math.floor(maxPagesToShow / 2);
      endPage = currentPage + Math.floor(maxPagesToShow / 2);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const commonButtonClasses = "px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:ring-offset-2 focus:ring-offset-slate-900";
  const activeClasses = "bg-fuchsia-600 text-white";
  const inactiveClasses = "bg-slate-700 hover:bg-slate-600 text-slate-200";
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700";


  return (
    <nav className="flex justify-center items-center space-x-1 sm:space-x-2 my-8" aria-label="Game list pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${commonButtonClasses} ${inactiveClasses} ${disabledClasses}`}
        aria-label="Go to previous page"
      >
        Prev
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`${commonButtonClasses} ${inactiveClasses}`}
            aria-label="Go to page 1"
          >
            1
          </button>
          {startPage > 2 && <span className="text-slate-400 px-1" aria-hidden="true">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`${commonButtonClasses} ${
            currentPage === number 
            ? activeClasses 
            : inactiveClasses
          }`}
          aria-label={`Go to page ${number}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages -1 && <span className="text-slate-400 px-1" aria-hidden="true">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`${commonButtonClasses} ${inactiveClasses}`}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${commonButtonClasses} ${inactiveClasses} ${disabledClasses}`}
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;