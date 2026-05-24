"use client";

import { useMemo, useState } from "react";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function usePagination<T>(items: T[], pageSize = 10) {
  const [rawPage, setRawPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(rawPage, pageCount);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, pageCount, pageItems, pageSize, setPage: setRawPage };
}

export function PaginationControls({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  if (totalItems <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        Страница {page} от {pageCount} · Общо {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-all hover:-translate-y-px hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          Назад
        </button>
        <button
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-all hover:-translate-y-px hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Напред
        </button>
      </div>
    </div>
  );
}
