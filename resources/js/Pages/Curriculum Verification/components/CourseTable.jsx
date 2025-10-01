import { formatUnitsDisplay } from '../utils/helpers';
import { useState, useEffect } from 'react';

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
    // Calculate the maximum width needed for course titles across all periods
    const calculateMaxCourseTitleWidth = () => {
        const minWidth = 120;
        const maxWidth = 300;
        const charWidth = 8;
        
        let maxWidthNeeded = minWidth;
        
        buildPeriodsToShow().forEach(period => {
            const { year, semester } = parsePeriod(period);
            const key = `${year}-${semester}`;
            const periodCourses = courses[key] || [];
            
            periodCourses.forEach(course => {
                if (course.courseTitle) {
                    const titleWidth = Math.max(minWidth, Math.min(maxWidth, course.courseTitle.length * charWidth + 20));
                    maxWidthNeeded = Math.max(maxWidthNeeded, titleWidth);
                }
            });
        });
        
        return maxWidthNeeded;
    };

    // Calculate the maximum width needed for course codes across all periods
    const calculateMaxCourseCodeWidth = () => {
        const minWidth = 80;
        const maxWidth = 150;
        const charWidth = 8;
        
        let maxWidthNeeded = minWidth;
        
        buildPeriodsToShow().forEach(period => {
            const { year, semester } = parsePeriod(period);
            const key = `${year}-${semester}`;
            const periodCourses = courses[key] || [];
            
            periodCourses.forEach(course => {
                if (course.courseCode) {
                    const codeWidth = Math.max(minWidth, Math.min(maxWidth, course.courseCode.length * charWidth + 20));
                    maxWidthNeeded = Math.max(maxWidthNeeded, codeWidth);
                }
            });
        });
        
        return maxWidthNeeded;
    };

    // Calculate the maximum width needed for categories across all periods
    const calculateMaxCategoryWidth = () => {
        const minWidth = 100;
        const maxWidth = 200;
        const charWidth = 8;
        
        let maxWidthNeeded = minWidth;
        
        buildPeriodsToShow().forEach(period => {
            const { year, semester } = parsePeriod(period);
            const key = `${year}-${semester}`;
            const periodCourses = courses[key] || [];
            
            periodCourses.forEach(course => {
                if (course.category) {
                    const categoryWidth = Math.max(minWidth, Math.min(maxWidth, course.category.length * charWidth + 20));
                    maxWidthNeeded = Math.max(maxWidthNeeded, categoryWidth);
                }
            });
        });
        
        return maxWidthNeeded;
    };

    const maxCourseTitleWidth = calculateMaxCourseTitleWidth();
    const maxCourseCodeWidth = calculateMaxCourseCodeWidth();
    const maxCategoryWidth = calculateMaxCategoryWidth();

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
                                className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md gap-2"
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
                                <div className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md gap-2"
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
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 ">Course Title</th>
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
                                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all duration-200"
                                                        placeholder="e.g., CS101"
                                                        style={{ 
                                                            width: `${maxCourseCodeWidth}px`, 
                                                            minWidth: '80px', 
                                                            maxWidth: '150px' 
                                                        }}
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
                                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all duration-200"
                                                            placeholder="Type or select category"
                                                            style={{ 
                                                                width: `${maxCategoryWidth}px`, 
                                                                minWidth: '100px', 
                                                                maxWidth: '200px' 
                                                            }}
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
                                                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center transition-all duration-200"
                                                            placeholder={titlesLoadingCategory === course.category ? 'Loading titles...' : 'Type or select title'}
                                                            style={{ 
                                                                width: `${maxCourseTitleWidth}px`, 
                                                                minWidth: '120px', 
                                                                maxWidth: '300px' 
                                                            }}
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
