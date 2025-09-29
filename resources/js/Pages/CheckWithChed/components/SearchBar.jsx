import React from 'react';

export default function SearchBar({ 
    query, 
    onQueryChange, 
    onSubmit, 
    isLoading 
}) {
    return (
        <div className="flex justify-center px-4">
            <div className="relative max-w-xl w-full">
                {/* Glow effect behind search bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 scale-110"></div>
                
                <form
                    onSubmit={onSubmit}
                    className="relative flex flex-col sm:flex-row items-stretch sm:items-center w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-200 hover:shadow-2xl hover:shadow-blue-300/30 hover:border-blue-300 transition-all duration-300 group"
                >
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6 group-focus-within:text-blue-500 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            name="query"
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none transition-all text-base sm:text-lg bg-transparent group-hover:placeholder-gray-600"
                            placeholder="Enter institution name, program, or course..."
                            disabled={isLoading}
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="relative px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-b-2xl sm:rounded-r-2xl sm:rounded-b-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg shadow-lg group/btn overflow-hidden"
                    >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover/btn:opacity-15 transition-opacity duration-300"></div>
                        
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin w-5 h-5 sm:w-6 sm:h-6 relative z-10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="relative z-10">Searching...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <span className="relative z-10">Search</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
