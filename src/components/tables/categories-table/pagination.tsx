"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGINATION_PER_PAGE } from "@/constants";
import { formatNumber } from "@/lib/utils";
import { PaginationProps } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ totalPages, totalRecords }: PaginationProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page && (page = "1");

  const handleNext = () => {
    const nextPage = parseInt(page as string) + 1;
    params.set("page", nextPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePrev = () => {
    const prevPage = parseInt(page as string) - 1;
    params.set("page", prevPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (limit: string) => {
    params.set("limit", limit);
    replace(`${pathname}?${params.toString()}`);
  };

  const currentPage = parseInt(page as string);
  const startRecord = (currentPage - 1) * parseInt(limit) + 1;
  const endRecord = Math.min(currentPage * parseInt(limit), totalRecords);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Records Info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{startRecord}</span> to{" "}
        <span className="font-semibold">{endRecord}</span> of{" "}
        <span className="font-semibold">{formatNumber(totalRecords)}</span> records
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Rows per page:</span>
          <Select
            value={limit}
            onValueChange={(value) => {
              handleLimitChange(value);
            }}
          >
            <SelectTrigger className="w-20 sm:w-[130px] h-9 sm:h-10">
              <SelectValue placeholder={`${PAGINATION_PER_PAGE[0]}`} />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION_PER_PAGE.map((number, index: number) => (
                <SelectItem key={index} value={number.toString()}>
                  {number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block text-sm text-gray-600 mr-2">
            Page {currentPage} of {totalPages}
          </div>

          <div className="border border-gray-300 h-9 sm:h-10 px-2 sm:px-3 rounded-md flex items-center justify-center">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="p-1.5 sm:p-2 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="mx-2 text-sm font-medium">
              <span className="sm:hidden">{currentPage}</span>
              <span className="hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="p-1.5 sm:p-2 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;