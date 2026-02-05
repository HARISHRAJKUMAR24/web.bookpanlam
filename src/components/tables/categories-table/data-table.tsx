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
  const table = useReactTable({
    data: data?.records || [], // safe fallback
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel()?.rows || [];

  return (
    <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden border">
      <div className="p-3 sm:p-5 overflow-x-auto">
        <Table className="min-w-[800px] sm:min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="!border-b-0">
                {headerGroup.headers.map((header, key, headerArray) => (
                  <TableHead
                    key={header.id}
                    className={`
                      bg-gray-100 text-xs sm:text-sm font-semibold py-2 sm:py-3 px-2 sm:px-4
                      ${key === 0 ? "rounded-l-md" : ""}
                      ${key + 1 === headerArray.length ? "rounded-r-md" : ""}
                    `}
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
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell, key, cellArray) => (
                    <TableCell
                      key={cell.id}
                      className={`
                        py-2 sm:py-3 px-2 sm:px-4
                        ${key === 0 ? "rounded-l-md" : ""}
                        ${key + 1 === cellArray.length ? "rounded-r-md" : ""}
                      `}
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
                  className="h-20 sm:h-24 text-center text-gray-500 text-sm"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-3 sm:p-5 border-t">
        <Pagination
          totalPages={data.totalPages}
          totalRecords={data.totalRecords}
        />
      </div>
    </div>
  );
}