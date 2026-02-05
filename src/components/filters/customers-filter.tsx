import { Customer } from "@/types";
import Export from "./customers-filter/export";
import Search from "./customers-filter/search";

interface CustomersFilterProps {
  data: Customer[];
  isLimitReached?: boolean;
  excessRecords?: number;
}

const CustomersFilter = ({
  data,
  isLimitReached,
  excessRecords
}: CustomersFilterProps) => {
  return (
    <>
      <div className="bg-white rounded-xl p-5 flex items-center justify-between flex-col sm:flex-row gap-x-6 gap-y-3">
        <div className="flex items-center flex-col sm:flex-row gap-x-6 gap-y-3 w-full sm:w-auto">
          <Search />
        </div>

        <div className="flex items-center gap-x-6 gap-y-3 w-full sm:w-auto">
          <Export data={data} />
        </div>
      </div>
    </>
  );
};

export default CustomersFilter;
