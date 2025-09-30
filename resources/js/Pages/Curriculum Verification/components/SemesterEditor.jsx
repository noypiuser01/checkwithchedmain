import CourseRow from './CourseRow';

export default function SemesterEditor({
	year,
	semester,
	periodCourses,
	addCourse,
	updateCourse,
	removeCourse,
	getCategoriesForCMO,
	fetchTitlesForCategory,
	titlesLoadingCategory,
	getTitlesForCategory,
	getAllSelectedCourseTitles,
	fetchPrerequisitesForCourse,
	formatUnitsDisplay
}) {
	return (
		<div className="mb-6 last:mb-0">
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
					<svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					<span>Add Row</span>
				</button>
			</div>

			{periodCourses.length === 0 ? (
				<div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-blue-200">
					<h4 className="text-lg font-medium text-gray-700 mb-2">Ready to add courses?</h4>
					<p className="text-gray-600 mb-4">Start building your curriculum by adding course rows</p>
					<div className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md gap-2" onClick={() => addCourse(year, semester)}>
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
								<CourseRow
									key={course.id}
									year={year}
									semester={semester}
									course={course}
									updateCourse={updateCourse}
									removeCourse={removeCourse}
									getCategoriesForCMO={getCategoriesForCMO}
									fetchTitlesForCategory={fetchTitlesForCategory}
									titlesLoadingCategory={titlesLoadingCategory}
									getTitlesForCategory={getTitlesForCategory}
									getAllSelectedCourseTitles={getAllSelectedCourseTitles}
									fetchPrerequisitesForCourse={fetchPrerequisitesForCourse}
									formatUnitsDisplay={formatUnitsDisplay}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}


