"use client";

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  // Server-side pagination
  serverPagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  // Client-side search
  onSearch?: (query: string) => void;
  searchValue?: string;
}

function DataTableComponent<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Ara...",
  searchKey,
  onRowClick,
  actions,
  emptyMessage = "Veri bulunamadi",
  loading = false,
  serverPagination,
  onSearch,
  searchValue: externalSearchValue,
}: DataTableProps<T>) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const searchValue = externalSearchValue ?? internalSearchValue;
  const setSearchValue = onSearch ?? setInternalSearchValue;

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDirection("asc");
      return key;
    });
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Client-side search (only if no external search handler)
    if (!onSearch && debouncedSearch && searchKey) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter((item) => {
        const value = item[searchKey];
        return String(value).toLowerCase().includes(query);
      });
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortKey];
        const bValue = (b as Record<string, unknown>)[sortKey];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, debouncedSearch, searchKey, sortKey, sortDirection, onSearch]);

  const totalPages = serverPagination
    ? Math.ceil(serverPagination.total / serverPagination.pageSize)
    : 1;
  const currentPage = serverPagination?.page ?? 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:text-gray-700",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortKey === column.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Islemler
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("px-6 py-4 text-sm text-gray-900", column.className)}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[String(column.key)] ?? "-")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div onClick={(e) => e.stopPropagation()}>{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          filteredAndSortedData.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 space-y-2",
                onRowClick && "cursor-pointer hover:bg-gray-50"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns
                .filter((c) => !c.mobileHidden)
                .map((column) => (
                  <div key={String(column.key)} className="flex justify-between text-sm">
                    <span className="text-gray-500">{column.label}</span>
                    <span className="text-gray-900 font-medium">
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[String(column.key)] ?? "-")}
                    </span>
                  </div>
                ))}
              {actions && (
                <div
                  className="pt-2 flex justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actions(item)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {serverPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Toplam {serverPagination.total} kayit
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => serverPagination.onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Onceki
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => serverPagination.onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
