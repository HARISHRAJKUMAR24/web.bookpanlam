"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Pagination from "./pagination";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: {
    totalPages: number;
    totalRecords: number;
    records: TData[];
  };
  isLimitReached?: boolean;
  currentCount?: number;
  limitCount?: number;
  excessRecords?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLimitReached = false,
  currentCount = 0,
  limitCount = 0,
  excessRecords = 0,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data.records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Check if there are any blurred rows
  const hasBlurredRows = isLimitReached && excessRecords > 0;
  const blurredRowsCount = hasBlurredRows ? excessRecords : 0;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-medium text-gray-800 text-sm sm:text-base">All Customers</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Showing {data.records.length} customer(s)
            </p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative">
        {/* Single Overlay for ALL blurred rows */}
        {hasBlurredRows && (
          <div className="absolute top-3 left-0 right-0 z-20 flex justify-center pointer-events-none px-3">
            {/* <div className="flex flex-col items-center text-center gap-3 p-4 sm:p-5 
      bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-sm 
      rounded-xl border border-amber-300 shadow-lg 
      w-full max-w-xl"
            >


            </div> */}
          </div>
        )}

        {/* Add responsive padding top for overlay */}
        <div className={cn(
          "pt-0",
          hasBlurredRows && "pt-16 sm:pt-20" // Responsive padding
        )}>
          <Table className="min-w-[800px] sm:min-w-0"> {/* Minimum width for mobile scrolling */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                  {headerGroup.headers.map((header, key, row) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "font-semibold text-gray-700 text-xs sm:text-sm py-2 sm:py-3",
                        "px-2 sm:px-4", // Responsive padding
                        key === 0 ? "rounded-tl-lg" : "",
                        key + 1 === row.length ? "rounded-tr-lg" : ""
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {(table.getRowModel().rows || []).length > 0 ? (
                table.getRowModel().rows.map((row, index) => {
                  // Determine if this row should be blurred
                  const shouldBlur = isLimitReached &&
                    limitCount > 0 &&
                    limitCount !== Infinity &&
                    index < excessRecords;

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "hover:bg-gray-50 border-b border-gray-100 last:border-0 relative",
                        shouldBlur && "bg-gray-100/50 cursor-not-allowed select-none"
                      )}
                      style={
                        shouldBlur ? {
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          userSelect: 'none',
                        } : {}
                      }
                      onDragStart={shouldBlur ? (e) => e.preventDefault() : undefined}
                      onCopy={shouldBlur ? (e) => e.preventDefault() : undefined}
                    >
                      {row.getVisibleCells().map((cell, key, rowArr) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-2 sm:py-3 px-2 sm:px-4", // Responsive padding
                            key === 0 ? "rounded-l-lg" : "",
                            key + 1 === rowArr.length ? "rounded-r-lg" : "",
                            shouldBlur && "opacity-40 blur-sm" // Reduced opacity + blur effect
                          )}
                          style={
                            shouldBlur ? {
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none',
                              userSelect: 'none',
                            } : {}
                          }
                        >
                          {/* Special handling for phone and email columns */}
                          {(() => {
                            const cellValue = flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            );

                            // If cell should be blurred AND contains phone/email, show placeholder
                            if (shouldBlur) {
                              // Check column header to identify phone/email columns
                              const columnHeader = cell.column.columnDef.header;
                              const headerText = typeof columnHeader === 'string'
                                ? columnHeader.toLowerCase()
                                : '';

                              // Hide phone numbers
                              if (headerText.includes('phone') || headerText.includes('mobile')) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 sm:w-20 h-3 sm:h-4 bg-gray-300/50 rounded"></div>
                                    <div className="w-8 sm:w-16 h-3 sm:h-4 bg-gray-300/50 rounded"></div>
                                  </div>
                                );
                              }

                              // Hide emails
                              if (headerText.includes('email')) {
                                return (
                                  <div className="w-20 sm:w-32 h-3 sm:h-4 bg-gray-300/50 rounded"></div>
                                );
                              }
                            }

                            return cellValue;
                          })()}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 sm:h-24 text-center text-gray-500 text-sm"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t">
        <Pagination
          totalPages={data.totalPages}
          totalRecords={data.totalRecords}
          isLimitReached={isLimitReached}
        />
      </div>
    </div>
  );
}