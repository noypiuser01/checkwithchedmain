import { useMemo } from 'react';
import { 
    computeUnitsFromGroupedCurricula, 
    computeUnitsFromCourses, 
    formatTotalUnits 
} from '../utils/dashboardUtils';

export const useDashboardData = (dashboardData = {}) => {
    // Provide default values if data is not available
    const data = useMemo(() => ({
        totalCurricula: dashboardData.totalCurricula || 0,
        activeCurricula: dashboardData.activeCurricula || 0,
        inactiveCurricula: dashboardData.inactiveCurricula || 0,
        totalUsers: dashboardData.totalUsers || 0,
        activeUsers: dashboardData.activeUsers || 0,
        inactiveUsers: dashboardData.inactiveUsers || 0,
        totalCourses: dashboardData.totalCourses || 0,
        totalUnits: dashboardData.totalUnits ?? 0,
        curriculaByProgram: dashboardData.curriculaByProgram || [],
        inactiveCurriculaByProgram: dashboardData.inactiveCurriculaByProgram || [],
        userStatusDistribution: dashboardData.userStatusDistribution || [
            { status: "Active", count: 0, color: "#10B981" },
            { status: "Inactive", count: 0, color: "#EF4444" },
        ],
        monthlyCurricula: dashboardData.monthlyCurricula || [],
    }), [dashboardData]);

    // Compute total units from available data structures
    const computedTotalUnits = useMemo(() => {
        if (
            Array.isArray(dashboardData.groupedCurricula) &&
            dashboardData.groupedCurricula.length > 0
        ) {
            return computeUnitsFromGroupedCurricula(dashboardData.groupedCurricula);
        }
        
        if (
            Array.isArray(dashboardData.courses) &&
            dashboardData.courses.length > 0
        ) {
            return computeUnitsFromCourses(dashboardData.courses);
        }
        
        if (
            Array.isArray(dashboardData.curricula) &&
            dashboardData.curricula.length > 0
        ) {
            try {
                return dashboardData.curricula.reduce((sumCurr, curr) => {
                    const semesters = Array.isArray(curr.semesters) ? curr.semesters : [];
                    const semUnits = semesters.reduce((sumSem, sem) => {
                        const courses = Array.isArray(sem.courses) ? sem.courses : [];
                        return (
                            sumSem +
                            courses.reduce(
                                (s, c) =>
                                    s + parseFloat(c.total_units || c.totalUnits || 0),
                                0
                            )
                        );
                    }, 0);
                    return sumCurr + semUnits;
                }, 0);
            } catch (_) {
                return 0;
            }
        }
        
        return parseFloat(data.totalUnits || 0) || 0;
    }, [dashboardData, data.totalUnits]);

    const formattedTotalUnits = useMemo(() => {
        return formatTotalUnits(computedTotalUnits);
    }, [computedTotalUnits]);

    return {
        data,
        computedTotalUnits,
        formattedTotalUnits,
    };
};
