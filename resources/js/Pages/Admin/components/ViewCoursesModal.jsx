import { X } from 'lucide-react';

export default function ViewCoursesModal({
    isOpen,
    modalProgram,
    modalSemester,
    onClose
}) {
    if (!isOpen || !modalSemester) return null;

    const courses = modalSemester.courses || [];
    
    // Calculate totals
    const totalUnits = courses.reduce((sum, course) => sum + parseFloat(course.total_units || 0), 0);
    const totalLecUnits = courses.reduce((sum, course) => sum + parseFloat(course.lec_units || 0), 0);
    const totalLabUnits = courses.reduce((sum, course) => sum + parseFloat(course.lab_units || 0), 0);

    // Calculate category totals
    const categoryTotals = {};
    courses.forEach((course) => {
        const key = course.category && course.category.trim() !== '' ? course.category : 'Uncategorized';
        const units = parseFloat(course.total_units || 0);
        categoryTotals[key] = (categoryTotals[key] || 0) + units;
    });
    const categoryRows = Object.entries(categoryTotals);
    const grandTotal = categoryRows.reduce((sum, [, units]) => sum + units, 0);

    const formatNumber = (num) => {
        return num % 1 === 0 ? num.toString() : Number(num.toFixed(1)).toString();
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{modalProgram?.curriculum_name}</h3>
                        <p className="text-sm text-gray-600">{modalProgram?.program_name}</p>
                        {(modalSemester.year_level !== 'N/A' || modalSemester.semester !== 'N/A') && (
                            <p className="text-sm text-gray-500">
                                {modalSemester.year_level}
                                {modalSemester.year_level !== 'N/A' && modalSemester.semester !== 'N/A' ? ' - ' : ''}
                                {modalSemester.semester}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 text-center">
                            PROGRAM CURRICULUM - {modalProgram?.program_name}
                        </h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                            <thead className="bg-gray-500">
                                <tr>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Course Code</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Category</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Course Title</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Total Units</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Lec Units</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Lab Units</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-white">Prerequisite</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map((course, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                                            {course.code}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                                            {course.category || '—'}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200">
                                            {course.title}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                                            {formatNumber(parseFloat(course.total_units))}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                                            {formatNumber(parseFloat(course.lec_units))}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                                            {formatNumber(parseFloat(course.lab_units))}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-900">
                                            {course.prereq || 'None'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Semester Totals */}
                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                            <h6 className="font-semibold text-gray-700">Maximum Total Units:</h6>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-semibold text-gray-900">{formatNumber(totalUnits)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-gray-600">Lec:</span>
                                    <span className="font-semibold text-gray-900">{formatNumber(totalLecUnits)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-gray-600">Lab:</span>
                                    <span className="font-semibold text-gray-900">{formatNumber(totalLabUnits)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Breakdown (category summary) */}
                    {categoryRows.length > 0 && (
                        <div className="mt-4">
                            <h6 className="font-semibold text-gray-700 mb-2 text-xs">Curriculum Breakdown</h6>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-500">
                                        <tr>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Description</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white">Total Units</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categoryRows.map(([category, units]) => (
                                            <tr key={category} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border-r border-gray-200">
                                                    {category}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                                    <span className="text-xs font-semibold text-black">{formatNumber(units)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50">
                                            <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900 border-r border-gray-200">Total</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                                <span className="text-xs font-semibold text-black">{formatNumber(grandTotal)}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
