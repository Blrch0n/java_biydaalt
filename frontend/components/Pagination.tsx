import React from "react";

type PaginationProps = {
  pageNo: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ pageNo, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(pageNo - 1)}
          disabled={pageNo === 0}
          className="relative inline-flex items-center rounded-md border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pageNo + 1)}
          disabled={pageNo >= totalPages - 1}
          className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-300">
            Showing page <span className="font-bold text-white">{pageNo + 1}</span> of{" "}
            <span className="font-bold text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(pageNo - 1)}
              disabled={pageNo === 0}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 font-bold text-slate-400 border border-white/10 hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              &larr; Өмнөх
            </button>
            <button
              onClick={() => onPageChange(pageNo + 1)}
              disabled={pageNo >= totalPages - 1}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 font-bold text-slate-400 border border-white/10 border-l-0 hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              Дараах &rarr;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
