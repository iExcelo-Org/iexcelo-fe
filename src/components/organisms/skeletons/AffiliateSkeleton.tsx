export default function AffiliateSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header Banner */}
      <div className="mb-5 p-[1.6875rem_1.25rem_2.25rem_1.25rem] rounded-[1rem] bg-gradient-to-b from-blue-500 to-blue-600 animate-pulse">
        <div className="h-8 w-48 bg-blue-400/50 rounded-lg mb-2" />
        <div className="h-5 w-96 max-w-full bg-blue-400/50 rounded mb-4" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-40 bg-blue-400/50 rounded-lg" />
          <div className="h-7 w-20 bg-blue-400/50 rounded-lg" />
        </div>
      </div>

      {/* Affiliate Link */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mb-6 animate-pulse">
        <div className="flex gap-4 mb-6 items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
          <div className="h-12 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6] animate-pulse"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-lg mb-4" />
            <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Recent Commissions + Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] animate-pulse">
          <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-32 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
