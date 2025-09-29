import React from 'react';

export default function SearchResultItem({ 
    item, 
    programs, 
    onOpenModal 
}) {
    const toggleExpanded = () => {
        // This would need to be handled by parent component
        // For now, we'll pass it as a prop
    };

    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* Institution Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 relative z-10 gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{item.name}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                        {programs?.list?.length || 0} Programs
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Programs Offered</h4>
                </div>

                {programs ? (
                    programs.list && programs.list.length > 0 ? (
                        <>
                            <div
                                className={`transition-all duration-300 ${
                                    programs?.expanded
                                        ? "max-h-screen"
                                        : "max-h-40 overflow-hidden"
                                }`}
                            >
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                    {programs.list.map((prog, i) => (
                                        <li
                                            key={i}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                                        >
                                            <span className="flex-1 text-sm sm:text-sm">{prog.programName ?? prog}</span>
                                            <button
                                                onClick={() =>
                                                    onOpenModal({
                                                        programName: prog.programName ?? prog,
                                                        instCode: item.code,
                                                        instName: item.name,
                                                        prog: typeof prog === 'object' ? prog : null,
                                                    })
                                                }
                                                className="w-full sm:w-auto sm:ml-4 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                                            >
                                                View
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {programs.list.length > 5 && (
                                <button
                                    onClick={toggleExpanded}
                                    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition-all duration-200"
                                >
                                    <svg className={`w-4 h-4 transition-transform duration-300 ${programs?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {programs?.expanded ? "See Less" : "See More"}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                            <svg className="w-8 h-8 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm italic">No programs found.</p>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center py-4">
                        <svg className="animate-spin w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-gray-500">Loading programs...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
