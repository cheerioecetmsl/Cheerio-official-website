"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 4;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always include page 1
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        pages.push(2, 3, 4);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push("...");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mt-12 py-8">
      {/* Previous Arrow */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 md:p-3 rounded-full bg-gold-soft/10 text-gold-primary hover:bg-gold-soft/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 md:gap-2">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`
              w-8 h-8 md:w-10 md:h-10 rounded-full text-[10px] md:text-xs font-bold transition-all
              ${page === currentPage 
                ? "bg-gold-primary text-black shadow-lg shadow-gold-soft/20 scale-110" 
                : page === "..." 
                  ? "text-brown-secondary/40 cursor-default" 
                  : "text-brown-secondary hover:bg-gold-soft/20 hover:text-gold-primary"
              }
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Arrow */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 md:p-3 rounded-full bg-gold-soft/10 text-gold-primary hover:bg-gold-soft/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
