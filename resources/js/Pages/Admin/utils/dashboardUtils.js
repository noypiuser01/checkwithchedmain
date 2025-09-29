// Utility functions for dashboard data processing

export const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Compute total units from grouped curricula
export const computeUnitsFromGroupedCurricula = (grouped = []) => {
    try {
        return grouped.reduce((sumCmo, cmo) => {
            const semesters = Array.isArray(cmo.semesters) ? cmo.semesters : [];
            const semesterUnits = semesters.reduce((sumSem, sem) => {
                const courses = Array.isArray(sem.courses) ? sem.courses : [];
                const courseUnits = courses.reduce(
                    (sumCourse, course) =>
                        sumCourse +
                        parseFloat(course.total_units || course.totalUnits || 0),
                    0
                );
                return sumSem + courseUnits;
            }, 0);
            return sumCmo + semesterUnits;
        }, 0);
    } catch (_) {
        return 0;
    }
};

// Compute total units from courses array
export const computeUnitsFromCourses = (courses = []) => {
    try {
        return courses.reduce(
            (sum, course) =>
                sum + parseFloat(course.total_units || course.totalUnits || 0),
            0
        );
    } catch (_) {
        return 0;
    }
};

// Normalize monthly data series
export const normalizeMonthlySeries = (items = [], completeYear = true) => {
    const byMonth = new Map();
    items.forEach((d) => {
        const m = String(d.month || "").trim();
        const idx = MONTH_NAMES.findIndex((name) =>
            name.toLowerCase().startsWith(m.toLowerCase().substring(0, 3))
        );
        if (idx >= 0) byMonth.set(idx, d.count ?? 0);
    });
    
    if (!completeYear) {
        return items.map((d) => ({ month: d.month, count: d.count ?? 0 }));
    }
    
    return MONTH_NAMES.map((name, i) => ({
        month: name,
        count: byMonth.get(i) ?? 0,
    }));
};

// Format total units with proper decimal handling
export const formatTotalUnits = (units) => {
    const epsilon = 1e-9;
    const rounded = Math.round(units);
    if (Math.abs(units - rounded) < epsilon) {
        return String(rounded);
    }
    return units.toFixed(1);
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
    if (previous > 0) {
        return ((current - previous) / previous) * 100;
    }
    return current > 0 ? 100 : 0;
};
