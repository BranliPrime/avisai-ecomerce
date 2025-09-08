const CardLoading = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse w-full h-full flex flex-col">
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl flex-shrink-0">
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-yellow-200 rounded-full w-16 h-5"></div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">

        <div className="space-y-2 mb-2 h-10">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>

        <div className="flex-1"></div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col space-y-1">
            <div className="h-4 bg-green-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-3 bg-orange-200 rounded w-8"></div>
        </div>
      </div>

      <div className="px-3 pb-3 flex-shrink-0">
        <div className="h-8 bg-gradient-to-r from-green-200 to-green-300 rounded-lg"></div>
      </div>
    </div>
  )
}

export default CardLoading
