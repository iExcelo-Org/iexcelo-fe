export default function CommissionsSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#D6D6D6] animate-pulse">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="flex gap-4 items-center p-3 bg-gray-50 rounded"
            >
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
