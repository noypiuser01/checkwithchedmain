import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { periods, trimestralPeriods, orderedYears } from './utils/constants';
import { parsePeriod, generateReferenceNo, normalizeKey, lookupUnitsNormalized, toWordYear, computeTotals, formatUnitsDisplay, getYearSemesters } from './utils/helpers';
import { buildPeriodsToShow as buildPeriodsToShowUtil, getDisplayedPeriods as getDisplayedPeriodsUtil, collectDisplayedCourses as collectDisplayedCoursesUtil, collectDisplayedCoursesByProgram as collectDisplayedCoursesByProgramUtil } from './utils/periods';
import { addCourse as addCourseUtil, updateCourse as updateCourseUtil, removeCourse as removeCourseUtil, ensureDefaultRowsForFirstTwoYears as ensureFirstTwoUtil, ensureDefaultRowsForYear as ensureYearUtil, ensureDefaultRowsForTrimestral as ensureTrimestralUtil, ensureDefaultRowsForAllYearsUpTo as ensureAllYearsUtil } from './utils/courses';
import { fetchTitlesForCategoryUtil, getTitlesForCategoryUtil } from './utils/titles';
import { checkMissingPrerequisites as checkMissingPrereqsUtil, checkMissingReqUnits as checkMissingReqUnitsUtil, checkReqUnitsTotalIssues as checkReqUnitsTotalIssuesUtil, checkCoursesWithExtraUnits as checkCoursesWithExtraUnitsUtil } from './utils/checks';
import { validateRequiredFields as validateRequiredFieldsUtil, clearValidationError as clearValidationErrorUtil, scrollToFirstEmptyField as scrollToFirstEmptyFieldUtil } from './utils/validation';
import { getFilteredInstitutions as getFilteredInstitutionsUtil } from './utils/institutions';
import { fetchCurricula as apiFetchCurricula, fetchHeis, fetchCmoCategories, fetchCmoProgramNames, fetchCmoProgramTotals, fetchCurriculumProgramTotals, fetchCmoProgramCourses, fetchCourseCodeByTitle, fetchCourseDetailsByTitle, fetchCourseDetailsByCode, fetchCmoCategoryTitles, postCurriculumReport } from './services/api';
import VerifyModal from './components/VerifyModal';
import TrimestralVerifyModal from './components/TrimestralVerifyModal';
import { useCmoFetchers } from './hooks/useCmoPsgForm';
import { exportCurriculumReport } from './utils/exportReport';
import SemesterEditor from './components/SemesterEditor';
import FormHeader from './components/FormHeader';
import FacultyInfoForm from './components/FacultyInfoForm';
import CmoReferencesSelector from './components/CmoReferencesSelector';
import InstitutionProgramForm from './components/InstitutionProgramForm';
import YearModeSelector from './components/YearModeSelector';
import CourseTable from './components/CourseTable';
import VerifyButton from './components/VerifyButton';

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

    

    const buildPeriodsToShow = () => buildPeriodsToShowUtil(selectedYear, selectedSemester, orderedYears, trimestralPeriods);


    const getCategoriesForCMO = () => {
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        return categoriesCacheByCmo[key] || [];
    };

    const fetchCategoriesForCmo = async () => {
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (categoriesCacheByCmo[key]) return;
        try {
            setCategoriesLoadingKey(key);
            const response = await fetchCmoCategories(cmoReferences);
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
            const response = await fetchCmoProgramNames(cmoReferences);
            const programNames = Array.isArray(response.data) ? response.data : [];
            setProgramNamesCacheByCmo(prev => ({ ...prev, [key]: programNames }));

            // Also fetch and cache per individual CMO reference for grouped display
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => fetchCmoProgramNames(ref).catch(() => ({ data: [] })))
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
            const response = await fetchCmoProgramTotals(cmoReferences);
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
                cmoReferences.map(ref => fetchCmoProgramTotals(ref).catch(() => ({ data: [] })))
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
            const response = await fetchCurriculumProgramTotals(cmoReferences);
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
                cmoReferences.map(ref => fetchCurriculumProgramTotals(ref).catch(() => ({ data: [] })))
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

    // moved to services/usage via components; keep thin call if needed by summary
    const fetchProgramCoursesForCmo = async (programName) => {
        if (cmoReferences.length === 0 || !programName) return;
        const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
        if (programCoursesCacheByCmo[key]) return;
        try {
            setProgramCoursesLoadingKey(key);
            const response = await fetchCmoProgramCourses(cmoReferences, programName);
            const data = Array.isArray(response.data) ? response.data : [];
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: data }));
        } catch (err) {
            console.error('Error fetching program courses for CMO', cmoReferences, programName, err);
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: [] }));
        } finally {
            setProgramCoursesLoadingKey('');
        }
    };

    const fetchTitlesForCategory = async (category) => fetchTitlesForCategoryUtil({
        category,
        cmoReferences,
        titlesCacheByCategory,
        setTitlesCacheByCategory,
        setTitlesLoadingCategory,
    });

    const getTitlesForCategory = (category) => getTitlesForCategoryUtil({ category, cmoReferences, titlesCacheByCategory });

    const fetchCourseCode = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return '';
        try {
            const response = await fetchCourseCodeByTitle(title, category, cmoReferences);
            return response.data || '';
        } catch (err) {
            console.error('Error fetching course code for title', title, err);
            return '';
        }
    };

    const fetchCourseDetails = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return null;
        try {
            const response = await fetchCourseDetailsByTitle(title, category, cmoReferences);
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
                    
                    const response = await fetchCourseDetailsByCode(courseCode, cmoReferences);
                    
                    if (response.data && response.data.prereq && response.data.prereq !== 'NULL' && response.data.prereq.trim() !== '') {
                        const prereqCode = response.data.prereq.split(' ')[0]; 
                        
                        
                        let prereqTitle = response.data.prereq_title || response.data.prereq;
                        try {
                            const prereqResponse = await fetchCourseDetailsByCode(prereqCode, cmoReferences);
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

    const checkMissingPrerequisites = () => checkMissingPrereqsUtil(collectDisplayedCourses, coursePrerequisites);

    const checkMissingReqUnits = () => checkMissingReqUnitsUtil(collectDisplayedCourses);

    const checkReqUnitsTotalIssues = () => checkReqUnitsTotalIssuesUtil(collectDisplayedCourses);

    const checkCoursesWithExtraUnits = () => checkCoursesWithExtraUnitsUtil(collectDisplayedCourses);


    const fetchInstitutions = async () => {
        try {
            setInstitutionsLoading(true);
            const response = await fetchHeis();
            const institutionData = Array.isArray(response.data) ? response.data : [];
            setInstitutions(institutionData);
        } catch (error) {
            console.error('Error fetching institutions:', error);
            setInstitutions([]);
        } finally {
            setInstitutionsLoading(false);
        }
    };

    const getFilteredInstitutions = () => getFilteredInstitutionsUtil(institutions, institutionSearchQuery);


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
        const errors = validateRequiredFieldsUtil({ facultyName, selectedInstitution, position, cmoReferences, programName });
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            scrollToFirstEmptyField(errors);
        }
        return Object.keys(errors).length === 0;
    };

    const scrollToFirstEmptyField = (errors) => {
        scrollToFirstEmptyFieldUtil(errors, { facultyNameRef, institutionRef, positionRef, programNameRef });
    };

    const clearValidationError = (field) => clearValidationErrorUtil(field, validationErrors, setValidationErrors);

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
            const response = await apiFetchCurricula();
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


    const addCourse = (year, semester) => addCourseUtil(year, semester, setCourses);

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

    const ensureDefaultRowsForFirstTwoYears = () => ensureFirstTwoUtil(courses, setCourses);

    const ensureDefaultRowsForYear = (year) => ensureYearUtil(courses, setCourses, getYearSemesters, year);

    const ensureDefaultRowsForTrimestral = () => ensureTrimestralUtil(courses, setCourses);

    const ensureDefaultRowsForAllYearsUpTo = (targetYear) => ensureAllYearsUtil(courses, setCourses, getYearSemesters, orderedYears, targetYear);

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
	
    const getDisplayedPeriods = () => getDisplayedPeriodsUtil(selectedYear, selectedSemester, orderedYears, trimestralPeriods, parsePeriod);

    const collectDisplayedCourses = () => collectDisplayedCoursesUtil(courses, getDisplayedPeriods());

    const collectDisplayedCoursesByProgram = (programName) => collectDisplayedCoursesByProgramUtil(courses, getDisplayedPeriods(), cmoReferences, programCoursesCacheByCmo, programName);

	const getDatabaseUnitsForProgram = (programName) => {
		if (!programName) return 0;
		
		const key = `${cmoReferences.slice().sort().join('|')}__${programName}`;
		const programData = programCoursesCacheByCmo[key] || [];
		
	
		const programInfo = programData.find(p => p.program_name === programName);
		if (!programInfo) return 0;
		
		return programInfo.total_units || 0;
	};

	const getUserUnitsForProgram = (programName) => {
		if (!programName) return 0;
		
		
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
		await exportCurriculumReport({
			htmlContent,
			facultyName,
			position,
			selectedInstitution,
			programName,
			referenceNo,
			cmoReferences,
		});
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
                 
                    <FormHeader />

                    <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           
                        
                            <div className="space-y-6">
                                <FacultyInfoForm
                                    facultyName={facultyName}
                                    setFacultyName={setFacultyName}
                                    position={position}
                                    setPosition={setPosition}
                                    validationErrors={validationErrors}
                                    clearValidationError={clearValidationError}
                                    facultyNameRef={facultyNameRef}
                                    positionRef={positionRef}
                                />

                                <CmoReferencesSelector
                                    cmoReferences={cmoReferences}
                                    setCmoReferences={setCmoReferences}
                                    loading={loading}
                                    availableCurricula={availableCurricula}
                                    validationErrors={validationErrors}
                                    clearValidationError={clearValidationError}
                                />
                                </div>

                            <div className="space-y-6">
                                <InstitutionProgramForm
                                    institutionSearchQuery={institutionSearchQuery}
                                    handleInstitutionInputChange={handleInstitutionInputChange}
                                    showInstitutionSuggestions={showInstitutionSuggestions}
                                    setShowInstitutionSuggestions={setShowInstitutionSuggestions}
                                    handleInstitutionInputBlur={handleInstitutionInputBlur}
                                    getFilteredInstitutions={getFilteredInstitutions}
                                    handleInstitutionSelect={handleInstitutionSelect}
                                    institutionsLoading={institutionsLoading}
                                    validationErrors={validationErrors}
                                    institutionRef={institutionRef}
                                    programName={programName}
                                    setProgramName={setProgramName}
                                    cmoReferences={cmoReferences}
                                    programNamesCacheByCmo={programNamesCacheByCmo}
                                    clearValidationError={clearValidationError}
                                    programNameRef={programNameRef}
                                />

                                <YearModeSelector
                                    selectedYear={selectedYear}
                                    setSelectedYear={setSelectedYear}
                                    selectedSemester={selectedSemester}
                                    setSelectedSemester={setSelectedSemester}
                                    setSelectedPeriod={setSelectedPeriod}
                                    ensureDefaultRowsForAllYearsUpTo={ensureDefaultRowsForAllYearsUpTo}
                                    ensureDefaultRowsForTrimestral={ensureDefaultRowsForTrimestral}
                                />
                                </div>
                                </div>
                                <CourseTable
                                    buildPeriodsToShow={buildPeriodsToShow}
                                    parsePeriod={parsePeriod}
                                    courses={courses}
                                    addCourse={addCourse}
                                    updateCourse={updateCourse}
                                    removeCourse={removeCourse}
                                    getCategoriesForCMO={getCategoriesForCMO}
                                    getTitlesForCategory={getTitlesForCategory}
                                    getAllSelectedCourseTitles={getAllSelectedCourseTitles}
                                    titlesLoadingCategory={titlesLoadingCategory}
                                    fetchTitlesForCategory={fetchTitlesForCategory}
                                    fetchPrerequisitesForCourse={fetchPrerequisitesForCourse}
                                />

                                <VerifyButton
                                    validateRequiredFields={validateRequiredFields}
                                    generateReferenceNo={generateReferenceNo}
                                    setReferenceNo={setReferenceNo}
                                    setShowVerifyModal={setShowVerifyModal}
                            />
                                                                    </div>
                                                                    </div>
                                </div>
                            </div>
                            {showVerifyModal ? (
                                selectedSemester === '2nd Semester' ? (
                                    <TrimestralVerifyModal
                                        isOpen={showVerifyModal}
                                        onClose={() => setShowVerifyModal(false)}
                                        modalContentRef={modalContentRef}
                                        facultyName={facultyName}
                                        position={position}
                                        selectedInstitution={selectedInstitution}
                                        programName={programName}
                                        referenceNo={referenceNo}
                                        orderedYears={orderedYears}
                                        collectDisplayedCourses={collectDisplayedCourses}
                                        validateUnitsPerSemester={validateUnitsPerSemester}
                                        cmoReferences={cmoReferences}
                                        programNamesLoadingKey={programNamesLoadingKey}
                                        programTotalsLoadingKey={programTotalsLoadingKey}
                                        programProvidedLoadingKey={programProvidedLoadingKey}
                                        programNamesCacheByCmo={programNamesCacheByCmo}
                                        programTotalsCacheByCmo={programTotalsCacheByCmo}
                                        programProvidedCacheByCmo={programProvidedCacheByCmo}
                                        collectDisplayedCoursesByProgram={collectDisplayedCoursesByProgram}
                                        checkMissingPrerequisites={checkMissingPrerequisites}
                                        checkMissingReqUnits={checkMissingReqUnits}
                                        checkReqUnitsTotalIssues={checkReqUnitsTotalIssues}
                                        checkCoursesWithExtraUnits={checkCoursesWithExtraUnits}
                                        handleExport={handleExport}
                                    />
                                ) : (
                                    <VerifyModal
                                        isOpen={showVerifyModal}
                                        onClose={() => setShowVerifyModal(false)}
                                        modalContentRef={modalContentRef}
                                        facultyName={facultyName}
                                        position={position}
                                        selectedInstitution={selectedInstitution}
                                        programName={programName}
                                        referenceNo={referenceNo}
                                        orderedYears={orderedYears}
                                        getYearSemesters={getYearSemesters}
                                        collectDisplayedCourses={collectDisplayedCourses}
                                        validateUnitsPerSemester={validateUnitsPerSemester}
                                        cmoReferences={cmoReferences}
                                        programNamesLoadingKey={programNamesLoadingKey}
                                        programTotalsLoadingKey={programTotalsLoadingKey}
                                        programProvidedLoadingKey={programProvidedLoadingKey}
                                        programNamesCacheByCmo={programNamesCacheByCmo}
                                        programTotalsCacheByCmo={programTotalsCacheByCmo}
                                        programProvidedCacheByCmo={programProvidedCacheByCmo}
                                        collectDisplayedCoursesByProgram={collectDisplayedCoursesByProgram}
                                        checkMissingPrerequisites={checkMissingPrerequisites}
                                        checkMissingReqUnits={checkMissingReqUnits}
                                        checkReqUnitsTotalIssues={checkReqUnitsTotalIssues}
                                        checkCoursesWithExtraUnits={checkCoursesWithExtraUnits}
                                        handleExport={handleExport}
                                    />
                                )
                            ) : null}
        </PublicLayout>
    );
}