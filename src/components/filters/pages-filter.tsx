import Search from "./pages-filter/search";

const PagesFilter = () => {
  return (
    <>
      <div className="bg-white rounded-xl flex items-center justify-between flex-col sm:flex-row gap-x-6 gap-y-3">
        <div className="flex items-center flex-col sm:flex-row gap-x-6 gap-y-3 w-full sm:w-auto">
          <Search />
        </div>
      </div>
    </>
  );
};

export default PagesFilter;
