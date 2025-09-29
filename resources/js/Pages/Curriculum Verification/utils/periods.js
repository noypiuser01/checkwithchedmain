export const buildPeriodsToShow = (selectedYear, selectedSemester, orderedYears, trimestralPeriods) => {
	const isTrimestral = selectedSemester === '2nd Semester';
	if (isTrimestral) {
		return trimestralPeriods;
	}
	const defaultPeriods = [
		'1st Year - 1st Semester',
		'1st Year - 2nd Semester',
		'2nd Year - 1st Semester',
		'2nd Year - 2nd Semester',
		'3rd Year - 1st Semester',
		'3rd Year - 2nd Semester',
		'4th Year - 1st Semester',
		'4th Year - 2nd Semester'
	];
	if (!selectedYear) return defaultPeriods;
	const endIndex = orderedYears.indexOf(selectedYear);
	if (endIndex === -1) return defaultPeriods;
	const yearsToUse = orderedYears.slice(0, endIndex + 1);
	const allSemesters = ['1st Semester', '2nd Semester'];
	const semesters = selectedSemester ? [selectedSemester] : allSemesters;
	return yearsToUse.flatMap(year => semesters.map(sem => `${year} - ${sem}`));
};

export const getDisplayedPeriods = (selectedYear, selectedSemester, orderedYears, trimestralPeriods, parsePeriod) => {
	const list = buildPeriodsToShow(selectedYear, selectedSemester, orderedYears, trimestralPeriods);
	return list.map(label => {
		const { year, semester } = parsePeriod(label);
		return { year, semester, key: `${year}-${semester}` };
	});
};

export const collectDisplayedCourses = (courses, displayedPeriods) => {
	const collected = [];
	displayedPeriods.forEach(({ year, semester, key }) => {
		(courses[key] || []).forEach(course => {
			collected.push({ ...course, year, semester });
		});
	});
	return collected;
};

export const collectDisplayedCoursesByProgram = (courses, displayedPeriods, cmoReferences, programCoursesCacheByCmo, programName) => {
	if (!programName) return collectDisplayedCourses(courses, displayedPeriods);
	const collected = [];
	const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
	const programData = programCoursesCacheByCmo[key] || [];
	const programInfo = programData.find(p => p.program_name === programName);
	if (!programInfo || !programInfo.course_details) return collected;
	const courseDetailsMap = programInfo.course_details;
	displayedPeriods.forEach(({ year, semester, key }) => {
		(courses[key] || []).forEach(course => {
			const courseCode = course.courseCode?.trim();
			if (courseCode && courseDetailsMap[courseCode]) {
				const dbCourse = courseDetailsMap[courseCode];
				collected.push({
					...course,
					year,
					semester,
					totalUnits: dbCourse.total_units,
					lecUnits: dbCourse.lec_units,
					labUnits: dbCourse.lab_units,
					reqUnits: course.reqUnits,
				});
			}
		});
	});
	return collected;
};


