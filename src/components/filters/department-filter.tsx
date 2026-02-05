import Search from "./departments-filter/search";

const DepartmentsFilter = () => {
  return (
    <>
      <div className="bg-white rounded-xl p-5 flex items-center justify-between flex-col sm:flex-row gap-x-6 gap-y-3">
        <div className="flex items-center flex-col sm:flex-row gap-x-6 gap-y-3 w-full sm:w-auto">
          <Search />
        </div>
      </div>
    </>
  );
};

export default DepartmentsFilter;