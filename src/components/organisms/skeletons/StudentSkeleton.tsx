export default function StudentSkeleton() {
  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1rem] sm:py-[1.25rem] mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[1.125rem] sm:mb-6">
        <div>
          <div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-gray-100 rounded-md animate-pulse mt-2" />
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-7 w-28 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* CTA banner */}
      <div className="mb-[1.125rem] sm:mb-6">
        <div className="bg-gray-200 rounded-2xl p-[1rem] sm:p-6 md:p-8 animate-pulse overflow-hidden">
          <div className="h-5 sm:h-6 w-3/5 sm:w-64 bg-gray-300 rounded-lg mb-2 sm:mb-3" />
          <div className="h-3.5 sm:h-4 w-4/5 sm:w-80 bg-gray-300 rounded mb-3 sm:mb-4" />
          <div className="h-8 sm:h-10 w-2/5 sm:w-40 bg-gray-300 rounded-lg" />
        </div>
      </div>

      {/* Stat cards — 1 column below sm (horizontal layout), 3 columns sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-[1.125rem] sm:mb-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-3.5 px-4 sm:py-5 sm:px-4 border border-[#D6D6D6] flex items-center gap-3 sm:flex-col sm:justify-center sm:items-start sm:gap-0 animate-pulse min-h-[7rem] sm:min-h-0"
          >
            {/* Icon placeholder */}
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gray-200 rounded-lg shrink-0 sm:mb-4" />
            <div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-1.5" />
              <div className="h-6 sm:h-7 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Exams grid */}
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#D6D6D6] animate-pulse h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="h-3.5 sm:h-4 w-40 sm:w-48 bg-gray-200 rounded" />
              <div className="h-7 sm:h-8 w-24 sm:w-28 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex-1 min-h-[220px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div>
          <div className="bg-white flex flex-col h-full rounded-xl p-3 sm:p-4 border border-[#D6D6D6] animate-pulse">
            <div className="h-3.5 sm:h-4 w-28 sm:w-32 bg-gray-200 rounded mb-3 sm:mb-4" />
            <div className="grid flex-1 grid-cols-2 gap-2 sm:gap-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border border-[#D6D6D6] rounded-[1rem] p-2.5 sm:p-4 h-full flex flex-col justify-center items-center gap-2 min-h-[6rem] sm:min-h-[10rem]"
                  >
                    <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded" />
                    <div className="h-3.5 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded-full" />
                  </div>
                ))}
            </div>
            <div className="h-3.5 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded mt-3 sm:mt-4 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
