import { useState, useEffect, useMemo } from 'react';

export function useCurriculumData(groupedCurricula) {
    const [localGroupedCurricula, setLocalGroupedCurricula] = useState(groupedCurricula);

    useEffect(() => {
        setLocalGroupedCurricula(groupedCurricula);
    }, [groupedCurricula]);

    // Calculate total units for a curriculum entry
    const calculateTotalUnits = (curriculum) => {
        let totalUnits = 0;
        curriculum.semesters.forEach(semester => {
            if (semester.courses) {
                semester.courses.forEach(course => {
                    totalUnits += parseFloat(course.total_units || 0);
                });
            }
        });
        return totalUnits;
    };

    // Function to determine curriculum status (Active/Inactive)
    const getCurriculumStatus = (curriculum) => {
        // Use the status field from the database if available
        if (curriculum.status) {
            return curriculum.status === 'active' ? 'Active' : 'Inactive';
        }
        
        // Fallback to the old calculation method if status field is not available
        const extractCMOInfo = (curriculumName) => {
            const match = curriculumName.match(/CMO\s*No\.?\s*(\d+).*?(\d{4})/i);
            return match ? { number: parseInt(match[1]), year: parseInt(match[2]) } : null;
        };
        
        const currentCMO = extractCMOInfo(curriculum.curriculum_name);
        if (!currentCMO) return 'Active'; // If no CMO info, consider it active
        
        // Find all curricula with the same CMO number
        const sameCMOCurricula = localGroupedCurricula.filter(c => {
            const cmoInfo = extractCMOInfo(c.curriculum_name);
            return cmoInfo && cmoInfo.number === currentCMO.number;
        });
        
        // If only one curriculum with this CMO number, it's active
        if (sameCMOCurricula.length === 1) return 'Active';
        
        // Find the highest year for this CMO number
        const highestYear = Math.max(...sameCMOCurricula.map(c => {
            const cmoInfo = extractCMOInfo(c.curriculum_name);
            return cmoInfo ? cmoInfo.year : 0;
        }));
        
        // If this curriculum has the highest year, it's active
        return currentCMO.year === highestYear ? 'Active' : 'Inactive';
    };

    return {
        localGroupedCurricula,
        setLocalGroupedCurricula,
        calculateTotalUnits,
        getCurriculumStatus
    };
}
