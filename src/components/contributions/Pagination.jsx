import { useState } from "react";

export default function Pagination({
  totalItems = 18,
  itemsPerPageDefault = 10,
  currentPageDefault = 1,
}) {
  const [page, setPage] = useState(currentPageDefault);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPageDefault);

  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  return (
    <div className="bg-white border border-t-0 border-gray-100 rounded-b-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4">
      <p className="text-[13px] text-gray-500">
        Showing {start} to {end} of {totalItems} transactions
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-lg border text-[13px] font-semibold transition-colors
              ${p === page
                ? "border-[#1a2a5e] text-[#1a2a5e] bg-[#eef1f9]"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] text-gray-500">Rows per page</span>
        <div className="relative">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-[13px] font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/10 cursor-pointer"
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
