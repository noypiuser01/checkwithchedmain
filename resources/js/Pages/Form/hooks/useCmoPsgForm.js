import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { orderedYears } from '../utils/constants';
import { parsePeriod, generateReferenceNo, formatUnitsDisplay, computeTotals, toWordYear, lookupUnitsNormalized, normalizeKey, getYearSemesters } from '../utils/helpers';
import { fetchCurricula as apiFetchCurricula, fetchHeis, fetchCmoCategories, fetchCmoProgramNames, fetchCmoProgramTotals, fetchCurriculumProgramTotals, fetchCmoProgramCourses, fetchCourseCodeByTitle, fetchCourseDetailsByTitle, fetchCourseDetailsByCode, fetchCmoCategoryTitles, postCurriculumReport } from '../services/api';

export default function useCmoPsgForm() {
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

    // Expose all state and setters along with helpers
    return {
        state: {
            cmoReferences, programName, selectedYear, selectedSemester, courses, availableCurricula, loading, selectedPeriod,
            titlesCacheByCategory, titlesLoadingCategory, categoriesCacheByCmo, categoriesLoadingKey, programNamesCacheByCmo,
            programNamesLoadingKey, programTotalsCacheByCmo, programTotalsLoadingKey, programProvidedCacheByCmo, programProvidedLoadingKey,
            programCoursesCacheByCmo, programCoursesLoadingKey, showVerifyModal, coursePrerequisites, prerequisitesLoading,
            institutions, institutionsLoading, selectedInstitution, institutionSearchQuery, showInstitutionSuggestions,
            facultyName, position, validationErrors, referenceNo,
        },
        refs: { institutionRef, programNameRef, facultyNameRef, positionRef },
        set: {
            setCmoReferences, setProgramName, setSelectedYear, setSelectedSemester, setCourses, setAvailableCurricula, setLoading,
            setSelectedPeriod, setTitlesCacheByCategory, setTitlesLoadingCategory, setCategoriesCacheByCmo, setCategoriesLoadingKey,
            setProgramNamesCacheByCmo, setProgramNamesLoadingKey, setProgramTotalsCacheByCmo, setProgramTotalsLoadingKey,
            setProgramProvidedCacheByCmo, setProgramProvidedLoadingKey, setProgramCoursesCacheByCmo, setProgramCoursesLoadingKey,
            setShowVerifyModal, setCoursePrerequisites, setPrerequisitesLoading, setInstitutions, setInstitutionsLoading,
            setSelectedInstitution, setInstitutionSearchQuery, setShowInstitutionSuggestions, setFacultyName, setPosition,
            setValidationErrors, setReferenceNo,
        },
        lib: { orderedYears, parsePeriod, generateReferenceNo, formatUnitsDisplay, computeTotals, toWordYear, lookupUnitsNormalized, normalizeKey, getYearSemesters },
        api: { apiFetchCurricula, fetchHeis, fetchCmoCategories, fetchCmoProgramNames, fetchCmoProgramTotals, fetchCurriculumProgramTotals, fetchCmoProgramCourses, fetchCourseCodeByTitle, fetchCourseDetailsByTitle, fetchCourseDetailsByCode, fetchCmoCategoryTitles, postCurriculumReport },
    };
}

export function useCmoFetchers({
    // state
    cmoReferences,
    availableCurricula,
    programNamesCacheByCmo,
    programTotalsCacheByCmo,
    programProvidedCacheByCmo,
    programCoursesCacheByCmo,
    titlesCacheByCategory,
    // setters
    setAvailableCurricula,
    setLoading,
    setCategoriesCacheByCmo,
    setCategoriesLoadingKey,
    setProgramNamesCacheByCmo,
    setProgramNamesLoadingKey,
    setProgramTotalsCacheByCmo,
    setProgramTotalsLoadingKey,
    setProgramProvidedCacheByCmo,
    setProgramProvidedLoadingKey,
    setProgramCoursesCacheByCmo,
    setProgramCoursesLoadingKey,
    setPrerequisitesLoading,
    setCoursePrerequisites,
    setInstitutions,
    setInstitutionsLoading,
    // apis
    api,
}) {
    const fetchCurricula = async () => {
        try {
            setLoading(true);
            const response = await api.apiFetchCurricula();
            const uniqueCurricula = response.data.reduce((acc, curriculum) => {
                const name = (curriculum.curriculum_name || '').trim();
                const key = name.toLowerCase();
                if (!acc[key]) {
                    acc[key] = {
                        id: curriculum.id,
                        curriculum_name: name,
                        program_name: curriculum.program_name,
                    };
                }
                return acc;
            }, {});
            const processedCurricula = Object.values(uniqueCurricula).sort((a, b) => a.curriculum_name.localeCompare(b.curriculum_name));
            setAvailableCurricula(processedCurricula);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstitutions = async () => {
        try {
            setInstitutionsLoading(true);
            const response = await api.fetchHeis();
            setInstitutions(Array.isArray(response.data) ? response.data : []);
        } catch {
            setInstitutions([]);
        } finally {
            setInstitutionsLoading(false);
        }
    };

    const fetchCategoriesForCmo = async () => {
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (programNamesCacheByCmo[key]) return;
        try {
            setCategoriesLoadingKey(key);
            const response = await api.fetchCmoCategories(cmoReferences);
            const categories = Array.isArray(response.data) ? response.data : [];
            setCategoriesCacheByCmo(prev => ({ ...prev, [key]: categories }));
        } catch {
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
            const response = await api.fetchCmoProgramNames(cmoReferences);
            const programNames = Array.isArray(response.data) ? response.data : [];
            setProgramNamesCacheByCmo(prev => ({ ...prev, [key]: programNames }));
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => api.fetchCmoProgramNames(ref).catch(() => ({ data: [] })))
            );
            const perRefEntries = perRefResponses.reduce((acc, res, idx) => {
                const refKey = cmoReferences[idx];
                acc[refKey] = Array.isArray(res.data) ? res.data : [];
                return acc;
            }, {});
            setProgramNamesCacheByCmo(prev => ({ ...prev, ...perRefEntries }));
        } catch {
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
            const response = await api.fetchCmoProgramTotals(cmoReferences);
            const rows = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            const map = rows.reduce((acc, row) => {
                const name = (row.program_name || '').trim();
                const unitsRaw = row.total_units;
                const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                if (name) acc[name] = Number.isFinite(units) ? units : 0;
                return acc;
            }, {});
            setProgramTotalsCacheByCmo(prev => ({ ...prev, [key]: map }));
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => api.fetchCmoProgramTotals(ref).catch(() => ({ data: [] })))
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
        } catch {
            setProgramTotalsCacheByCmo(prev => ({ ...prev, [key]: {} }));
        } finally {
            setProgramTotalsLoadingKey('');
        }
    };

    const fetchProgramProvidedTotalsForCmo = async () => {
        if (cmoReferences.length === 0) return;
        const key = cmoReferences.slice().sort().join('|') || 'ALL';
        if (programProvidedCacheByCmo[key]) return;
        try {
            setProgramProvidedLoadingKey(key);
            const response = await api.fetchCurriculumProgramTotals(cmoReferences);
            const rows = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            const map = rows.reduce((acc, row) => {
                const name = (row.program_name || '').trim();
                const unitsRaw = row.total_units;
                const units = typeof unitsRaw === 'number' ? unitsRaw : parseFloat(unitsRaw);
                if (name) acc[name] = Number.isFinite(units) ? units : 0;
                return acc;
            }, {});
            setProgramProvidedCacheByCmo(prev => ({ ...prev, [key]: map }));
            const perRefResponses = await Promise.all(
                cmoReferences.map(ref => api.fetchCurriculumProgramTotals(ref).catch(() => ({ data: [] })))
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
        } catch {
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
            const response = await api.fetchCmoProgramCourses(cmoReferences, programName);
            const data = Array.isArray(response.data) ? response.data : [];
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: data }));
        } catch {
            setProgramCoursesCacheByCmo(prev => ({ ...prev, [key]: [] }));
        } finally {
            setProgramCoursesLoadingKey('');
        }
    };

    const fetchCourseCode = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return '';
        try {
            const response = await api.fetchCourseCodeByTitle(title, category, cmoReferences);
            return response.data || '';
        } catch {
            return '';
        }
    };

    const fetchCourseDetails = async (title, category) => {
        if (!title || !category || cmoReferences.length === 0) return null;
        try {
            const response = await api.fetchCourseDetailsByTitle(title, category, cmoReferences);
            return response.data || null;
        } catch {
            return null;
        }
    };

    const fetchPrerequisitesForCourse = async (year, semester, courseId, courseTitle, category, updateCourse) => {
        if (courseTitle && category && cmoReferences.length > 0) {
            try {
                const courseDetails = await fetchCourseDetails(courseTitle, category);
                if (courseDetails) {
                    if (courseDetails.code) updateCourse(year, semester, courseId, 'courseCode', courseDetails.code);
                    if (courseDetails.total_units && courseDetails.total_units !== 'NULL' && String(courseDetails.total_units).trim() !== '') {
                        updateCourse(year, semester, courseId, 'reqUnits', courseDetails.total_units);
                    }
                    if (courseDetails.prereq && courseDetails.prereq !== 'NULL' && courseDetails.prereq.trim() !== '') {
                        updateCourse(year, semester, courseId, 'prerequisites', courseDetails.prereq);
                    }
                }
            } catch {}
        }
    };

    const fetchCoursePrerequisites = async (courseCodes) => {
        if (!courseCodes || courseCodes.length === 0 || cmoReferences.length === 0) return;
        try {
            setPrerequisitesLoading(true);
            const prereqData = {};
            for (const courseCode of courseCodes) {
                try {
                    const response = await api.fetchCourseDetailsByCode(courseCode, cmoReferences);
                    if (response.data && response.data.prereq && response.data.prereq !== 'NULL' && response.data.prereq.trim() !== '') {
                        const prereqCode = response.data.prereq.split(' ')[0];
                        let prereqTitle = response.data.prereq_title || response.data.prereq;
                        try {
                            const prereqResponse = await api.fetchCourseDetailsByCode(prereqCode, cmoReferences);
                            if (prereqResponse.data && prereqResponse.data.title) prereqTitle = prereqResponse.data.title;
                        } catch {}
                        prereqData[courseCode] = { prereq: response.data.prereq, prereq_title: prereqTitle };
                    }
                } catch {}
            }
            setCoursePrerequisites(prereqData);
        } catch {
            setCoursePrerequisites({});
        } finally {
            setPrerequisitesLoading(false);
        }
    };

    return {
        fetchCurricula,
        fetchInstitutions,
        fetchCategoriesForCmo,
        fetchProgramNamesForCmo,
        fetchProgramTotalsForCmo,
        fetchProgramProvidedTotalsForCmo,
        fetchProgramCoursesForCmo,
        fetchCourseCode,
        fetchCourseDetails,
        fetchPrerequisitesForCourse,
        fetchCoursePrerequisites,
    };
}


