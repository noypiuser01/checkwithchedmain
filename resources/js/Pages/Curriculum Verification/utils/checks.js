import { orderedYears } from '../utils/constants';
import { computeTotals, formatUnitsDisplay } from '../utils/helpers';

export const checkMissingPrerequisites = (collectDisplayedCourses, coursePrerequisites) => {
	const allCourses = collectDisplayedCourses();
	const missingPrerequisites = [];

	const getSemesterIndex = (year, semester) => {
		const yearIndex = orderedYears.indexOf(year);
		const semesterIndex = semester === '1st Semester' ? 0 : 1;
		return yearIndex * 2 + semesterIndex;
	};

	allCourses.forEach(course => {
		const courseCode = course.courseCode?.trim();
		if (courseCode && coursePrerequisites[courseCode]) {
			const dbPrereq = coursePrerequisites[courseCode].prereq;
			const dbPrereqTitle = coursePrerequisites[courseCode].prereq_title;
			if (dbPrereq) {
				const prereqCode = dbPrereq.split(' ')[0];
				const prereqCourse = allCourses.find(c => c.courseCode?.trim().toLowerCase() === prereqCode.toLowerCase());
				if (!prereqCourse) {
					missingPrerequisites.push({
						courseCode: courseCode,
						courseTitle: course.courseTitle,
						missingPrereq: dbPrereq,
						missingPrereqTitle: dbPrereqTitle || dbPrereq,
						year: course.year,
						semester: course.semester,
						issue: 'missing',
						source: 'database'
					});
				} else {
					const courseSemesterIndex = getSemesterIndex(course.year, course.semester);
					const prereqSemesterIndex = getSemesterIndex(prereqCourse.year, prereqCourse.semester);
					if (prereqSemesterIndex >= courseSemesterIndex) {
						missingPrerequisites.push({
							courseCode: courseCode,
							courseTitle: course.courseTitle,
							missingPrereq: dbPrereq,
							missingPrereqTitle: dbPrereqTitle || dbPrereq,
							year: course.year,
							semester: course.semester,
							prereqYear: prereqCourse.year,
							prereqSemester: prereqCourse.semester,
							issue: 'order',
							source: 'database'
						});
					}
				}
			}
		}
	});

	return missingPrerequisites;
};

export const checkMissingReqUnits = (collectDisplayedCourses) => {
	const allCourses = collectDisplayedCourses();
	const missing = [];
	allCourses.forEach(course => {
		const value = course.reqUnits;
		if (value === undefined || value === null || String(value).trim() === '') {
			missing.push({
				courseCode: course.courseCode,
				courseTitle: course.courseTitle,
				year: course.year,
				semester: course.semester
			});
		}
	});
	return missing;
};

export const checkReqUnitsTotalIssues = (collectDisplayedCourses) => {
	const allCourses = collectDisplayedCourses();
	const issues = [];
	allCourses.forEach(course => {
		const reqRaw = String(course.reqUnits ?? '').trim();
		if (reqRaw === '') return;
		const totalRaw = String(course.totalUnits ?? '').trim();
		const reqNum = parseFloat(reqRaw);
		if (totalRaw === '') {
			issues.push({
				type: 'missing_total',
				courseCode: course.courseCode || '—',
				courseTitle: course.courseTitle || 'Untitled',
				year: course.year,
				semester: course.semester,
				required: reqRaw
			});
			return;
		}
		const totalNum = parseFloat(totalRaw);
		if (!Number.isNaN(reqNum) && !Number.isNaN(totalNum) && Math.abs(totalNum - reqNum) > 1e-9) {
			issues.push({
				type: 'mismatch',
				courseCode: course.courseCode || '—',
				courseTitle: course.courseTitle || 'Untitled',
				year: course.year,
				semester: course.semester,
				required: reqNum,
				provided: totalNum
			});
		}
	});
	return issues;
};

export const checkCoursesWithExtraUnits = (collectDisplayedCourses) => {
	const allCourses = collectDisplayedCourses();
	const extraUnitsCourses = [];
	allCourses.forEach(course => {
		const reqRaw = String(course.reqUnits ?? '').trim();
		const totalRaw = String(course.totalUnits ?? '').trim();
		if (reqRaw === '' || totalRaw === '') return;
		const reqNum = parseFloat(reqRaw);
		const totalNum = parseFloat(totalRaw);
		if (!Number.isNaN(reqNum) && !Number.isNaN(totalNum) && totalNum > reqNum) {
			const extraUnits = totalNum - reqNum;
			extraUnitsCourses.push({
				courseCode: course.courseCode || '—',
				courseTitle: course.courseTitle || 'Untitled',
				year: course.year,
				semester: course.semester,
				required: reqNum,
				provided: totalNum,
				extraUnits: extraUnits
			});
		}
	});
	return extraUnitsCourses;
};


