// Helper functions extracted from CmoPsgForm.jsx

export const parsePeriod = (label) => {
	if (!label) return { year: '', semester: '' };
	if (label.includes('Trimester') && !label.includes('Year')) {
		return { year: '', semester: label };
	}
	const [yearPart, semPart] = label.split(' - ');
	return { year: yearPart || '', semester: semPart || '' };
};

export const generateReferenceNo = () => {
	const now = new Date();
	const pad = (n) => String(n).padStart(2, '0');
	const y = now.getFullYear();
	const m = pad(now.getMonth() + 1);
	const d = pad(now.getDate());
	const hh = pad(now.getHours());
	const mm = pad(now.getMinutes());
	const ss = pad(now.getSeconds());
	const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
	return `CVR-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
};

export const normalizeKey = (value) => {
	if (value === null || value === undefined) return '';
	return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
};

export const lookupUnitsNormalized = (map, programName) => {
	if (!map || !programName) return 0;
	if (typeof map[programName] === 'number') return map[programName];
	const target = normalizeKey(programName);
	for (const key in map) {
		if (!Object.prototype.hasOwnProperty.call(map, key)) continue;
		const val = map[key];
		if (typeof val !== 'number') continue;
		if (normalizeKey(key) === target) return val;
	}
	return 0;
};

export const toWordYear = (year) => {
	const map = {
		'1st Year': 'First Year',
		'2nd Year': 'Second Year',
		'3rd Year': 'Third Year',
		'4th Year': 'Fourth Year',
		'5th Year': 'Fifth Year',
		'6th Year': 'Sixth Year',
	};
	return map[year] || year;
};

export const computeTotals = (courseRows) => {
	const byCategory = {};
	let totalUnits = 0;
	let totalLecUnits = 0;
	let totalLabUnits = 0;
	courseRows.forEach(row => {
		const lec = parseFloat(row.lecUnits) || 0;
		const lab = parseFloat(row.labUnits) || 0;
		const units = row.totalUnits !== '' && row.totalUnits !== null && row.totalUnits !== undefined
			? (parseFloat(row.totalUnits) || 0)
			: (lec + lab);
		totalUnits += units;
		totalLecUnits += lec;
		totalLabUnits += lab;
		const cat = row.category || 'Uncategorized';
		byCategory[cat] = (byCategory[cat] || 0) + units;
	});
	return { totalUnits, totalLecUnits, totalLabUnits, byCategory };
};

export const formatUnitsDisplay = (value) => {
	if (value === '' || value === null || value === undefined) return '';
	const num = parseFloat(value);
	if (Number.isNaN(num)) return value;
	const rounded = Math.round(num);
	if (Math.abs(num - rounded) < 1e-9) return String(rounded);
	return String(num);
};

export const getYearSemesters = (year) => {
	const yearMap = {
		'1st Year': ['1st Semester', '2nd Semester'],
		'2nd Year': ['1st Semester', '2nd Semester'],
		'3rd Year': ['1st Semester', '2nd Semester'],
		'4th Year': ['1st Semester', '2nd Semester'],
		'5th Year': ['1st Semester', '2nd Semester'],
		'6th Year': ['1st Semester', '2nd Semester']
	};
	return yearMap[year] || [];
};


