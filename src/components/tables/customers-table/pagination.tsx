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

interface PaginationComponentProps extends PaginationProps {
  isLimitReached?: boolean;
}

const Pagination = ({ 
  totalPages, 
  totalRecords,
  isLimitReached = false 
}: PaginationComponentProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page && (page = "1");

  // When click on next button
  const handleNext = () => {
    if (isLimitReached) return;
    
    const nextPage = parseInt(page as string) + 1;

    params.set("page", nextPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  // When click on prev button
  const handlePrev = () => {
    const prevPage = parseInt(page as string) - 1;

    params.set("page", prevPage.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  // When change the limit
  const handleLimitChange = (limit: string) => {
    if (isLimitReached) return;
    
    params.set("limit", limit);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 flex-col sm:flex-row w-full">
      {/* Mobile: Items per page dropdown on top */}
      <div className="w-full sm:w-auto order-2 sm:order-1">
        <Select
          value={limit}
          onValueChange={(value) => {
            handleLimitChange(value);
          }}
          disabled={isLimitReached}
        >
          <SelectTrigger className={`
            w-full sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm
            ${isLimitReached ? "opacity-50 cursor-not-allowed" : ""}
          `}>
            <SelectValue placeholder={`${PAGINATION_PER_PAGE[0]} per page`} />
          </SelectTrigger>
          <SelectContent>
            {PAGINATION_PER_PAGE.map((number, index: number) => (
              <SelectItem key={index} value={number.toString()} className="text-xs sm:text-sm">
                {number} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page info and navigation */}
      <div className="border border-input h-9 sm:h-10 px-3 rounded-md flex items-center justify-between sm:justify-center text-xs sm:text-sm w-full sm:w-auto order-1 sm:order-2">
        <div className="flex items-center gap-1">
          <span>Page</span>
          <span className="font-medium">
            {page && formatNumber(parseInt(page))} of {formatNumber(totalPages)}
          </span>
        </div>

        <div className="ml-2 sm:ml-3 pl-2 sm:pl-3 border-l h-full flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={page && parseInt(page) <= 1 ? true : false}
            className="disabled:text-black/40 p-1"
            aria-label="Previous page"
          >
            <ChevronLeft width={16} height={16} className="sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={page && parseInt(page) >= totalPages || isLimitReached}
            className={`
              p-1
              ${isLimitReached ? "cursor-not-allowed opacity-50" : ""}
            `}
            aria-label="Next page"
          >
            <ChevronRight width={16} height={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;