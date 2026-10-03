export default function SponsorStudentsSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="flex mb-5.5 justify-between items-center animate-pulse">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg" />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-lg mb-4" />
            <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-20 bg-gray-200 rounded mb-4" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-7 border border-[#D6D6D6] rounded-[.75rem] overflow-hidden animate-pulse">
        <div className="flex gap-4 p-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-3 flex-1 bg-gray-200 rounded" />
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-[#E4E7EC]">
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full self-center" />
            <div className="h-4 w-16 bg-gray-200 rounded self-center" />
            <div className="h-4 w-20 bg-gray-200 rounded self-center" />
            <div className="h-4 w-20 bg-gray-200 rounded self-center" />
            <div className="h-6 w-16 bg-gray-100 rounded-full self-center" />
            <div className="h-4 w-20 bg-gray-100 rounded self-center" />
          </div>
        ))}
      </div>
    </section>
  );
}
