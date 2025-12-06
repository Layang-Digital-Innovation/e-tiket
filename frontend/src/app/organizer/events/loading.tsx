export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Event Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
