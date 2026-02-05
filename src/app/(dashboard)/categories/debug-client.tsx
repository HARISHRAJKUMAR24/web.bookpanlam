"use client";

export default function DebugClient({ data }: any) {
  console.log("🔥 DATA RECEIVED IN CLIENT:", data);

  return (
    <pre className="bg-black text-green-400 p-4 text-xs overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
