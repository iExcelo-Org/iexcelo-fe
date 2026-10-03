export default function AffiliateStudentsSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stat Cards */}
      <section className="grid mt-6 grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-lg mb-4" />
            <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-20 bg-gray-200 rounded mb-4" />
            <div className="flex gap-2 items-center">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </section>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#D6D6D6] animate-pulse">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded ml-4" />
              <div className="h-4 w-20 bg-gray-200 rounded ml-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
