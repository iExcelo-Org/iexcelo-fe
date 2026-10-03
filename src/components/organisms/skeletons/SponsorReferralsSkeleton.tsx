const SponsorReferralsSkeleton = () => {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Hero card */}
      <div className="w-full h-42.5 bg-gray-800/20 rounded-[.5rem] animate-pulse mb-6.5" />

      {/* Table */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="rounded-[.625rem] overflow-hidden pt-4 animate-pulse mb-6"
      >
        <div className="px-4 pb-3 border-b border-gray-100 flex gap-2 items-center">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-8 bg-gray-100 rounded-full" />
        </div>
        <div className="p-4 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between gap-4">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* QR code + Custom Referral Code */}
      <section className="flex flex-col xl:flex-row gap-6">
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full rounded-[.75rem] p-[2rem_1.5rem] animate-pulse flex flex-col items-center"
        >
          <div className="h-5 w-24 bg-gray-200 rounded mb-2 self-start" />
          <div className="h-4 w-48 bg-gray-100 rounded mb-6 self-start" />
          <div className="w-[216px] h-[216px] bg-gray-200 rounded-xl" />
        </div>

        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full rounded-[.75rem] p-[2rem_1.5rem] animate-pulse"
        >
          <div className="h-5 w-44 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded mb-6" />
          <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-11 w-full bg-gray-100 rounded-lg mb-4" />
          <div className="h-10 w-full bg-gray-200 rounded-lg mb-1" />
          <div className="h-3 w-48 bg-gray-100 rounded mb-4" />
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>
      </section>
    </section>
  );
};

export default SponsorReferralsSkeleton;
