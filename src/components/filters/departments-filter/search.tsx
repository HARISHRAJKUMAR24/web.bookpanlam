"use client";
import { SearchNormal1 } from "iconsax-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Search = () => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page || (parseInt(page.toString()) <= 1 && (page = "1"));

  // When someone searches
  const handleSearch = (value: string) => {
    params.set("q", value);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-gray-100 rounded-full flex items-center gap-3 sm:max-w-[400px] w-full h-12 px-5">
      <SearchNormal1 />
      <input
        type="text"
        placeholder="Search departments..."
        className="w-full h-full bg-transparent outline-none"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
};

export default Search;