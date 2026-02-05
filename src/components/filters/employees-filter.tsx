import { Employee } from "@/types";
import Export from "./employees-filter/export";
import Filter from "./employees-filter/filter";
import Search from "./employees-filter/search";

const EmployeesFilter = ({ data }: { data: Employee[] }) => {
  return (
    <>
      <div className="bg-white rounded-xl p-5 flex items-center justify-between flex-col sm:flex-row gap-x-6 gap-y-3">
        <div className="flex items-center flex-col sm:flex-row gap-x-6 gap-y-3 w-full sm:w-auto">
          <Search />
          <Filter />
        </div>

        <div className="flex items-center gap-x-6 gap-y-3 w-full sm:w-auto">
          <Export data={data} />
        </div>
      </div>
    </>
  );
};

export default EmployeesFilter;
