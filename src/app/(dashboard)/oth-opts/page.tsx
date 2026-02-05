import { getAllDepartments } from "@/lib/api/departments";
import Image from "next/image";
import Link from "next/link";

const OthOptsPage = async () => {
  // Fetch all departments
  const data = await getAllDepartments({
    limit: 50,
    page: 1,
    q: "",
  });

  const departments = data.records || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Departments</h1>
        <p className="text-black/50 text-sm font-medium mt-1">
          Select a department & Give Appointment Settings
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No departments available
          </h3>
          <p className="text-gray-500">Create your first department to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {departments.map((dept: any) => (
            <div
              key={dept.departmentId}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* Department Image Container - Reduced padding */}
              <div className="aspect-square relative bg-gray-50 p-3">
                {dept.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={dept.image}
                      alt={dept.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Department Info Section - Reduced padding and spacing */}
              <div className="p-3 pt-2 flex flex-col flex-grow">
                {/* Department Name - Reduced margins */}
                <div className="mb-2 flex-grow">
                  <h3 className="font-semibold text-gray-800 text-center text-sm line-clamp-2 min-h-[2.2rem] leading-tight">
                    {dept.name}
                  </h3>
                </div>

                {/* Select Button - Smaller and more compact */}
                <Link
                  href={`/oth-opts/departments/${dept.department_id}`}
                  className="block mt-auto"
                >
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md active:scale-[0.98]">
                    Select
                  </button>
                </Link>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OthOptsPage;