import axios from 'axios';

export const fetchCurricula = () => axios.get('/api/curricula');
export const fetchHeis = () => axios.get('/heis');
export const fetchCmoCategories = (cmo) => axios.get('/api/cmo-categories', { params: { cmo } });
export const fetchCmoCategoryTitles = (cmo, category) => axios.get('/api/cmo-category-titles', { params: { cmo, category } });
export const fetchCmoProgramNames = (cmo) => axios.get('/api/cmo-program-names', { params: { cmo } });
export const fetchCmoProgramTotals = (cmo) => axios.get('/api/cmo-program-totals', { params: { cmo } });
export const fetchCurriculumProgramTotals = (cmo) => axios.get('/api/curriculum-program-totals', { params: { cmo } });
export const fetchCmoProgramCourses = (cmo, program) => axios.get('/api/cmo-program-courses', { params: { cmo, program } });
export const fetchCourseCodeByTitle = (title, category, cmo) => axios.get('/api/course-code-by-title', { params: { title, category, cmo } });
export const fetchCourseDetailsByTitle = (title, category, cmo) => axios.get('/api/course-details-by-title', { params: { title, category, cmo } });
export const fetchCourseDetailsByCode = (code, cmo) => axios.get('/api/course-details-by-code', { params: { code, cmo } });
export const postCurriculumReport = (payload) => axios.post('/api/curriculum-reports', payload);


