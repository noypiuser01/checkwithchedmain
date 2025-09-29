export default function CourseRow({
	year,
	semester,
	course,
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
							fetchTitlesForCategory(value);
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
							const availableTitles = titles.filter(title => !selectedTitles.includes(title) || title === currentCourseTitle);
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
	);
}


