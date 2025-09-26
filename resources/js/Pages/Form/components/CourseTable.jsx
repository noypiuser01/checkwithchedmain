import { formatUnitsDisplay } from '../utils/helpers';

export default function CourseTable({
    buildPeriodsToShow,
    parsePeriod,
    courses,
    addCourse,
    updateCourse,
    removeCourse,
    getCategoriesForCMO,
    getTitlesForCategory,
    getAllSelectedCourseTitles,
    titlesLoadingCategory,
    fetchTitlesForCategory,
    fetchPrerequisitesForCourse
}) {
    return (
        <div className="mt-6 border-t pt-4">
            {buildPeriodsToShow().map(period => {
                const { year, semester } = parsePeriod(period);
                const key = `${year}-${semester}`;
                const periodCourses = courses[key] || [];
                return (
                    <div key={key} className="mb-6 last:mb-0">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-gray-900">
                                {year ? `${year} - ${semester}` : semester}
                            </h3>
                            <button
                                type="button"
                                onClick={() => addCourse(year, semester)}
                                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                title="Add a new course row to this semester"
                            >
                                <svg 
                                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 4v16m8-8H4" 
                                    />
                                </svg>
                                <span>Add Row</span>
                            </button>
                        </div>

                        {periodCourses.length === 0 ? (
                            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                                <h4 className="text-lg font-medium text-gray-700 mb-2">Ready to add courses?</h4>
                                <p className="text-gray-600 mb-4">Start building your curriculum by adding course rows</p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                                     onClick={() => addCourse(year, semester)}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Your First Course
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Course Code</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Category</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Course Title</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Req Units</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Total Units</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Lec Units</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Lab Units</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Prerequisite/s</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {periodCourses.map((course) => (
                                            <tr key={course.id} data-course-id={course.id} className="hover:bg-gray-50 transition-all duration-300 animate-pulse-once">
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.courseCode}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'courseCode', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="e.g., CS101"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            list={`categories-${course.id}`}
                                                            value={course.category}
                                                            onChange={async (e) => {
                                                                const value = e.target.value;
                                                                updateCourse(year, semester, course.id, 'category', value);
                                                                // Fetch titles for this category and current CMO selection
                                                                fetchTitlesForCategory(value);
                                                                
                                                                // Fetch prerequisites if both category and title are set
                                                                await fetchPrerequisitesForCourse(year, semester, course.id, course.courseTitle, value);
                                                            }}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                            placeholder="Type or select category"
                                                        />
                                                        <datalist id={`categories-${course.id}`}>
                                                            {getCategoriesForCMO().map(category => (
                                                                <option key={category} value={category} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            list={`titles-${course.id}`}
                                                            value={course.courseTitle}
                                                            onChange={async (e) => {
                                                                const newTitle = e.target.value;
                                                                updateCourse(year, semester, course.id, 'courseTitle', newTitle);
                                                                
                                                                // Fetch prerequisites if both category and title are set
                                                                await fetchPrerequisitesForCourse(year, semester, course.id, newTitle, course.category);
                                                            }}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                            placeholder={titlesLoadingCategory === course.category ? 'Loading titles...' : 'Type or select title'}
                                                        />
                                                        {(() => {
                                                            const titles = getTitlesForCategory(course.category);
                                                            const selectedTitles = getAllSelectedCourseTitles();
                                                            const currentCourseTitle = course.courseTitle?.trim();
                                                            
                                                            if (titles.length > 0) {
                                                                // Filter out already selected titles, but keep the current course's title
                                                                const availableTitles = titles.filter(title => 
                                                                    !selectedTitles.includes(title) || title === currentCourseTitle
                                                                );
                                                                
                                                                return (
                                                                    <datalist id={`titles-${course.id}`}>
                                                                        {availableTitles.map(title => (
                                                                            <option key={title} value={title} />
                                                                        ))}
                                                                    </datalist>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={formatUnitsDisplay(course.reqUnits)}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'reqUnits', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="3"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={formatUnitsDisplay(course.totalUnits)}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'totalUnits', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="3"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={formatUnitsDisplay(course.lecUnits)}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'lecUnits', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="3"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={formatUnitsDisplay(course.labUnits)}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'labUnits', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={course.prerequisites}
                                                        onChange={(e) => updateCourse(year, semester, course.id, 'prerequisites', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                                        placeholder="e.g., CS100, MATH101"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCourse(year, semester, course.id)}
                                                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                        title="Remove course"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
