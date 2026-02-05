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
    data: data?.records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel()?.rows || [];

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 md:p-5">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="!border-b-0">
                  {headerGroup.headers.map((header, index, headerArray) => (
                    <TableHead
                      key={header.id}
                      className={`bg-gray-100 text-xs sm:text-sm px-3 py-3 ${
                        index === 0 ? "rounded-l-md" : ""
                      } ${
                        index + 1 === headerArray.length
                          ? "rounded-r-md"
                          : ""
                      }`}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                        minWidth: header.getSize(),
                      }}
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
                    {row.getVisibleCells().map(
                      (cell, index, cellArray) => (
                        <TableCell
                          key={cell.id}
                          className={`text-xs sm:text-sm px-3 py-3 ${
                            index === 0 ? "rounded-l-md" : ""
                          } ${
                            index + 1 === cellArray.length
                              ? "rounded-r-md"
                              : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs sm:text-sm"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-5 border-t">
        <Pagination
          totalPages={data.totalPages}
          totalRecords={data.totalRecords}
        />
      </div>
    </div>
  );
}