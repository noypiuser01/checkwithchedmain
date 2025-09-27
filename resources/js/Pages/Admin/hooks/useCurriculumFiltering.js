import { useMemo } from 'react';

export function useCurriculumFiltering(localGroupedCurricula, searchTerm, selectedFilter, getCurriculumStatus) {
    // Filter grouped curricula based on search term and status
    const filteredGroupedData = useMemo(() => {
        return localGroupedCurricula.filter(curriculum => {
            const searchLower = (searchTerm || '').toLowerCase();
            const matchesSearch = (
                (curriculum.curriculum_name || '').toLowerCase().includes(searchLower) ||
                (curriculum.program_name || '').toLowerCase().includes(searchLower) ||
                (Array.isArray(curriculum.semesters) && curriculum.semesters.some(semester => 
                    ((semester.year_level || '').toLowerCase().includes(searchLower)) ||
                    ((semester.semester || '').toLowerCase().includes(searchLower)) ||
                    (Array.isArray(semester.courses) && semester.courses.some(course =>
                        ((course.code || '').toLowerCase().includes(searchLower)) ||
                        ((course.title || '').toLowerCase().includes(searchLower)) ||
                        ((course.category || '').toLowerCase().includes(searchLower))
                    ))
                ))
            );
            
            // Apply status filter
            const status = getCurriculumStatus(curriculum).toLowerCase();
            const matchesStatus = selectedFilter === 'all' || status === selectedFilter;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            // First, sort by status: Active first, Inactive last
            const statusA = getCurriculumStatus(a) === 'Active' ? 0 : 1;
            const statusB = getCurriculumStatus(b) === 'Active' ? 0 : 1;
            if (statusA !== statusB) return statusA - statusB;

            // Then, within the same status, sort by CMO year (lowest to highest)
            const extractCMOInfo = (curriculumName) => {
                const match = curriculumName.match(/CMO\s*No\.?\s*(\d+).*?(\d{4})/i);
                return match ? { number: parseInt(match[1]), year: parseInt(match[2]) } : null;
            };
            
            const cmoA = extractCMOInfo(a.curriculum_name);
            const cmoB = extractCMOInfo(b.curriculum_name);
            
            if (cmoA && cmoB) {
                if (cmoA.number !== cmoB.number) {
                    return cmoA.number - cmoB.number;
                }
                return cmoA.year - cmoB.year;
            }
            
            // Fallback to alphabetical by curriculum name
            return (a.curriculum_name || '').localeCompare(b.curriculum_name || '');
        });
    }, [localGroupedCurricula, searchTerm, selectedFilter, getCurriculumStatus]);

    // Flatten semesters for pagination
    const flattenedData = useMemo(() => {
        const semesters = [];
        filteredGroupedData.forEach(curriculum => {
            if (curriculum.semesters && Array.isArray(curriculum.semesters)) {
                curriculum.semesters.forEach(semester => {
                    semesters.push({
                        ...semester,
                        curriculum_name: curriculum.curriculum_name,
                        program_name: curriculum.program_name,
                        id: semester.id || `${curriculum.id}-${semester.year_level}-${semester.semester}`
                    });
                });
            }
        });
        return semesters;
    }, [filteredGroupedData]);

    return {
        filteredGroupedData,
        flattenedData
    };
}
