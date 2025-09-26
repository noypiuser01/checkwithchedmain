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
					className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200 cursor-pointer" onClick={() => addCourse(year, semester)}>
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


