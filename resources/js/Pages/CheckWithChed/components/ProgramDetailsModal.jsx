import React from 'react';
import { BookOpen, Layers, CheckCircle, MapPin, Home } from 'lucide-react';

export default function ProgramDetailsModal({ 
    isOpen, 
    onClose, 
    selectedProgram, 
    loadingProgramDetails 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                {/* Modal Header - Blue gradient to match results styling */}
                <div className="flex items-center justify-between p-4 sm:p-6 bg-[#1e3c73] text-white">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                            <img src="/images/logo.png" alt="CHED Logo" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold">Program Details</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/90 hover:text-white transition-colors duration-200 p-1"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6">
                    {loadingProgramDetails ? (
                        <div className="flex flex-col sm:flex-row justify-center items-center py-6 sm:py-8 gap-2 sm:gap-0">
                            <svg className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-0 sm:ml-2 text-gray-600 text-sm sm:text-base">Loading program details...</span>
                        </div>
                    ) : selectedProgram ? (
                        <>
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                                    {selectedProgram.programName && selectedProgram.programName !== "N/A"
                                        ? selectedProgram.programName
                                        : "Program Name Not Available"}
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-gray-700 text-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <Home className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-semibold">Institution Name:</span>
                                    </div>
                                    <span className={`sm:ml-0 ${selectedProgram.institutionName === "N/A" ? "text-gray-400 italic" : ""}`}>
                                        {selectedProgram.institutionName || "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-semibold">Address:</span>
                                    </div>
                                    <span className={`sm:ml-0 ${selectedProgram.address === "N/A" ? "text-gray-400 italic" : ""}`}>
                                        {selectedProgram.address || "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-semibold">Degree Name:</span>
                                    </div>
                                    <span className={`sm:ml-0 ${selectedProgram.degreeName === "N/A" ? "text-gray-400 italic" : ""}`}>
                                        {selectedProgram.degreeName || "N/A"}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-semibold">Status:</span>
                                    </div>
                                    {selectedProgram.status && selectedProgram.status !== "N/A" ? (
                                        <span className="sm:ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            {selectedProgram.status}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">N/A</span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-semibold">Major:</span>
                                    </div>
                                    <div className="sm:ml-0">
                                        {selectedProgram.major && selectedProgram.major !== "N/A" ? (
                                            <ul className="list-disc list-inside text-gray-700 ml-2">
                                                {selectedProgram.major.split(",").map((major, index) => (
                                                    <li key={index}>{major.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400 italic ml-2">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
                                <span className="italic">
                                    Note: Fields showing "N/A" indicate that information is not available in the current dataset.
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-6 sm:py-8">
                            No program details available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
