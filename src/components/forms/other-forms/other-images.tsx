"use client";

import Image from "next/image";

type Props = {
  department: any;
};

const OtherImages = ({ department }: Props) => {
  const image = department.image;

  return (
    <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100 h-full">


      <div className="relative w-full rounded-lg overflow-hidden bg-gray-50">
        {image ? (
          <div className="relative w-full aspect-video">
            <Image
              src={image}
              alt={`${department.name || "Department"} image`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        ) : (
          <div className="w-full aspect-video flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <span className="text-gray-500 font-medium">No Image Available</span>
            <p className="text-gray-400 text-sm text-center mt-2 max-w-xs">
              Add an image to better represent this department
            </p>
          </div>
        )}
      </div>

      {/* {image && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            <span className="font-medium">Image URL:</span>
            <span className="ml-2 font-mono text-xs truncate block max-w-[200px]">
              {image}
            </span>
          </div>
          <a 
            href={image} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
          >
            View full image
          </a>
        </div>
      )} */}
    </div>
  );
};

export default OtherImages;