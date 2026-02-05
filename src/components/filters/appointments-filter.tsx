import { Appointment } from "@/types";
import Export from "./appointments-filter/export";
import Filter from "./appointments-filter/filter";
import Search from "./appointments-filter/search";
import DateRange from "./appointments-filter/date-range";

const AppointmentFilters = ({ data }: { data: Appointment[] }) => {
  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
        {/* TOP ROW - Search, Date, Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1">
          <Search />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <DateRange />
            <Filter />
          </div>
        </div>

        {/* BOTTOM ROW - Export */}
        <div className="w-full sm:w-auto">
          <Export data={data} />
        </div>
      </div>
    </>
  );
};

export default AppointmentFilters;