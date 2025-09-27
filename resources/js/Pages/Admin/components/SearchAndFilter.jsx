import { Search, Filter, Layers } from 'lucide-react';

export default function SearchAndFilter({ 
    searchTerm, 
    setSearchTerm, 
    selectedFilter, 
    setSelectedFilter, 
    pageSize, 
    setPageSize 
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search curriculum..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Filter Dropdown */}
                <div className="sm:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Show Entries Dropdown */}
                <div className="sm:w-48">
                    <div className="relative">
                        <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            title="Show entries"
                        >
                            <option value="5">Show 5 entries</option>
                            <option value="10">Show 10 entries</option>
                            <option value="25">Show 25 entries</option>
                            <option value="50">Show 50 entries</option>
                            <option value="all">Show all entries</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
