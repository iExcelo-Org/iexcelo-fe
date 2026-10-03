const ReferralsSkeleton = () => {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-row items-start justify-between gap-3">
        <div>
          {/* h1: text-[1.125rem] sm:text-xl → leading-7 → h-7 */}
          <div className="h-6 sm:h-7 w-40 sm:w-48 bg-gray-200 rounded-lg animate-pulse mb-1.5" />
          {/* subtitle: text-[.8125rem] sm:text-sm → leading-5 → h-5 */}
          <div className="h-4 sm:h-5 w-56 sm:w-72 max-w-full bg-gray-100 rounded animate-pulse" />
        </div>
        {/* Invite button: icon-only on mobile = w-9 h-9, full on sm */}
        <div className="w-9 h-9 sm:w-24 sm:h-10 bg-gray-200 rounded-full sm:rounded-lg animate-pulse flex-shrink-0" />
      </div>

      {/* Top row: hero + balance */}
      <div className="flex flex-col lg:flex-row mb-6 gap-[1rem]">
        <div className="w-full lg:w-[70%] h-[7.5rem] sm:h-[9rem] lg:h-42.5 bg-gray-800/20 rounded-[.5rem] animate-pulse" />
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="w-full lg:w-[30%] h-auto lg:h-42.5 rounded-[.5rem] animate-pulse p-4 sm:p-5 flex flex-col justify-between gap-3 sm:gap-0"
        >
          {/* "Available Balance" label: text-[.875rem] leading-6 → h-5 */}
          <div className="h-5 w-28 sm:w-32 bg-gray-200 rounded" />
          {/* Amount: text-[1.5rem] leading-8 → h-8 */}
          <div className="h-7 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded" />
          {/* Total rewards: text-[.875rem] leading-6 → h-5 */}
          <div className="h-5 w-36 sm:w-40 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid mb-6 grid-cols-1 sm:grid-cols-3 gap-[1rem]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-[.75rem] py-5 sm:py-6 md:py-8 px-3 sm:px-4 border-[#D6D6D6] animate-pulse flex flex-col gap-2 justify-between"
          >
            {/* label: text-[.8125rem] leading-5 → h-5 */}
            <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded" />
            {/* value: text-[1.375rem] leading-8 → h-8 */}
            <div className="h-7 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Referrals table */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="rounded-[.625rem] overflow-hidden pt-4 animate-pulse mb-6"
      >
        <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 border-b border-gray-100 flex gap-2 items-center">
          {/* Tab text: text-[.875rem] sm:text-[1rem] leading-6 → h-6 */}
          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded" />
          <div className="h-5 w-7 bg-gray-100 rounded-full" />
        </div>
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between gap-3 sm:gap-4">
              <div className="h-4 w-28 sm:w-40 bg-gray-200 rounded" />
              <div className="h-4 w-14 sm:w-20 bg-gray-200 rounded" />
              <div className="h-4 w-10 sm:w-16 bg-gray-100 rounded" />
              <div className="h-4 w-20 sm:w-28 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* QR + Code section */}
      <section className="flex flex-col xl:flex-row gap-6">
        {/* QR card */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[1rem_.875rem] sm:p-[1.25rem_1rem] md:p-[2rem_1.5rem] animate-pulse flex flex-col items-center"
        >
          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded mb-1 sm:mb-2 self-start" />
          <div className="h-4 sm:h-5 w-40 sm:w-48 bg-gray-100 rounded mb-4 sm:mb-6 self-start" />
          <div className="w-[180px] h-[180px] sm:w-[216px] sm:h-[216px] bg-gray-100 rounded-xl border border-gray-200" />
          <div className="h-3 w-48 bg-gray-100 rounded mt-4" />
        </div>

        {/* Custom code card */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[1rem_.875rem] sm:p-[1.25rem_1rem] md:p-[2rem_1.5rem] animate-pulse"
        >
          <div className="h-5 sm:h-6 w-40 sm:w-48 bg-gray-200 rounded mb-1 sm:mb-2" />
          <div className="h-4 sm:h-5 w-52 sm:w-64 bg-gray-100 rounded mb-4 sm:mb-6" />
          <div className="h-3 sm:h-4 w-20 bg-gray-200 rounded mb-1" />
          <div className="h-9 sm:h-10 w-full bg-gray-100 rounded-lg mb-4" />
          <div className="h-9 sm:h-10 w-full bg-gray-200 rounded-lg mb-2" />
          <div className="h-3 w-48 bg-gray-100 rounded mb-4" />
          <div className="h-9 sm:h-10 w-full bg-gray-200 rounded-lg" />
        </div>
      </section>
    </section>
  );
};

export default ReferralsSkeleton;
