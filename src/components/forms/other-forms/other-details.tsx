"use client";

type Props = {
  department: any;
};

const OtherDetails = ({ department }: Props) => {
  // Collect main type
  const mainType = department.typeMainName ? {
    id: 'main',
    name: department.typeMainName,
    amount: department.typeMainAmount,
    isMain: true
  } : null;

  // Collect other types
  const otherTypes = [];
  for (let i = 1; i <= 25; i++) {
    const name = department[`type${i}Name`];
    const amount = department[`type${i}Amount`];

    if (name) {
      otherTypes.push({
        id: `type${i}`,
        name,
        amount,
        index: i
      });
    }
  }

  const showScroll = otherTypes.length > 2;

  return (
    <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Types & Pricing</h2>
      
      </div>

      {/* Main Type Section */}
      {mainType && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">{mainType.name}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">₹</span>
                <span className="text-xl font-bold text-gray-800">
                  {mainType.amount || "0"}
                </span>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Other Types Section */}
      <div className="flex-1 flex flex-col">
        {otherTypes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Additional Types</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {otherTypes.length} types
              </span>
            </div>
          </div>
        )}

        {/* Types Container with Conditional Scroll */}
        <div className="flex-1">
          {otherTypes.length > 0 ? (
            <div className={`${showScroll ? 'h-64' : ''} overflow-hidden`}>
              <div className={`space-y-2 ${showScroll ? 'h-full overflow-y-auto pr-2' : ''}`}>
                {otherTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors"
                  >
                    {/* Left side - Type name */}
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                        <span className="text-emerald-700 font-medium text-xs">
                          {type.index}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-800 font-medium truncate max-w-[180px]">
                          {type.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Type {type.index}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Amount with RS symbol */}
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">₹</span>
                      <div className="text-right min-w-[60px]">
                        <p className="text-gray-800 font-medium">
                          {type.amount || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-1">No Additional Types</p>
              
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {otherTypes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                <span className="font-medium">Total:</span>
                <span className="ml-1 text-gray-800 font-semibold">
                  {otherTypes.length + (mainType ? 1 : 0)} types
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherDetails;