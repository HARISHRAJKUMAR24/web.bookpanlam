"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "./pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: {
    totalPages: number;
    totalRecords: number;
    records: TData[];
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isMobile, setIsMobile] = useState(false);
  const safeRecords = Array.isArray(data.records) ? data.records : [];

  // Check screen size for responsive adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const table = useReactTable({
    data: safeRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows ?? [];

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 overflow-x-auto">
        {/* Remove the fixed min-width and let it be responsive */}
        <div className={isMobile ? "min-w-max" : "w-full"}>
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="!border-b-0">
                  {headerGroup.headers.map((header, key, row) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`bg-gray-100 whitespace-nowrap ${key === 0 ? "rounded-l-md" : ""
                          } ${key + 1 === row.length ? "rounded-r-md" : ""}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell, key, rowArr) => (
                      <TableCell
                        key={cell.id}
                        className={`whitespace-nowrap py-3 sm:py-4 ${key === 0 ? "rounded-l-md" : ""
                          } ${key + 1 === rowArr.length ? "rounded-r-md" : ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-4 sm:p-5 border-t">
        <Pagination
          totalPages={data.totalPages}
          totalRecords={data.totalRecords}
        />
      </div>
    </div>
  );
}