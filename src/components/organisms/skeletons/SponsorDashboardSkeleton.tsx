export default function SponsorDashboardSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-5.5 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-lg mb-4" />
            <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-20 bg-gray-200 rounded mb-4" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="flex mt-5 justify-between items-stretch gap-[1.25rem]">
        {/* Active Givebacks */}
        <div className="h-94.5 w-[68%] border border-[#D6D6D6] rounded-[.75rem] animate-pulse p-6 flex flex-col gap-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-[.625rem]"
            >
              <div className="h-8 w-14 bg-gray-200 rounded-full" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="h-94.5 w-[30%] border border-[#D6D6D6] rounded-[.75rem] animate-pulse p-5 flex flex-col gap-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="col-span-2 h-25 bg-gray-100 rounded-[.75rem]" />
          <div className="flex gap-3">
            <div className="flex-1 h-25 bg-gray-100 rounded-[.75rem]" />
            <div className="flex-1 h-25 bg-gray-100 rounded-[.75rem]" />
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="h-100.25 mt-5 border border-[#D6D6D6] rounded-[.75rem] animate-pulse p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-5 w-52 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-44 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-lg" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-[.625rem]"
          >
            <div>
              <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-44 bg-gray-100 rounded" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
