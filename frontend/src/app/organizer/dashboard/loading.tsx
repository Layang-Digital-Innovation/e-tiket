export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Title Skeleton */}
          <div className="h-9 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse" />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
                    <div className="ml-5 flex-1">
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Events Skeleton */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
