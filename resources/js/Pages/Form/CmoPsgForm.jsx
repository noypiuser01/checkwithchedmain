import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function CmoPsg() {
    const [cmoReferences, setCmoReferences] = useState([]);
    const [programName, setProgramName] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [courses, setCourses] = useState({});
    const [availableCurricula, setAvailableCurricula] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [titlesCacheByCategory, setTitlesCacheByCategory] = useState({});
    const [titlesLoadingCategory, setTitlesLoadingCategory] = useState('');
    const [categoriesCacheByCmo, setCategoriesCacheByCmo] = useState({});
    const [categoriesLoadingKey, setCategoriesLoadingKey] = useState('');
    const [programNamesCacheByCmo, setProgramNamesCacheByCmo] = useState({});
    const [programNamesLoadingKey, setProgramNamesLoadingKey] = useState('');
    const [programTotalsCacheByCmo, setProgramTotalsCacheByCmo] = useState({});
    const [programTotalsLoadingKey, setProgramTotalsLoadingKey] = useState('');
    const [programProvidedCacheByCmo, setProgramProvidedCacheByCmo] = useState({});
    const [programProvidedLoadingKey, setProgramProvidedLoadingKey] = useState('');
    const [programCoursesCacheByCmo, setProgramCoursesCacheByCmo] = useState({});
    const [programCoursesLoadingKey, setProgramCoursesLoadingKey] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [coursePrerequisites, setCoursePrerequisites] = useState({});
    const [prerequisitesLoading, setPrerequisitesLoading] = useState(false);
    const [institutions, setInstitutions] = useState([]);
    const [institutionsLoading, setInstitutionsLoading] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [institutionSearchQuery, setInstitutionSearchQuery] = useState('');
    const [showInstitutionSuggestions, setShowInstitutionSuggestions] = useState(false);
    const [facultyName, setFacultyName] = useState('');
    const [position, setPosition] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [referenceNo, setReferenceNo] = useState('');
    const institutionRef = useRef(null);
    const programNameRef = useRef(null);
    const facultyNameRef = useRef(null);
    const positionRef = useRef(null);

    useEffect(() => {
        const validPrograms = new Set(getProgramNamesForCMO());
        if (programName && !validPrograms.has(programName)) {
            setProgramName('');
        }
       
    }, [JSON.stringify(cmoReferences), availableCurricula.length]);

    const periods = [
        '1st Year - 1st Semester',
        '1st Year - 2nd Semester',
        '2nd Year - 1st Semester',
        '2nd Year - 2nd Semester',
        '3rd Year - 1st Semester',
        '3rd Year - 2nd Semester',
        '4th Year - 1st Semester',
        '4th Year - 2nd Semester',
        '5th Year - 1st Semester',
        '5th Year - 2nd Semester',
        '6th Year - 1st Semester',
        '6th Year - 2nd Semester'
    ];

    const trimestralPeriods = [
        '1st Trimester',
        '2nd Trimester',
        '3rd Trimester'
    ];

    const parsePeriod = (label) => {
        if (!label) return { year: '', semester: '' };
        
        if (label.includes('Trimester') && !label.includes('Year')) {
            return { year: '', semester: label };
        }
        
        const [yearPart, semPart] = label.split(' - ');
        return { year: yearPart || '', semester: semPart || '' };
    };

    const orderedYears = [
        '1st Year',
        '2nd Year',
        '3rd Year',
        '4th Year',
        '5th Year',
        '6th Year'
    ];

    const generateReferenceNo = () => {
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

    const normalizeKey = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const lookupUnitsNormalized = (map, programName) => {
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

    const buildPeriodsToShow = () => {

        const isTrimestral = selectedSemester === '2nd Semester'; 
        
        if (isTrimestral) {
            
            return trimestralPeriods;
        } else {
            
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
        }
    };


    const getCategoriesForCMO = () => {
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        return categoriesCacheByCmo[key] || [];
    };

    const fetchCategoriesForCmo = async () => {
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (categoriesCacheByCmo[key]) return;
        try {
            setCategoriesLoadingKey(key);
            const response = await axios.get('/api/cmo-categories', {
                params: { cmo: cmoReferences }
            });
            const categories = Array.isArray(response.data) ? response.data : [];
            setCategoriesCacheByCmo(prev => ({ ...prev, [key]: categories }));
        } catch (err) {
            console.error('Error fetching categories for CMO', cmoReferences, err);
            setCategoriesCacheByCmo(prev => ({ ...prev, [key]: [] }));
        } finally {
            setCategoriesLoadingKey('');
        }
    };

    const fetchProgramNamesForCmo = async () => {
        if (cmoReferences.length === 0) return;
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (programNamesCacheByCmo[key]) return;
        try {
            setProgramNamesLoadingKey(key);
            const response = await axios.get('/api/cmo-program-names', {
                params: { cmo: cmoReferences }
            });
            const programNames = Array.isArray(response.data) ? response.data : [];
            setProgramNamesCacheByCmo(prev => ({ ...prev, [key]: programNames }));

            // Also fetch and cache per individual CMO reference for grouped display
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => axios.get('/api/cmo-program-names', { params: { cmo: ref } }).catch(() => ({ data: [] })))
            );
            const perRefEntries = perRefResponses.reduce((acc, res, idx) => {
                const refKey = cmoReferences[idx];
                const list = Array.isArray(res.data) ? res.data : [];
                acc[refKey] = list;
                return acc;
            }, {});
            setProgramNamesCacheByCmo(prev => ({ ...prev, ...perRefEntries }));
        } catch (err) {
            console.error('Error fetching program names for CMO', cmoReferences, err);
            setProgramNamesCacheByCmo(prev => ({ ...prev, [key]: [] }));
        } finally {
            setProgramNamesLoadingKey('');
        }
    };

    const fetchProgramTotalsForCmo = async () => {
        if (cmoReferences.length === 0) return;
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (programTotalsCacheByCmo[key]) return;
        try {
            setProgramTotalsLoadingKey(key);
            const response = await axios.get('/api/cmo-program-totals', {
                params: { cmo: cmoReferences }
            });
            const rows = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            // Expect schema grouped by program_name with total_units
            const map = rows.reduce((acc, row) => {
                const name = (row.program_name || '').trim();
                const unitsRaw = row.total_units;
                const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                if (name) acc[name] = Number.isFinite(units) ? units : 0;
                return acc;
            }, {});
            setProgramTotalsCacheByCmo(prev => ({ ...prev, [key]: map }));

            // Also fetch and cache per individual CMO reference for grouped display
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => axios.get('/api/cmo-program-totals', { params: { cmo: ref } }).catch(() => ({ data: [] })))
            );
            const perRefEntries = perRefResponses.reduce((acc, res, idx) => {
                const refKey = cmoReferences[idx];
                const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                const inner = list.reduce((m, row) => {
                    const name = (row.program_name || '').trim();
                    const unitsRaw = row.total_units;
                    const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                    if (name) m[name] = Number.isFinite(units) ? units : 0;
                    return m;
                }, {});
                acc[refKey] = inner;
                return acc;
            }, {});
            setProgramTotalsCacheByCmo(prev => ({ ...prev, ...perRefEntries }));
        } catch (err) {
            console.error('Error fetching program totals for CMO', cmoReferences, err);
            setProgramTotalsCacheByCmo(prev => ({ ...prev, [key]: {} }));
        } finally {
            setProgramTotalsLoadingKey('');
        }
    };


    useEffect(() => {
       
        fetchCategoriesForCmo();
        if (cmoReferences.length > 0) {
            fetchProgramNamesForCmo();
            fetchProgramTotalsForCmo();
            fetchProgramProvidedTotalsForCmo();
        }
       
    }, [JSON.stringify(cmoReferences)]);


    const getProgramNamesForCMO = () => {
        if (cmoReferences.length === 0) {
            return [];
        }

        const filteredCurricula = availableCurricula.filter(curriculum => 
            cmoReferences.includes(curriculum.curriculum_name)
        );

        const uniquePrograms = [...new Set(filteredCurricula.map(curriculum => curriculum.program_name))];
        
        return uniquePrograms;
    };

    const fetchProgramProvidedTotalsForCmo = async () => {
        if (cmoReferences.length === 0) return;
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (programProvidedCacheByCmo[key]) return;
        try {
            setProgramProvidedLoadingKey(key);
            // Combined selection
            const response = await axios.get('/api/curriculum-program-totals', {
                params: { cmo: cmoReferences }
            });
            const rows = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            // Expect schema grouped by program_name with total_units
            const map = rows.reduce((acc, row) => {
                const name = (row.program_name || '').trim();
                const unitsRaw = row.total_units;
                const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                if (name) acc[name] = Number.isFinite(units) ? units : 0;
                return acc;
            }, {});
            setProgramProvidedCacheByCmo(prev => ({ ...prev, [key]: map }));

            // Per individual CMO
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => axios.get('/api/curriculum-program-totals', { params: { cmo: ref } }).catch(() => ({ data: [] })))
            );
            const perRefEntries = perRefResponses.reduce((acc, res, idx) => {
                const refKey = cmoReferences[idx];
                const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                const inner = list.reduce((m, row) => {
                    const name = (row.program_name || '').trim();
                    const unitsRaw = row.total_units;
                    const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                    if (name) m[name] = Number.isFinite(units) ? units : 0;
                    return m;
                }, {});
                acc[refKey] = inner;
                return acc;
            }, {});
            setProgramProvidedCacheByCmo(prev => ({ ...prev, ...perRefEntries }));
        } catch (err) {
            console.error('Error fetching provided totals for CMO', cmoReferences, err);
            setProgramProvidedCacheByCmo(prev => ({ ...prev, [key]: {} }));
        } finally {
            setProgramProvidedLoadingKey('');
        }
    };

    const fetchProgramCoursesForCmo = async (programName) => {
        if (cmoReferences.length === 0 || !programName) return;
        const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
        if (programCoursesCacheByCmo[key]) return;
        try {
            setProgramCoursesLoadingKey(key);
            const response = await axios.get('/api/cmo-program-courses', {
                params: { cmo: cmoReferences, program: programName }
            });
            const data = Array.isArray(response.data) ? response.data : [];
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: data }));
        } catch (err) {
            console.error('Error fetching program courses for CMO', cmoReferences, programName, err);
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: [] }));
        } finally {
            setProgramCoursesLoadingKey('');
        }
    };

    const fetchTitlesForCategory = async (category) => {
        if (!category || cmoReferences.length === 0) return;
        const cacheKey = `${category}__${cmoReferences.sort().join('|')}`;
        if (titlesCacheByCategory[cacheKey]) return;
        try {
            setTitlesLoadingCategory(category);
            const response = await axios.get('/api/cmo-category-titles', {
                params: { cmo: cmoReferences, category }
            });
            const titles = Array.isArray(response.data) ? response.data : [];
            setTitlesCacheByCategory(prev => ({ ...prev, [cacheKey]: titles }));
        } catch (err) {
            console.error('Error fetching titles for category', category, err);
            setTitlesCacheByCategory(prev => ({ ...prev, [cacheKey]: [] }));
        } finally {
            setTitlesLoadingCategory('');
        }
    };

    const getTitlesForCategory = (category) => {
        if (!category) return [];
        const cacheKey = `${category}__${cmoReferences.slice().sort().join('|')}`;
        return titlesCacheByCategory[cacheKey] || [];
    };

    const fetchCourseCode = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return '';
        try {
            const response = await axios.get('/api/course-code-by-title', {
                params: { 
                    title: title,
                    category: category,
                    cmo: cmoReferences
                }
            });
            return response.data || '';
        } catch (err) {
            console.error('Error fetching course code for title', title, err);
            return '';
        }
    };

    const fetchCourseDetails = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return null;
        try {
            const response = await axios.get('/api/course-details-by-title', {
                params: { 
                    title: title,
                    category: category,
                    cmo: cmoReferences
                }
            });
            return response.data || null;
        } catch (err) {
            console.error('Error fetching course details for title', title, err);
            return null;
        }
    };

    const fetchPrerequisitesForCourse = async (year, semester, courseId, courseTitle, category) => {
        console.log('🔍 fetchPrerequisitesForCourse called:', { courseTitle, category, cmoReferences });
        
        if (courseTitle && category && cmoReferences.length > 0) {
            try {
                console.log('📝 Fetching course details for:', courseTitle, category);
                const courseDetails = await fetchCourseDetails(courseTitle, category);
                console.log('📝 Course details result:', courseDetails);
                
                if (courseDetails) {
                    
                    if (courseDetails.code) {
                        updateCourse(year, semester, courseId, 'courseCode', courseDetails.code);
                    }
                    
                    if (courseDetails.total_units && courseDetails.total_units !== 'NULL' && courseDetails.total_units.trim() !== '') {
                        console.log('✅ Auto-filling required units from database:', courseDetails.total_units);
                        updateCourse(year, semester, courseId, 'reqUnits', courseDetails.total_units);
                    } else {
                        console.log('❌ No required units found in database for course:', courseDetails.code || courseTitle);
                    }
                    
                    
                    if (courseDetails.prereq && courseDetails.prereq !== 'NULL' && courseDetails.prereq.trim() !== '') {
                        console.log('✅ Auto-filling prerequisites from database:', courseDetails.prereq);
                        updateCourse(year, semester, courseId, 'prerequisites', courseDetails.prereq);
                    } else {
                        console.log('❌ No prerequisite found in database for course:', courseDetails.code || courseTitle);
                    }
                } else {
                    console.log('❌ No course details found for:', courseTitle, category);
                }
            } catch (err) {
                console.error('❌ Error fetching prerequisites for course', err);
            }
        } else {
            console.log('❌ Conditions not met:', { 
                hasTitle: !!courseTitle, 
                hasCategory: !!category, 
                hasCmoReferences: cmoReferences.length > 0 
            });
        }
    };

    const fetchCoursePrerequisites = async (courseCodes) => {
        if (!courseCodes || courseCodes.length === 0 || cmoReferences.length === 0) return;
        try {
            setPrerequisitesLoading(true);
            
            
            const prereqData = {};
            
            for (const courseCode of courseCodes) {
                try {
                    
                    const response = await axios.get('/api/course-details-by-code', {
                        params: { 
                            code: courseCode,
                            cmo: cmoReferences
                        }
                    });
                    
                    if (response.data && response.data.prereq && response.data.prereq !== 'NULL' && response.data.prereq.trim() !== '') {
                        const prereqCode = response.data.prereq.split(' ')[0]; 
                        
                        
                        let prereqTitle = response.data.prereq_title || response.data.prereq;
                        try {
                            const prereqResponse = await axios.get('/api/course-details-by-code', {
                                params: { 
                                    code: prereqCode,
                                    cmo: cmoReferences
                                }
                            });
                            if (prereqResponse.data && prereqResponse.data.title) {
                                prereqTitle = prereqResponse.data.title;
                            }
                        } catch (err) {
                            console.error(`Error fetching prerequisite title for ${prereqCode}:`, err);
                        }
                        
                        prereqData[courseCode] = {
                            prereq: response.data.prereq,
                            prereq_title: prereqTitle
                        };
                    }
                } catch (err) {
                    console.error(`Error fetching prerequisite for ${courseCode}:`, err);
                }
            }
            
            setCoursePrerequisites(prereqData);
        } catch (err) {
            console.error('Error fetching course prerequisites', err);
            setCoursePrerequisites({});
        } finally {
            setPrerequisitesLoading(false);
        }
    };

    const checkMissingPrerequisites = () => {
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
                    
                    
                    const prereqCourse = allCourses.find(c => 
                        c.courseCode?.trim().toLowerCase() === prereqCode.toLowerCase()
                    );
                    
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

	const checkMissingReqUnits = () => {
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

	const checkReqUnitsTotalIssues = () => {
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

	const checkCoursesWithExtraUnits = () => {
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


    const fetchInstitutions = async () => {
        try {
            setInstitutionsLoading(true);
            const response = await axios.get('/heis');
            const institutionData = Array.isArray(response.data) ? response.data : [];
            setInstitutions(institutionData);
        } catch (error) {
            console.error('Error fetching institutions:', error);
            setInstitutions([]);
        } finally {
            setInstitutionsLoading(false);
        }
    };

    const getFilteredInstitutions = () => {
        if (!institutionSearchQuery.trim()) {
            return institutions.slice(0, 10); 
        }
        
        const query = institutionSearchQuery.toLowerCase().trim();
        return institutions
            .filter(institution => 
                institution.instName && 
                institution.instName.toLowerCase().includes(query)
            )
            .slice(0, 10); 
    };


    const handleInstitutionSelect = (institution) => {
        setSelectedInstitution(institution.instName);
        setInstitutionSearchQuery(institution.instName);
        setShowInstitutionSuggestions(false);
        clearValidationError('institution');
    };

    const handleInstitutionInputChange = (e) => {
        const value = e.target.value;
        setInstitutionSearchQuery(value);
        setSelectedInstitution(value);
        setShowInstitutionSuggestions(true);
        clearValidationError('institution');
    };

    const handleInstitutionInputBlur = () => {
        
        setTimeout(() => {
            setShowInstitutionSuggestions(false);
        }, 200);
    };

    const validateRequiredFields = () => {
        const errors = {};
        
        if (!facultyName.trim()) {
            errors.facultyName = 'Faculty Name is required';
        }
        
        if (!selectedInstitution.trim()) {
            errors.institution = 'Institute is required';
        }
        
        if (!position.trim()) {
            errors.position = 'Position is required';
        }
        
        if (cmoReferences.length === 0) {
            errors.cmoReferences = 'CMO/PSG References is required';
        }
        
        if (!programName.trim()) {
            errors.programName = 'Program Name is required';
        }
        
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            scrollToFirstEmptyField(errors);
        }
        
        return Object.keys(errors).length === 0;
    };

    const scrollToFirstEmptyField = (errors) => {
        
        if (errors.facultyName && facultyNameRef.current) {
            facultyNameRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            setTimeout(() => {
                const input = facultyNameRef.current.querySelector('input');
                if (input) {
                    input.focus();
                }
            }, 500);
            return;
        }
        
        if (errors.institution && institutionRef.current) {
            institutionRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            setTimeout(() => {
                const input = institutionRef.current.querySelector('input');
                if (input) {
                    input.focus();
                }
            }, 500);
            return;
        }
        
        if (errors.position && positionRef.current) {
            positionRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            setTimeout(() => {
                const input = positionRef.current.querySelector('input');
                if (input) {
                    input.focus();
                }
            }, 500);
            return;
        }
        
        if (errors.cmoReferences) {
          
            const cmoSection = document.querySelector('[data-cmo-section]');
            if (cmoSection) {
                cmoSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                setTimeout(() => {
                    const select = cmoSection.querySelector('select');
                    if (select) {
                        select.focus();
                    }
                }, 500);
            }
            return;
        }
        
        if (errors.programName && programNameRef.current) {
            programNameRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            setTimeout(() => {
                const input = programNameRef.current.querySelector('input');
                if (input) {
                    input.focus();
                }
            }, 500);
        }
    };

    const clearValidationError = (field) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    useEffect(() => {
        fetchCurricula();
        fetchInstitutions();
        
        ensureDefaultRowsForFirstTwoYears();
    }, []);

    useEffect(() => {
        setTitlesCacheByCategory({});
    }, [JSON.stringify(cmoReferences.sort())]);

    useEffect(() => {
        if (showVerifyModal && cmoReferences.length > 0) {
            const allCourses = collectDisplayedCourses();
            const courseCodes = allCourses
                .map(course => course.courseCode?.trim())
                .filter(code => code && code !== '');
            
            if (courseCodes.length > 0) {
                fetchCoursePrerequisites(courseCodes);
            }

            // Fetch program courses for each program in the selected CMO references
            const cmoKey = cmoReferences.slice().sort().join('|');
            const programList = programNamesCacheByCmo[cmoKey] || [];
            programList.forEach(programName => {
                fetchProgramCoursesForCmo(programName);
            });
        }
    }, [showVerifyModal, JSON.stringify(cmoReferences)]);

    const fetchCurricula = async () => {
        try {
            setLoading(true);
            console.log('Fetching curricula from /api/curricula...');
            const response = await axios.get('/api/curricula');
            console.log('API Response:', response.data);
            
           
            const uniqueCurricula = response.data.reduce((acc, curriculum) => {
                const name = (curriculum.curriculum_name || '').trim();
                const key = name.toLowerCase();
                if (!acc[key]) {
                    acc[key] = {
                        id: curriculum.id,
                        curriculum_name: name,
                        program_name: curriculum.program_name
                    };
                }
                return acc;
            }, {});

           
            const processedCurricula = Object.values(uniqueCurricula).sort((a, b) => {
                return a.curriculum_name.localeCompare(b.curriculum_name);
            });
            
            console.log('Processed curricula:', processedCurricula);
            setAvailableCurricula(processedCurricula);
        } catch (error) {
            console.error('Error fetching curricula:', error);
        } finally {
            setLoading(false);
        }
    };


    const addCourse = (year, semester) => {
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
                newRowElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            
                const firstInput = newRowElement.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }, 100);
    };

	const createEmptyCourse = () => ({
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

	const ensureDefaultRowsForFirstTwoYears = () => {
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
		if (changed) {
			setCourses(prev => ({ ...prev, ...updates }));
		}
	};

	const ensureDefaultRowsForYear = (year) => {
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
		
		if (changed) {
			setCourses(prev => ({ ...prev, ...updates }));
		}
	};

	const ensureDefaultRowsForTrimestral = () => {
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
		
		if (changed) {
			setCourses(prev => ({ ...prev, ...updates }));
		}
	};

	const ensureDefaultRowsForAllYearsUpTo = (targetYear) => {
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
		
		if (changed) {
			setCourses(prev => ({ ...prev, ...updates }));
		}
	};

    const updateCourse = (year, semester, courseId, field, value) => {
        const key = year ? `${year}-${semester}` : `-${semester}`;
        setCourses(prev => ({
            ...prev,
            [key]: prev[key].map(course => 
                course.id === courseId ? { ...course, [field]: value } : course
            )
        }));
    };

    const removeCourse = (year, semester, courseId) => {
        const key = year ? `${year}-${semester}` : `-${semester}`;
        setCourses(prev => ({
            ...prev,
            [key]: prev[key].filter(course => course.id !== courseId)
        }));
    };

    const getYearSemesters = (year) => {
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

	const toWordYear = (year) => {
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

	
	const getDisplayedPeriods = () => {
		const list = buildPeriodsToShow();
		return list.map(label => {
			const { year, semester } = parsePeriod(label);
			return { year, semester, key: `${year}-${semester}` };
		});
	};

	const collectDisplayedCourses = () => {
		const periods = getDisplayedPeriods();
		const collected = [];
		periods.forEach(({ year, semester, key }) => {
			(courses[key] || []).forEach(course => {
				collected.push({ ...course, year, semester });
			});
		});
		return collected;
	};

	const collectDisplayedCoursesByProgram = (programName) => {
		if (!programName) return collectDisplayedCourses();
		
		const periods = getDisplayedPeriods();
		const collected = [];
		const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
		const programData = programCoursesCacheByCmo[key] || [];
		
		// Get the first program data (since we're filtering by program name)
		const programInfo = programData.find(p => p.program_name === programName);
		if (!programInfo || !programInfo.course_details) return collected;
		
		// Create a map of course codes to their database details
		const courseDetailsMap = programInfo.course_details;
		
		periods.forEach(({ year, semester, key }) => {
			(courses[key] || []).forEach(course => {
				const courseCode = course.courseCode?.trim();
				// Check if the course code exists in the program's curriculum
				if (courseCode && courseDetailsMap[courseCode]) {
					const dbCourse = courseDetailsMap[courseCode];
					// Use the database units instead of user input units
					collected.push({ 
						...course, 
						year, 
						semester,
						// Override with database units
						totalUnits: dbCourse.total_units,
						lecUnits: dbCourse.lec_units,
						labUnits: dbCourse.lab_units,
						// Keep user input for required units as that's what they need to provide
						reqUnits: course.reqUnits
					});
				}
			});
		});
		return collected;
	};

	const getDatabaseUnitsForProgram = (programName) => {
		if (!programName) return 0;
		
		const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
		const programData = programCoursesCacheByCmo[key] || [];
		
		// Get the program data
		const programInfo = programData.find(p => p.program_name === programName);
		if (!programInfo) return 0;
		
		// Return the total units from the database for this program
		return programInfo.total_units || 0;
	};

	const getUserUnitsForProgram = (programName) => {
		if (!programName) return 0;
		
		// Get courses filtered by program name (only those that exist in database)
		const list = collectDisplayedCoursesByProgram(programName);
		const { totalUnits } = computeTotals(list);
		return totalUnits || 0;
	};

	const getProgramComparison = (programName) => {
		const databaseUnits = getDatabaseUnitsForProgram(programName);
		const userUnits = getUserUnitsForProgram(programName);
		const difference = userUnits - databaseUnits;
		
		return {
			programName,
			databaseUnits,
			userUnits,
			difference,
			isComplete: userUnits >= databaseUnits,
			isExact: Math.abs(difference) < 0.01, // Allow for small floating point differences
			status: userUnits > databaseUnits ? 'excess' : 
					userUnits < databaseUnits ? 'deficient' : 'exact'
		};
	};

    const formatUnitsDisplay = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        const num = parseFloat(value);
        if (Number.isNaN(num)) return value;
        const rounded = Math.round(num);
        if (Math.abs(num - rounded) < 1e-9) return String(rounded);
        return String(num);
    };

    const computeTotals = (courseRows) => {
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

	const validateUnitsPerSemester = (courseRows) => {
		const { totalUnits } = computeTotals(courseRows);
		return {
			isValid: true,
			totalUnits: totalUnits,
			exceedsLimit: false,
			remainingUnits: 0
		};
	};

	const getAllSelectedCourseTitles = () => {
		const allCourses = collectDisplayedCourses();
		return allCourses
			.map(course => course.courseTitle?.trim())
			.filter(title => title && title !== '');
	};

	const modalContentRef = useRef(null);

    const handleExport = async () => {
        const htmlContent = modalContentRef.current ? modalContentRef.current.innerHTML : '';
		const headerInstitution = (selectedInstitution || '').trim() || 'ACLC COLLEGE OF MARBEL';
		const headerCmo = (cmoReferences && cmoReferences.length > 0) ? cmoReferences.join(', ') : '';
		const headerProgram = (programName || '').trim() || 'BSIT Bachelor Science Information Technology';
		const headerHTML = `
			<div class="print-header" style="margin-bottom:16px; text-align:center; color:#000;">
				<div style="font-size:18px;font-weight:700;color:#000;margin-bottom:32px;">Curriculum Verification Report</div>
				<div style="display:flex;justify-content:space-between;max-width:800px;margin:0 auto;">
					<div style="text-align:left;">
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">Faculty Name</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${facultyName || 'Not specified'}</span>
						</div>
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">Position</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${position || 'Not specified'}</span>
						</div>
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">Institute</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${selectedInstitution || 'Not specified'}</span>
						</div>
					</div>
					<div style="text-align:left;">
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">Program Name</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${programName || 'Not specified'}</span>
						</div>
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">References No.</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${referenceNo || ''}</span>
						</div>
						<div style="display:flex;font-size:12px;line-height:1;">
							<span style="font-weight:600;color:#000;">Date Generated</span>
							<span style="width:8px;text-align:center;">:</span>
							<span style="margin-left:4px;color:#000;">${new Date().toLocaleDateString('en-US', { 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}</span>
						</div>
					</div>
				</div>
			</div>
		`;

		const footerHTML = `
			<div class="print-footer" style="margin-top:24px; text-align:center; color:#000; padding-top:12px; border-top:1px solid #000;">
				<div style="font-size:10px;color:#000;margin-bottom:4px;">
					CHED Regional Office XII, Regional Center, Brgy. Carpenter Hill, Koronadal City, South Cotabato, Philippines
				</div>
				<div style="font-size:9px;color:#000;">
					Tel. No.: (083) 228-1130 | Email: chedro12@ched.gov.ph / Website: ched.gov.ph
				</div>
			</div>
		`;
        // First, persist the report in the backend
        try {
            await axios.post('/api/curriculum-reports', {
                reference_no: referenceNo || generateReferenceNo(),
                faculty_name: facultyName || null,
                position: position || null,
                institute: selectedInstitution || null,
                program_name: programName || null,
                cmo_references: cmoReferences,
                generated_at: new Date().toISOString(),
            });
        } catch (e) {
            console.error('Failed to store curriculum report', e);
        }

        const iframe = document.createElement('iframe');
		iframe.style.position = 'fixed';
		iframe.style.right = '0';
		iframe.style.bottom = '0';
		iframe.style.width = '0';
		iframe.style.height = '0';
		iframe.style.border = '0';
		document.body.appendChild(iframe);

		const doc = iframe.contentWindow || iframe.contentDocument;
		const printDoc = doc.document || doc;
		printDoc.open();
		printDoc.write(`<!doctype html><html><head><meta charset="utf-8"/><style>
			@page { margin: 24px; }
			body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#000;font-size:12px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
			h1,h2,h3{margin:0 0 8px;color:#000}
			table{width:100%;border-collapse:collapse;color:#000}
			table + table{margin-top:16px}
			th,td{border:1px solid #111;padding:6px;vertical-align:top;color:#000}
			thead tr{background:#fff !important;color:#000 !important}
			thead tr:first-child{background:#000 !important;color:#fff !important}
			thead tr:nth-child(2){background:#f3f4f6 !important;color:#000 !important}
			thead tr:nth-child(3){background:#f3f4f6 !important;color:#000 !important}
			th{background:#fff !important;color:#000 !important}
			tfoot tr{background:#f3f4f6;color:#000}
			.print-semester{margin-bottom:16px}
			p,li,div,span{color:#000}
			.text-right{text-align:right}
			.text-left{text-align:left}
			.text-center{text-align:center}
			.no-print-title{display:none}
			ul{margin:0;padding-left:16px}
			.print-footer{page-break-inside:avoid;}
		</style></head><body>${headerHTML}${htmlContent}${footerHTML}</body></html>`);
		printDoc.close();

		const doPrint = () => {
			try {
				const d = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
				if (d) {
					const tables = d.querySelectorAll('table');
					tables.forEach(table => {
						const thead = table.querySelector('thead');
						if (!thead) return;
						const headerRows = thead.querySelectorAll('tr');
						if (headerRows.length >= 2) {
							const row1 = headerRows[0];
							const row2 = headerRows[1];
							const th1 = row1.querySelector('th');
							const th2 = row2.querySelector('th');
							if (th1 && th2 && th1.getAttribute('colspan') === th2.getAttribute('colspan')) {
								const text1 = (th1.textContent || '').trim();
								const text2 = (th2.textContent || '').trim();
								th1.textContent = text1 && text2 ? `${text1} - ${text2}` : (text1 || text2);
								row2.parentNode && row2.parentNode.removeChild(row2);
							}
						}
					});
				}
			} catch (e) {}

			try { iframe.contentWindow.focus(); } catch (e) {}
			iframe.contentWindow.print();
			setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 500);
		};

		
		if (iframe.contentWindow) {
			iframe.onload = doPrint;
			setTimeout(doPrint, 300);
		} else {
			setTimeout(doPrint, 300);
		}
	};

    return (
        <PublicLayout header={true}>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
                <style>{`
                    @keyframes pulse-once {
                        0% { opacity: 0.5; }
                        50% { opacity: 0.8; }
                        100% { opacity: 1; }
                    }
                    .animate-pulse-once {
                        animation: pulse-once 0.6s ease-in-out;
                    }
                `}</style>
            </Head>
              
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4">
                 
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                            Curriculum Verification
                        </h1>
                        <p className="text-sm text-gray-500">
                            Ensure program compliance with CHED Memorandum Orders (CMOs) and Policies, Standards, and Guidelines (PSGs).
                        </p>
                    </div>

                    <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           
                            {/* Column 1 */}
                            <div className="space-y-6">
                                {/* Faculty Name */}
                                <div className="relative" ref={facultyNameRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Faculty Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={facultyName}
                                        onChange={(e) => {
                                            setFacultyName(e.target.value);
                                            clearValidationError('facultyName');
                                        }}
                                        placeholder="Enter faculty name"
                                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                                            validationErrors.facultyName 
                                                ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                                : 'border-gray-200'
                                        }`}
                                    />
                                    {validationErrors.facultyName && (
                                        <p className="text-red-600 text-sm mt-1">{validationErrors.facultyName}</p>
                                    )}
                                </div>

                                {/* Position */}
                                <div className="relative" ref={positionRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Position <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => {
                                            setPosition(e.target.value);
                                            clearValidationError('position');
                                        }}
                                        placeholder="Enter position"
                                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                                            validationErrors.position 
                                                ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                                : 'border-gray-200'
                                        }`}
                                    />
                                    {validationErrors.position && (
                                        <p className="text-red-600 text-sm mt-1">{validationErrors.position}</p>
                                    )}
                                </div>

                                {/* CMO/PSG References */}
                                <div data-cmo-section>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CMO/PSG References <span className="text-red-500">*</span>
                                    </label>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                            <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className={`w-full px-3 py-2 border rounded-md text-sm focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 min-w-0 min-h-[42px] flex flex-col gap-1 ${
                                                validationErrors.cmoReferences 
                                                    ? 'border-red-300 focus-within:ring-red-400 focus-within:border-red-400' 
                                                    : 'border-gray-200'
                                            }`}>
                                                {cmoReferences.length > 0 ? (
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                                                        {cmoReferences.map((reference, index) => (
                                                            <div key={`${reference}-${index}`} className="flex items-center justify-between">
                                                                <span className="text-sm">{reference}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setCmoReferences(prev => prev.filter((_, i) => i !== index));
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 text-lg font-bold cursor-pointer relative z-10"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Select CMO/PSG Reference</span>
                                                )}
                                            </div>
                                            <select
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!value) return;
                                                    setCmoReferences(prev => {
                                                        const newRefs = prev.includes(value) ? prev : [...prev, value];
                                                        return newRefs;
                                                    });
                                                    clearValidationError('cmoReferences');
                                                    e.target.value = '';
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                            >
                                                <option value="">Select CMO/PSG Reference</option>
                                                {availableCurricula.map((curriculum) => (
                                                    <option 
                                                        key={curriculum.id} 
                                                        value={curriculum.curriculum_name}
                                                    >
                                                        {curriculum.curriculum_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {validationErrors.cmoReferences && (
                                        <p className="text-red-600 text-sm mt-1">{validationErrors.cmoReferences}</p>
                                    )}
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                {/* Institute */}
                                <div className="relative" ref={institutionRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institute <span className="text-red-500">*</span>
                                    </label>
                                    {institutionsLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                            <span className="ml-2 text-sm text-gray-500">Loading institutions...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={institutionSearchQuery}
                                                onChange={handleInstitutionInputChange}
                                                onFocus={() => setShowInstitutionSuggestions(true)}
                                                onBlur={handleInstitutionInputBlur}
                                                placeholder="Type to search for institution..."
                                                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                                                    validationErrors.institution 
                                                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                                        : 'border-gray-200'
                                                }`}
                                            />
                                            
                                            {showInstitutionSuggestions && getFilteredInstitutions().length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {getFilteredInstitutions().map((institution) => (
                                                        <div
                                                            key={institution.instCode}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); 
                                                                handleInstitutionSelect(institution);
                                                            }}
                                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium">{institution.instName}</div>
                                                            {institution.address && (
                                                                <div className="text-xs text-gray-500 mt-1">{institution.address}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                          
                                            {showInstitutionSuggestions && institutionSearchQuery.trim() && getFilteredInstitutions().length === 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                        No institutions found matching "{institutionSearchQuery}"
                                                    </div>
                                                </div>
                                            )}
                                            
                                          
                                            {validationErrors.institution && (
                                                <p className="text-red-600 text-sm mt-1">{validationErrors.institution}</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Program Name */}
                                <div ref={programNameRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        list={cmoReferences.length > 0 ? 'programNames' : undefined}
                                        value={programName}
                                        onChange={(e) => {
                                            setProgramName(e.target.value);
                                            clearValidationError('programName');
                                        }}
                                        placeholder={cmoReferences.length === 0 ? 'Select CMO/PSG first' : 'Type or select program name'}
                                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                                            validationErrors.programName 
                                                ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                                : 'border-gray-200'
                                        }`}
                                    />
                                    {cmoReferences.length > 0 ? (
                                        <datalist id="programNames">
                                            {(() => {
                                                const key = cmoReferences.slice().sort().join('|');
                                                const names = programNamesCacheByCmo[key] || [];
                                                return names.map(name => (
                                                    <option key={name} value={name} />
                                                ));
                                            })()}
                                        </datalist>
                                    ) : null}
                                    {validationErrors.programName && (
                                        <p className="text-red-600 text-sm mt-1">{validationErrors.programName}</p>
                                    )}
                                </div>

                                {/* Number of Years */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Years
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const yearVal = e.target.value;
                                            setSelectedYear(yearVal);
                                            setSelectedSemester('');
                                            setSelectedPeriod('');
                                            if (yearVal) {
                                                ensureDefaultRowsForAllYearsUpTo(yearVal);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="3rd Year">3 Years</option>
                                        <option value="4th Year">4 Years</option>
                                        <option value="5th Year">5 Years</option>
                                        <option value="6th Year">6 Years</option>
                                    </select>
                                </div>

                                {/* Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mode
                                    </label>
                                    <select
                                        value={selectedSemester}
                                        onChange={(e) => {
                                            setSelectedSemester(e.target.value);
                                            if (selectedYear && e.target.value) {
                                                setSelectedPeriod(`${selectedYear} - ${e.target.value}`);
                                            } else {
                                                setSelectedPeriod('');
                                            }
                                            if (e.target.value === '2nd Semester') { 
                                                ensureDefaultRowsForTrimestral();
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="1st Semester">Semesteral</option>
                                        <option value="2nd Semester">Trimestral</option>
                                    </select>
                                </div>
                            </div>
                        </div>
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
                        
                        {/* Verify Button */
                        }
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (validateRequiredFields()) {
                                        const ref = generateReferenceNo();
                                        setReferenceNo(ref);
                                        setShowVerifyModal(true);
                                    }
                                }}
                                className="px-3 py-1.5 text-white rounded-md text-sm transition-colors duration-200"
                                style={{ backgroundColor: '#1e3c73' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#1a3466'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#1e3c73'}
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                </div>
            </div>
            {showVerifyModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h2 className="text-lg font-semibold">Curriculum Details</h2>
                            <button
                                type="button"
                                onClick={() => setShowVerifyModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×                            </button>
                        </div>
                        <div ref={modalContentRef} className="p-4 space-y-6 max-h-[80vh] overflow-y-auto" style={{fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', fontSize: '12px', lineHeight: '1.4'}}>
                            {/* Program and CMO Information */}
                            <div className="text-center no-print-title">
                                <div className="text-xs text-gray-700 space-y-1">
                                    <div className="text-lg font-bold text-gray-900 mb-8">
                                        Curriculum Verification Report
                                    </div>
                                    <div className="flex justify-between max-w-5xl mx-auto">
                                        {/* Left Column */}
                                        <div className="text-left">
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">FACULTY NAME</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{facultyName || 'Not specified'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">POSITION</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{position || 'Not specified'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">INSTITUTE</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{selectedInstitution || 'Not specified'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Right Column */}
                                        <div className="text-left">
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">PROGRAM NAME</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{programName || 'Not specified'}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">REFERENCES NO.</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{referenceNo}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium text-gray-800 text-xs">DATE GENERATED</span>
                                                <span className="text-gray-800 text-xs w-2 text-center">:</span>
                                                <span className="text-gray-700 text-xs ml-1">{new Date().toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          
                            <div className="space-y-6">
                                {(() => {
                                    const all = collectDisplayedCourses();
                                    if (all.length === 0) {
                                        return (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs border">
                                                    <tbody>
                                                        <tr>
                                                            <td className="p-3 text-center text-gray-400">No courses added</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    }
                                    const yearsWithData = Array.from(new Set(all.map(r => r.year)));
                                    const yearOrder = orderedYears.filter(y => yearsWithData.includes(y));
                                    return yearOrder.map(year => {
                                        const byYear = all.filter(r => r.year === year);
                                        const semestersWithData = Array.from(new Set(byYear.map(r => r.semester)));
                                        const semOrder = (getYearSemesters(year) || []).filter(s => semestersWithData.includes(s));
                                        return (
                                            <div key={year} className="space-y-4">
                                                {semOrder.map(sem => {
                                                    const rows = byYear.filter(r => r.semester === sem);
                                                    const { totalUnits } = computeTotals(rows);
                                                    const validation = validateUnitsPerSemester(rows);
                                                    return (
                                                        <div key={`${year}-${sem}`} className="overflow-x-auto print-semester" style={{marginBottom: '16px'}}>
                                                            <table className="w-full text-xs border" style={{width: '100%', borderCollapse: 'collapse', color: '#000'}}>
                                                                <thead>
                                                                    <tr className="text-gray-900" style={{background: '#fff', color: '#000'}}>
                                                                        <th className="p-0.5 text-center text-xs font-bold" colSpan={8} style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{toWordYear(year)} - {sem}</th>
                                                                    </tr>
                                                                    <tr className="border-b bg-gray-50 font-semibold text-gray-900" style={{background: '#f3f4f6', color: '#000'}}>
                                                                        <th className="text-left p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Code</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Category</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Title</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Req Units</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Total Units</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Lec Units </th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Lab Units</th>
                                                                        <th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Prerequisite/s</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {rows.map(item => {
                                                                                const computedUnits = item.totalUnits !== '' ? item.totalUnits : ((parseFloat(item.lecUnits) || 0) + (parseFloat(item.labUnits) || 0));
                                                                                const showUnits = (item.totalUnits === '' && item.lecUnits === '' && item.labUnits === '') ? '' : computedUnits;
                                                                        return (
                                                                            <tr key={`${item.year}-${item.semester}-${item.id}`} className="border-b" style={{borderBottom: '1px solid #111'}}>
                                                                                <td className="p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.courseCode || ''}</td>
                                                                                <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.category || ''}</td>
                                                                                <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.courseTitle || ''}</td>
                                                                                <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.reqUnits)}</td>
                                                                                        <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(showUnits)}</td>
                                                                                        <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.lecUnits)}</td>
                                                                                        <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.labUnits)}</td>
                                                                                <td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.prerequisites || ''}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                                <tfoot>
                                                                    {(() => {
                                                                        const { totalUnits, totalLecUnits, totalLabUnits } = computeTotals(rows);
                                                                        return (
                                                                            <tr className="bg-gray-50" style={{background: '#f3f4f6', color: '#000'}}>
                                                                                <td className="p-2 font-medium" colSpan={4} style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>Total</td>
                                                                                <td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalUnits)}</td>
                                                                                <td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalLecUnits)}</td>
                                                                                <td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalLabUnits)}</td>
                                                                                <td style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}></td>
                                                                            </tr>
                                                                        );
                                                                    })()}
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Curriculum Breakdown</h3>
                                <table className="w-full text-xs border">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left p-2">Description</th>
                                            <th className="text-right p-2">Total Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const list = collectDisplayedCourses();
                                            const { byCategory, totalUnits } = computeTotals(list);
                                            const entries = Object.entries(byCategory);
                                            if (entries.length === 0) {
                                                return (
                                                    <tr>
                                                        <td className="p-3 text-center text-gray-400" colSpan={2}>No data</td>
                                                    </tr>
                                                );
                                            }
                                            return (
                                                <>
                                                    {entries.map(([desc, units]) => (
                                                        <tr key={desc} className="border-b">
                                                            <td className="p-2">{desc}</td>
                                                            <td className="p-2 text-right">{formatUnitsDisplay(units)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50">
                                                        <td className="p-2 font-medium">Total</td>
                                                        <td className="p-2 text-right font-semibold">{formatUnitsDisplay(totalUnits)}</td>
                                                    </tr>
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
                                    {cmoReferences.length === 0 ? (
                                        <div className="text-sm text-blue-600">
                                            Select <strong>CMO/PSG References</strong> to check prerequisites.
                                        </div>
                                    ) : (prerequisitesLoading || programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey || programCoursesLoadingKey) ? (
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
                                            Summarizing...
                                        </div>
                                    ) : (() => {
                                        const missingPrereqs = checkMissingPrerequisites();
                                        const missingReqUnits = checkMissingReqUnits();
                                        const reqTotalIssues = checkReqUnitsTotalIssues();

                                        const cmoKey = cmoReferences.slice().sort().join('|');
                                        const programList = programNamesCacheByCmo[cmoKey] || [];
                                        const requiredMap = programTotalsCacheByCmo[cmoKey] || {};
                                        const providedForSelectedProgram = (() => {
                                            const list = collectDisplayedCourses();
                                            const { totalUnits } = computeTotals(list);
                                            return totalUnits;
                                        })();

                                        return (
                                            <div className="space-y-4">
                                                {(() => {
                                                    // Check if we're still loading data
                                                    const isLoading = programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey;
                                                    
                                                    // If loading, show loading indicator and don't render program data
                                                    if (isLoading) {
                                                        return (
                                                            <div>
                                                                <div className="text-sm text-green-700 mb-1">All Requirements Met</div>
                                                                <div className="flex items-center gap-2 text-blue-600 text-xs">
                                                                    <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
                                                                    Loading programs and totals...
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Check if there are any programs that meet all requirements across all references
                                                    const hasMetRequirements = cmoReferences.some(ref => {
                                                        const key = cmoReferences.slice().sort().join('|');
                                                        const names = programNamesCacheByCmo[ref] || programNamesCacheByCmo[key] || [];
                                                        const totals = programTotalsCacheByCmo[ref] || programTotalsCacheByCmo[key] || {};
                                                        const providedMap = programProvidedCacheByCmo[ref] || programProvidedCacheByCmo[key] || {};
                                                        
                                                        return names.some(name => {
                                                            const required = Number(lookupUnitsNormalized(totals, name) || 0);
                                                            const list = collectDisplayedCoursesByProgram(name);
                                                            const { totalUnits } = computeTotals(list);
                                                            const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
                                                            const missing = Math.max(required - provided, 0);
                                                            return missing === 0;
                                                        });
                                                    });

                                                    // Only show the section if there are programs that meet all requirements
                                                    if (!hasMetRequirements) return null;

                                                    return (
                                                        <div>
                                                            <div className="text-sm text-green-700 mb-1">All Requirements Met</div>
                                                            {cmoReferences.length === 0 ? (
                                                                <div className="text-xs text-gray-500">No references selected</div>
                                                            ) : (
                                                                <div className="space-y-2 text-xs text-gray-900">
                                                                {cmoReferences.map(ref => {
                                                                  const key = cmoReferences.slice().sort().join('|');
                                                                  const names = programNamesCacheByCmo[ref] || programNamesCacheByCmo[key] || [];
                                                                  const totals = programTotalsCacheByCmo[ref] || programTotalsCacheByCmo[key] || {};
                                                                  const providedMap = programProvidedCacheByCmo[ref] || programProvidedCacheByCmo[key] || {};
                                                                  
                                                                  // Check if there are any programs with 0 missing units for this reference
                                                                  const metRequirementsPrograms = names.filter(name => {
                                                                    const required = Number(lookupUnitsNormalized(totals, name) || 0);
                                                                    
                                                                    // Get courses filtered by program name
                                                                    const list = collectDisplayedCoursesByProgram(name);
                                                                    
                                                                    const { totalUnits } = computeTotals(list);
                                                                    const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
                                                                    const missing = Math.max(required - provided, 0);
                                                                    return missing === 0;
                                                                  });
                                                                  
                                                                  return metRequirementsPrograms.length > 0 ? (
                                                                    <div key={`ref-met-${ref}`}>
                                                                      <div className="font-semibold mb-1">{ref}</div>
                                                                      <ul className="list-disc pl-6 space-y-1">
                                                                        {metRequirementsPrograms.map(name => (
                                                                          <li key={`ref-met-${ref}-prog-${name}`}>
                                                                            All requirements met for <strong>"{name}"</strong>
                                                                          </li>
                                                                        ))}
                                                                      </ul>
                                                                    </div>
                                                                  ) : null;
                                                                })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                                
                                                {(() => {
                                                    // Check if we're still loading data
                                                    const isLoading = programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey;
                                                    
                                                    // If loading, show loading indicator and don't render program data
                                                    if (isLoading) {
                                                        return (
                                                            <div>
                                                                <div className="text-sm text-red-700 mb-1">Missing Total Units for Selected References</div>
                                                                <div className="flex items-center gap-2 text-blue-600 text-xs">
                                                                    <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
                                                                    Loading programs and totals...
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Check if there are any missing units across all references
                                                    const hasMissingUnits = cmoReferences.some(ref => {
                                                        const key = cmoReferences.slice().sort().join('|');
                                                        const names = programNamesCacheByCmo[ref] || programNamesCacheByCmo[key] || [];
                                                        const totals = programTotalsCacheByCmo[ref] || programTotalsCacheByCmo[key] || {};
                                                        const providedMap = programProvidedCacheByCmo[ref] || programProvidedCacheByCmo[key] || {};
                                                        
                                                        return names.some(name => {
                                                            const required = Number(lookupUnitsNormalized(totals, name) || 0);
                                                            const list = collectDisplayedCoursesByProgram(name);
                                                            const { totalUnits } = computeTotals(list);
                                                            const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
                                                            const missing = Math.max(required - provided, 0);
                                                            return missing > 0;
                                                        });
                                                    });

                                                    // Only show the section if there are missing units
                                                    if (!hasMissingUnits) return null;

                                                    return (
                                                        <div>
                                                            <div className="text-sm text-red-700 mb-1">Missing Total Units for Selected References</div>
                                                            {cmoReferences.length === 0 ? (
                                                                <div className="text-xs text-gray-500">No references selected</div>
                                                            ) : (
                                                                <div className="space-y-2 text-xs text-gray-900">
                                                                {cmoReferences.map(ref => {
                                                                  const key = cmoReferences.slice().sort().join('|');
                                                                  const names = programNamesCacheByCmo[ref] || programNamesCacheByCmo[key] || [];
                                                                  const totals = programTotalsCacheByCmo[ref] || programTotalsCacheByCmo[key] || {};
                                                                  const providedMap = programProvidedCacheByCmo[ref] || programProvidedCacheByCmo[key] || {};
                                                                  
                                                                  // Filter programs with missing units > 0
                                                                  const missingUnitsPrograms = names.filter(name => {
                                                                    const required = Number(lookupUnitsNormalized(totals, name) || 0);
                                                                    
                                                                    // Get courses filtered by program name
                                                                    const list = collectDisplayedCoursesByProgram(name);
                                                                    
                                                                    const { totalUnits } = computeTotals(list);
                                                                    const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
                                                                    const missing = Math.max(required - provided, 0);
                                                                    return missing > 0;
                                                                  });
                                                                  
                                                                  return missingUnitsPrograms.length > 0 ? (
                                                                    <div key={`ref-${ref}`}>
                                                                      <div className="font-semibold mb-1">{ref}</div>
                                                                      <ul className="list-disc pl-6 space-y-1">
                                                                        {missingUnitsPrograms.map(name => {
                                                                          const required = Number(lookupUnitsNormalized(totals, name) || 0);
                                                                          
                                                                          // Get courses filtered by program name
                                                                          const list = collectDisplayedCoursesByProgram(name);
                                                                          // Get the breakdown by category
                                                                          const { byCategory, totalUnits } = computeTotals(list);
                                                                          
                                                                          // Use the total units from curriculum breakdown if available
                                                                          const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
                                                                          const missing = Math.max(required - provided, 0); // prevent negative
                                                                          
                                                                          return (
                                                                            <li key={`ref-${ref}-prog-${name}`}>
                                                                              You're lacking <strong>{formatUnitsDisplay(missing)}</strong> units in <strong>"{name}"</strong>
                                                                            </li>
                                                                          );
                                                                        })}
                                                                      </ul>
                                                                    </div>
                                                                  ) : null;
                                                                })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                                {missingPrereqs.length > 0 && (
                                                    <div>
                                                        <div className="text-sm text-red-700 mb-1">Missing Required prerequisite/s from CMO/PSG:</div>
                                                        <ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
                                                            {missingPrereqs.map((item, index) => (
                                                                <li key={`pr-${index}`}>
                                                                    <strong>{item.courseCode}</strong> {item.courseTitle} requires <strong>{item.missingPrereq}</strong> <strong>{item.missingPrereqTitle}</strong> as prerequisite.
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {(missingReqUnits.length > 0 || reqTotalIssues.length > 0) && (
                                                    <div>
                                                        <div className="text-sm text-red-700 mb-1">Missing Required Units:</div>
                                                        <ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
                                                            {missingReqUnits.map((item, index) => (
                                                                <li key={`ru-${index}`}>
                                                                    {item.courseCode ? (<><strong>{item.courseCode}</strong> </>) : null}
                                                                    {item.courseTitle || 'Untitled'} ({item.year}, {item.semester}) has no Req Units.
                                                                </li>
                                                            ))}
                                                            {reqTotalIssues.map((item, index) => (
                                                                <li key={`rt-${index}`}>
                                                                    {item.type === 'missing_total' ? (
                                                                        <>
                                                                            <strong>{item.courseCode}</strong> {item.courseTitle} ({item.year}, {item.semester}) requires <strong>{formatUnitsDisplay(item.required)}</strong> total units, but Total Units is missing.
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <strong>{item.courseCode}</strong> {item.courseTitle} ({item.year}, {item.semester}) requires <strong>{formatUnitsDisplay(item.required)}</strong> total units, but provided <strong>{formatUnitsDisplay(item.provided)}</strong>.
                                                                        </>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {(() => {
                                                    const extraUnitsCourses = checkCoursesWithExtraUnits();
                                                    if (extraUnitsCourses.length > 0) {
                                                        return (
                                                            <div>
                                                                <div className="text-sm text-red-700 mb-1">Courses with Extra Units:</div>
                                                                <ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
                                                                    {extraUnitsCourses.map((course, index) => (
                                                                        <li key={`extra-${index}`}>
                                                                            <strong>{course.courseCode}</strong> {course.courseTitle} ({course.year}, {course.semester}) requires <strong>{formatUnitsDisplay(course.required)}</strong> units, but provided <strong>{formatUnitsDisplay(course.provided)}</strong> units (+<strong>{formatUnitsDisplay(course.extraUnits)}</strong> extra).
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        );
                                    })()}
                                </div>

                           </div>
                        <div className="flex justify-end gap-2 px-4 py-3 border-t">
						<button
							type="button"
							onClick={handleExport}
							className="px-3 py-1.5 rounded-md text-sm text-white hover:opacity-90 border border-transparent"
							style={{ backgroundColor: '#9B1C1C' }}
						>
							Export
						</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </PublicLayout>
    );
}