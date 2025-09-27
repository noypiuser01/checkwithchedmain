import { X, Plus, Edit, Trash2, BookOpen } from 'lucide-react';

export default function EditCurriculumModal({
    isOpen,
    selectedCurriculum,
    editFormData,
    isUpdating,
    localGroupedCurricula,
    getCurriculumStatus,
    onClose,
    onInputChange,
    onCourseChange,
    onAddCourse,
    onRemoveCourse,
    onUpdate
}) {
    if (!isOpen || !selectedCurriculum) return null;

    const isInactive = (() => {
        const originalCurriculum = localGroupedCurricula.find(c => 
            c.curriculum_name === selectedCurriculum.curriculum_name && 
            c.program_name === selectedCurriculum.program_name
        );
        return originalCurriculum && getCurriculumStatus(originalCurriculum) === 'Inactive';
    })();

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">CMO/PSG details</h3>
                        <p className="text-gray-600 mt-1">{selectedCurriculum.curriculum_name}</p>
                        
                        {/* Curriculum Status Indicator */}
                        {isInactive && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">!</span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">
                                            This curriculum is <strong>Inactive</strong> and no longer in use.
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">
                                            Consider using the latest version of this CMO/PSG instead.
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CMO/PSG Name</label>
                            <input
                                type="text"
                                value={editFormData.curriculumName}
                                onChange={(e) => onInputChange('curriculumName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                            <input
                                type="text"
                                value={editFormData.programName}
                                onChange={(e) => onInputChange('programName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mb-8">
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 text-lg mb-3">Courses</h4>
                        </div>
                        
                        {editFormData.courses && editFormData.courses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Course Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Course Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Total Units
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Lec Units
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Lab Units
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-r border-gray-200">
                                                Prerequisite
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {editFormData.courses.map((course, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.code}
                                                        onChange={(e) => onCourseChange(index, 'code', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="Course Code"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <select
                                                        value={course.category || ''}
                                                        onChange={(e) => onCourseChange(index, 'category', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    >
                                                        <option value="">Select Category</option>
                                                        <option value="General Education">General Education</option>
                                                        <option value="General Education Core Courses">General Education Core Courses</option>
                                                        <option value="General Education Elective Courses">General Education Elective Courses</option>
                                                        <option value="General Education Mandated Course">General Education Mandated Course</option>
                                                        <option value="Core Courses">Core Courses</option>
                                                        <option value="Research Courses">Research Courses</option>
                                                        <option value="Internship Courses">Internship Courses</option>
                                                        <option value="Professional Domain Course">Professional Domain Course</option>
                                                        <option value="Common Course">Common Course</option>
                                                        <option value="Professional Course">Professional Course</option>
                                                        <option value="Professional Electives">Professional Electives</option>
                                                        <option value="PE">PE</option>
                                                        <option value="Physical Education Courses">Physical Education Courses</option>
                                                        <option value="NSTP">NSTP</option>
                                                        <option value="Professional Course Electives (Business Analytics)">Professional Course Electives (Business Analytics)</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.title}
                                                        onChange={(e) => onCourseChange(index, 'title', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="Course Title"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.totalUnits}
                                                        onChange={(e) => onCourseChange(index, 'totalUnits', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.lecUnits}
                                                        onChange={(e) => onCourseChange(index, 'lecUnits', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.labUnits}
                                                        onChange={(e) => onCourseChange(index, 'labUnits', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.prereq}
                                                        onChange={(e) => onCourseChange(index, 'prereq', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                        placeholder="Prerequisite"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => onRemoveCourse(index)}
                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
                                                        title="Remove Course"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200" colSpan={3}>
                                                Total Courses: {editFormData.courses.length}
                                            </td>
                                            <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                {(() => {
                                                    const total = editFormData.courses.reduce((sum, course) => 
                                                        sum + parseFloat(course.totalUnits || 0), 0);
                                                    return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                })()}
                                            </td>
                                            <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                {(() => {
                                                    const total = editFormData.courses.reduce((sum, course) => 
                                                        sum + parseFloat(course.lecUnits || 0), 0);
                                                    return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                })()}
                                            </td>
                                            <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                {(() => {
                                                    const total = editFormData.courses.reduce((sum, course) => 
                                                        sum + parseFloat(course.labUnits || 0), 0);
                                                    return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                })()}
                                            </td>
                                            <td className="px-6 py-3 text-left text-xs text-gray-500 border-t border-gray-200" colSpan={2}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                {/* Actions under the table */}
                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={onAddCourse}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 text-sm flex items-center"
                                        title="Add Course"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Course
                                    </button>
                                    <button
                                        onClick={onUpdate}
                                        disabled={isUpdating}
                                        className={`px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm flex items-center ${
                                            isUpdating 
                                                ? 'bg-blue-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                        title="Update Curriculum"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500">No courses added yet.</p>
                                <p className="text-sm text-gray-400">Click "Add Course" to get started.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Default actions when there are no courses */}
                    {(!editFormData.courses || editFormData.courses.length === 0) && (
                        <div className="mt-6 flex justify-center sm:justify-end sm:pr-2 gap-3">
                            <button
                                onClick={onAddCourse}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 text-sm flex items-center"
                                title="Add Course"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Course
                            </button>
                            <button
                                onClick={onUpdate}
                                disabled={isUpdating}
                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm flex items-center ${
                                    isUpdating 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                title="Update Curriculum"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Update
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
