export default function EarningsSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
        <div>
          {/* h1: text-[1.125rem] sm:text-xl leading-7 → h-6/h-7 */}
          <div className="h-6 sm:h-7 w-40 sm:w-48 bg-gray-200 rounded-lg animate-pulse mb-1.5" />
          {/* subtitle: text-[.8125rem] leading-5 → h-5 */}
          <div className="h-4 sm:h-5 w-56 sm:w-80 max-w-full bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Top Cards */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Wallet card: dark gradient */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-[.75rem] p-4 sm:p-6 animate-pulse flex flex-col gap-3 sm:gap-4 min-h-[unset] sm:min-h-65">
          {/* "Wallet Balance" label: text-[.9375rem] sm:text-[1.125rem] leading-6/7 → h-5/h-6 */}
          <div className="h-5 sm:h-6 w-28 sm:w-32 bg-gray-600 rounded" />
          {/* Balance: text-[2rem] sm:text-[2.5rem] leading-10/12 → h-10/h-12 */}
          <div className="h-9 sm:h-11 w-32 sm:w-40 bg-gray-600 rounded" />
          <div className="mt-auto flex flex-col gap-2.5 sm:gap-3">
            {/* Withdraw button */}
            <div className="h-9 sm:h-11 w-full bg-gray-600 rounded-[.5rem]" />
            {/* Add payout link */}
            <div className="h-5 sm:h-6 w-36 sm:w-44 bg-gray-600 rounded mx-auto" />
          </div>
        </div>

        {/* Commission card */}
        <div className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse">
          {/* Icon: w-14 h-14 */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-lg mb-3 sm:mb-4" />
          {/* Label: text-[.8125rem] sm:text-sm → h-4 */}
          <div className="h-3.5 sm:h-4 w-40 sm:w-48 bg-gray-200 rounded mb-2" />
          {/* Value: text-[1.375rem] sm:text-[1.75rem] → h-7/h-9 */}
          <div className="h-7 sm:h-9 w-24 sm:w-32 bg-gray-200 rounded mb-3 sm:mb-4" />
          {/* Badge: h-5 */}
          <div className="h-5 w-20 sm:w-24 bg-gray-200 rounded" />
        </div>

        {/* Payout placeholder card */}
        <div className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse flex flex-col items-center gap-3">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg" />
          <div className="h-4 w-48 sm:w-52 bg-gray-100 rounded" />
          <div className="h-4 w-36 sm:w-44 bg-gray-100 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
      </section>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 border border-[#D6D6D6] mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            {/* Chart title: text-[1rem] sm:text-[1.125rem] leading-7 → h-6/h-7 */}
            <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 rounded mb-1.5" />
            {/* Subtitle: text-[.8125rem] sm:text-[.875rem] → h-4/h-5 */}
            <div className="h-4 w-40 sm:w-52 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-24 sm:w-28 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-[260px] sm:h-[340px] md:h-[400px] bg-gray-100 rounded-lg" />
      </div>

      {/* Bottom Row */}
      <section className="flex flex-col xl:flex-row mt-6 gap-6">
        <div className="xl:w-[59%] w-full bg-white rounded-[.75rem] p-[1rem] sm:p-[1.5rem_1.25rem] md:p-[2rem_1.5rem] border border-[#D6D6D6] animate-pulse">
          {/* Title: text-[1rem] sm:text-[1.125rem] → h-5/h-6 */}
          <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gray-200 rounded mb-4 sm:mb-5" />
          <div className="space-y-2.5 sm:space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex justify-between p-3 sm:p-4 bg-gray-50 rounded-[.625rem] gap-2"
              >
                <div>
                  {/* ID: text-[.875rem] sm:text-[1rem] leading-5/6 → h-5 */}
                  <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded mb-1.5" />
                  {/* Date: text-[.8125rem] sm:text-[.875rem] → h-4 */}
                  <div className="h-3.5 sm:h-4 w-20 sm:w-24 bg-gray-100 rounded" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {/* Amount: text-[1rem] sm:text-[1.125rem] → h-5/h-6 */}
                  <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-14 sm:w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="xl:w-[39%] w-full bg-white rounded-[.75rem] p-[1rem] sm:p-[1.5rem_1.25rem] md:p-[2rem_1.5rem] border border-[#D6D6D6] animate-pulse">
          {/* Title: h-5/h-6 */}
          <div className="h-5 sm:h-6 w-36 sm:w-40 bg-gray-200 rounded mb-1" />
          {/* Subtitle: h-4 */}
          <div className="h-4 w-48 sm:w-56 bg-gray-100 rounded mb-4 sm:mb-6" />
          <div className="h-[200px] sm:h-[240px] md:h-64 bg-gray-100 rounded-lg" />
        </div>
      </section>
    </section>
  );
}
