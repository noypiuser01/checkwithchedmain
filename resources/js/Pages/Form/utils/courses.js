export const addCourse = (year, semester, setCourses) => {
	const courseId = Date.now();
	const newCourse = {
		id: courseId,
		courseCode: '',
		category: '',
		courseTitle: '',
		reqUnits: '',
		totalUnits: '',
		lecUnits: '',
		labUnits: '',
		prerequisites: ''
	};
	const key = year ? `${year}-${semester}` : `-${semester}`;
	setCourses(prev => ({
		...prev,
		[key]: [...(prev[key] || []), newCourse]
	}));
	setTimeout(() => {
		const newRowElement = document.querySelector(`[data-course-id="${courseId}"]`);
		if (newRowElement) {
			newRowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
			const firstInput = newRowElement.querySelector('input');
			if (firstInput) firstInput.focus();
		}
	}, 100);
};

export const createEmptyCourse = () => ({
	id: Date.now() + Math.floor(Math.random() * 1000000),
	courseCode: '',
	category: '',
	courseTitle: '',
	reqUnits: '',
	totalUnits: '',
	lecUnits: '',
	labUnits: '',
	prerequisites: ''
});

export const ensureDefaultRowsForFirstTwoYears = (courses, setCourses) => {
	const targetPeriods = [
		{ year: '1st Year', semester: '1st Semester' },
		{ year: '1st Year', semester: '2nd Semester' },
		{ year: '2nd Year', semester: '1st Semester' },
		{ year: '2nd Year', semester: '2nd Semester' },
		{ year: '3rd Year', semester: '1st Semester' },
		{ year: '3rd Year', semester: '2nd Semester' },
		{ year: '4th Year', semester: '1st Semester' },
		{ year: '4th Year', semester: '2nd Semester' }
	];
	let changed = false;
	const updates = {};
	targetPeriods.forEach(({ year, semester }) => {
		const key = `${year}-${semester}`;
		const existing = courses[key];
		if (!existing || existing.length === 0) {
			updates[key] = [createEmptyCourse()];
			changed = true;
		}
	});
	if (changed) setCourses(prev => ({ ...prev, ...updates }));
};

export const ensureDefaultRowsForYear = (courses, setCourses, getYearSemesters, year) => {
	if (!year) return;
	const semesters = getYearSemesters(year);
	let changed = false;
	const updates = {};
	semesters.forEach(semester => {
		const key = `${year}-${semester}`;
		const existing = courses[key];
		if (!existing || existing.length === 0) {
			updates[key] = [createEmptyCourse()];
			changed = true;
		}
	});
	if (changed) setCourses(prev => ({ ...prev, ...updates }));
};

export const ensureDefaultRowsForTrimestral = (courses, setCourses) => {
	const trimestralPeriods = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
	let changed = false;
	const updates = {};
	trimestralPeriods.forEach(trimester => {
		const key = `-${trimester}`;
		const existing = courses[key];
		if (!existing || existing.length === 0) {
			updates[key] = [createEmptyCourse()];
			changed = true;
		}
	});
	if (changed) setCourses(prev => ({ ...prev, ...updates }));
};

export const ensureDefaultRowsForAllYearsUpTo = (courses, setCourses, getYearSemesters, orderedYears, targetYear) => {
	if (!targetYear) return;
	const endIndex = orderedYears.indexOf(targetYear);
	if (endIndex === -1) return;
	const yearsToFill = orderedYears.slice(0, endIndex + 1);
	let changed = false;
	const updates = {};
	yearsToFill.forEach(year => {
		const semesters = getYearSemesters(year);
		semesters.forEach(semester => {
			const key = `${year}-${semester}`;
			const existing = courses[key];
			if (!existing || existing.length === 0) {
				updates[key] = [createEmptyCourse()];
				changed = true;
			}
		});
	});
	if (changed) setCourses(prev => ({ ...prev, ...updates }));
};

export const updateCourse = (year, semester, courseId, field, value, setCourses) => {
	const key = year ? `${year}-${semester}` : `-${semester}`;
	setCourses(prev => ({
		...prev,
		[key]: prev[key].map(course => course.id === courseId ? { ...course, [field]: value } : course)
	}));
};

export const removeCourse = (year, semester, courseId, setCourses) => {
	const key = year ? `${year}-${semester}` : `-${semester}`;
	setCourses(prev => ({
		...prev,
		[key]: prev[key].filter(course => course.id !== courseId)
	}));
};


