import { Head, router } from "@inertiajs/react";
import {
    BookOpen,
    Users,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Layers,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import AdminLayout from "@/Components/Admin/AdminLayout";

export default function AdminDashboard({ admin, dashboardData = {} }) {
    const [trendRange, setTrendRange] = useState("Last 12 months");
    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const rangeRef = useRef(null);
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onDocClick = (e) => {
            if (rangeRef.current && !rangeRef.current.contains(e.target)) {
                setIsRangeOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        const measure = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.clientWidth || 0);
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Helpers to compute total units if not provided
    const computeUnitsFromGroupedCurricula = (grouped = []) => {
        try {
            return grouped.reduce((sumCmo, cmo) => {
                const semesters = Array.isArray(cmo.semesters)
                    ? cmo.semesters
                    : [];
                const semesterUnits = semesters.reduce((sumSem, sem) => {
                    const courses = Array.isArray(sem.courses)
                        ? sem.courses
                        : [];
                    const courseUnits = courses.reduce(
                        (sumCourse, course) =>
                            sumCourse +
                            parseFloat(
                                course.total_units || course.totalUnits || 0
                            ),
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

    const computeUnitsFromCourses = (courses = []) => {
        try {
            return courses.reduce(
                (sum, course) =>
                    sum +
                    parseFloat(course.total_units || course.totalUnits || 0),
                0
            );
        } catch (_) {
            return 0;
        }
    };

    // Provide default values if data is not available
    const data = {
        totalCurricula: dashboardData.totalCurricula || 0,
        activeCurricula: dashboardData.activeCurricula || 0,
        inactiveCurricula: dashboardData.inactiveCurricula || 0,
        totalUsers: dashboardData.totalUsers || 0,
        activeUsers: dashboardData.activeUsers || 0,
        inactiveUsers: dashboardData.inactiveUsers || 0,
        totalCourses: dashboardData.totalCourses || 0,
        totalUnits: dashboardData.totalUnits ?? 0,
        curriculaByProgram: dashboardData.curriculaByProgram || [],
        inactiveCurriculaByProgram:
            dashboardData.inactiveCurriculaByProgram || [],
        userStatusDistribution: dashboardData.userStatusDistribution || [
            { status: "Active", count: 0, color: "#10B981" },
            { status: "Inactive", count: 0, color: "#EF4444" },
        ],
        monthlyCurricula: dashboardData.monthlyCurricula || [],
    };

    // Always compute a functional total units from available structures as a source of truth
    const computedTotalUnits = useMemo(() => {
        if (
            Array.isArray(dashboardData.groupedCurricula) &&
            dashboardData.groupedCurricula.length > 0
        ) {
            return computeUnitsFromGroupedCurricula(
                dashboardData.groupedCurricula
            );
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
                    const semesters = Array.isArray(curr.semesters)
                        ? curr.semesters
                        : [];
                    const semUnits = semesters.reduce((sumSem, sem) => {
                        const courses = Array.isArray(sem.courses)
                            ? sem.courses
                            : [];
                        return (
                            sumSem +
                            courses.reduce(
                                (s, c) =>
                                    s +
                                    parseFloat(
                                        c.total_units || c.totalUnits || 0
                                    ),
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
        const epsilon = 1e-9;
        const rounded = Math.round(computedTotalUnits);
        if (Math.abs(computedTotalUnits - rounded) < epsilon) {
            return String(rounded);
        }
        return computedTotalUnits.toFixed(1);
    }, [computedTotalUnits]);

    // Color palette for charts
    const colors = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
        "#84CC16",
        "#F97316",
    ];

    // Donut chart for programs
    const renderDonutChart = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return (
                <div className="text-sm text-gray-400 text-center py-8">
                    No data available
                </div>
            );
        }

        const total = data.reduce((sum, item) => sum + item.count, 0);
        if (total === 0) {
            return (
                <div className="text-sm text-gray-400 text-center py-8">
                    No data available
                </div>
            );
        }

        const size = 200;
        const strokeWidth = 30;
        const radius = (size - strokeWidth) / 2;
        const centerX = size / 2;
        const centerY = size / 2;

        let cumulativeAngle = 0;
        const segments = data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const angle = (item.count / total) * 2 * Math.PI;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;

            const x1 = centerX + radius * Math.cos(startAngle - Math.PI / 2);
            const y1 = centerY + radius * Math.sin(startAngle - Math.PI / 2);
            const x2 = centerX + radius * Math.cos(endAngle - Math.PI / 2);
            const y2 = centerY + radius * Math.sin(endAngle - Math.PI / 2);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z",
            ].join(" ");

            cumulativeAngle += angle;

            return {
                ...item,
                pathData,
                color: colors[index % colors.length],
                percentage,
            };
        });

        return (
            <div className="flex items-center justify-between">
                <div className="relative">
                    <svg width={size} height={size}>
                        {segments.map((segment, index) => (
                            <path
                                key={index}
                                d={segment.pathData}
                                fill={segment.color}
                                className="hover:opacity-80 transition-opacity"
                            />
                        ))}
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius - strokeWidth / 2}
                            fill="white"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-light text-gray-900">
                            {total}
                        </span>
                        <span className="text-xs text-gray-500">Programs</span>
                    </div>
                </div>

                <div className="flex-1 ml-8 space-y-3">
                    {segments.map((segment, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-sm text-gray-700 truncate max-w-32">
                                    {segment.program}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {segment.count}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {segment.percentage.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Month names and normalization
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const normalizeMonthlySeries = (items = [], completeYear = true) => {
        const byMonth = new Map();
        items.forEach((d) => {
            const m = String(d.month || "").trim();
            const idx = monthNames.findIndex((name) =>
                name.toLowerCase().startsWith(m.toLowerCase().substring(0, 3))
            );
            if (idx >= 0) byMonth.set(idx, d.count ?? 0);
        });
        if (!completeYear) {
            return items.map((d) => ({ month: d.month, count: d.count ?? 0 }));
        }
        return monthNames.map((name, i) => ({
            month: name,
            count: byMonth.get(i) ?? 0,
        }));
    };

    // Interactive Area Chart - NEW IMPLEMENTATION
    const renderInteractiveAreaChart = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) {
            return (
                <div className="text-sm text-gray-400 text-center py-8">
                    No data available
                </div>
            );
        }

        const width = 400;
        const height = 200;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const innerW = width - padding.left - padding.right;
        const innerH = height - padding.top - padding.bottom;

        const counts = items.map((d) => d.count || 0);
        const maxY = Math.max(1, ...counts);
        const minY = 0;
        const yRange = maxY - minY;

        // Generate smooth curve points
        const points = items.map((item, index) => {
            const x =
                padding.left + (index * innerW) / Math.max(1, items.length - 1);
            const y =
                padding.top + innerH - ((item.count - minY) / yRange) * innerH;
            return { x, y, count: item.count, month: item.month, index };
        });

        // Create smooth path using quadratic bezier curves
        const createSmoothPath = (points) => {
            if (points.length < 2) return "";

            let path = `M ${points[0].x} ${points[0].y}`;

            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];

                if (i === 1) {
                    // First curve
                    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
                    const cp1y = prev.y;
                    path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
                } else {
                    // Smooth curves for the rest
                    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
                    const cp1y = prev.y + (curr.y - prev.y) * 0.1;
                    path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
                }
            }

            return path;
        };

        const smoothPath = createSmoothPath(points);
        const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${
            padding.top + innerH
        } L ${points[0].x} ${padding.top + innerH} Z`;

        // Grid lines
        const gridLines = [];
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const ratio = i / ySteps;
            const y = padding.top + innerH - ratio * innerH;
            const value = Math.round(minY + yRange * ratio);
            gridLines.push({ y, value });
        }

        const handleMouseMove = (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            setMousePos({ x: e.clientX, y: e.clientY });

            // Find closest point
            const closest = points.reduce((prev, curr) => {
                const prevDist = Math.abs(prev.x - mouseX);
                const currDist = Math.abs(curr.x - mouseX);
                return currDist < prevDist ? curr : prev;
            });

            setHoveredPoint(closest);
        };

        const handleMouseLeave = () => {
            setHoveredPoint(null);
        };

        return (
            <div className="relative">
                <svg
                    width={width}
                    height={height}
                    className="w-full overflow-visible cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Gradient definitions */}
                    <defs>
                        <linearGradient
                            id="areaGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#3B82F6"
                                stopOpacity="0.3"
                            />
                            <stop
                                offset="50%"
                                stopColor="#3B82F6"
                                stopOpacity="0.1"
                            />
                            <stop
                                offset="100%"
                                stopColor="#3B82F6"
                                stopOpacity="0.05"
                            />
                        </linearGradient>
                        <linearGradient
                            id="lineGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#1D4ED8" />
                            <stop offset="50%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#60A5FA" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur
                                stdDeviation="3"
                                result="coloredBlur"
                            />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid lines */}
                    {gridLines.map((line, i) => (
                        <line
                            key={i}
                            x1={padding.left}
                            y1={line.y}
                            x2={width - padding.right}
                            y2={line.y}
                            stroke="#F1F5F9"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Vertical hover line */}
                    {hoveredPoint && (
                        <line
                            x1={hoveredPoint.x}
                            y1={padding.top}
                            x2={hoveredPoint.x}
                            y2={padding.top + innerH}
                            stroke="#3B82F6"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            opacity="0.6"
                        />
                    )}

                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        className="transition-all duration-300"
                    />

                    {/* Main line */}
                    <path
                        d={smoothPath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        filter="url(#glow)"
                        className="transition-all duration-300"
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <g key={index}>
                            {/* Outer glow circle */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="8"
                                fill="#3B82F6"
                                opacity={
                                    hoveredPoint?.index === point.index
                                        ? "0.2"
                                        : "0"
                                }
                                className="transition-all duration-200"
                            />
                            {/* Main point */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r={
                                    hoveredPoint?.index === point.index
                                        ? "5"
                                        : "4"
                                }
                                fill="white"
                                stroke="#3B82F6"
                                strokeWidth="2"
                                className="transition-all duration-200 hover:r-6"
                                style={{
                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                }}
                            />
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {points.map((point, index) => (
                        <text
                            key={index}
                            x={point.x}
                            y={height - 8}
                            textAnchor="middle"
                            className="fill-gray-400 text-xs font-medium"
                        >
                            {point.month}
                        </text>
                    ))}

                    {/* Y-axis labels */}
                    {gridLines.map((line, i) => (
                        <text
                            key={i}
                            x={padding.left - 12}
                            y={line.y + 4}
                            textAnchor="end"
                            className="fill-gray-400 text-xs"
                        >
                            {line.value}
                        </text>
                    ))}
                </svg>

                {/* Interactive tooltip */}
                {hoveredPoint && (
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: mousePos.x + 10,
                            top: mousePos.y - 60,
                            transform:
                                mousePos.x > window.innerWidth - 150
                                    ? "translateX(-100%)"
                                    : "none",
                        }}
                    >
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm">
                            <div className="font-medium text-gray-900">
                                {hoveredPoint.month}
                            </div>
                            <div className="text-blue-600 font-semibold">
                                {hoveredPoint.count} reviews
                            </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-white"></div>
                            <div className="border-4 border-transparent border-t-gray-200 -mt-1"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <AdminLayout activeTab="dashboard" admin={admin}>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto py-8 px-4">
                        {/* Statistics Cards - Minimal Design */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Curricula
                                        </p>
                                        <p className="text-3xl font-light text-gray-900 mt-2">
                                            {data.totalCurricula}
                                        </p>
                                        <div className="flex items-center mt-2 space-x-4 text-xs">
                                            <span className="text-green-600">
                                                Active: {data.activeCurricula}
                                            </span>
                                            <span className="text-red-600">
                                                Inactive:{" "}
                                                {data.inactiveCurricula}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Active CMO/PSG
                                        </p>
                                        <p className="text-3xl font-light text-gray-900 mt-2">
                                            {data.activeCurricula}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Currently in use
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inactive CMO/PSG
                                        </p>
                                        <p className="text-3xl font-light text-gray-900 mt-2">
                                            {data.inactiveCurricula}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            No longer in use
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <BarChart3 className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Units
                                        </p>
                                        <p className="text-3xl font-light text-gray-900 mt-2">
                                            {formattedTotalUnits}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Across all curricula
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-xl">
                                        <Activity className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Program Distribution - Donut Chart */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Active CMO/PSG by Program
                                    </h3>
                                    <PieChart className="h-5 w-5 text-gray-400" />
                                </div>
                                {data.curriculaByProgram.length > 0 ? (
                                    renderDonutChart(data.curriculaByProgram)
                                ) : (
                                    <div className="text-sm text-gray-400 text-center py-8">
                                        No data available
                                    </div>
                                )}
                            </div>

                            {/* Monthly Trends Section - NEW INTERACTIVE AREA CHART */}
                            <div
                                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                                ref={chartContainerRef}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Monthly Reviews
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-500">
                                            Interactive
                                        </span>
                                    </div>
                                </div>
                                {(() => {
                                    const items = Array.isArray(
                                        data.monthlyCurricula
                                    )
                                        ? [...data.monthlyCurricula]
                                        : [];
                                    const filtered = normalizeMonthlySeries(
                                        items.slice(-6),
                                        false
                                    ); // Show last 6 months
                                    const total = filtered.reduce(
                                        (s, d) => s + (d.count || 0),
                                        0
                                    );

                                    if (total === 0) {
                                        return (
                                            <div className="text-sm text-gray-400 text-center py-8">
                                                No data available
                                            </div>
                                        );
                                    }

                                    const last =
                                        filtered[filtered.length - 1]?.count ||
                                        0;
                                    const prev =
                                        filtered[filtered.length - 2]?.count ||
                                        0;
                                    const deltaPct =
                                        prev > 0
                                            ? ((last - prev) / prev) * 100
                                            : last > 0
                                            ? 100
                                            : 0;
                                    const isUp = deltaPct >= 0;

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <p className="text-3xl font-light text-gray-900">
                                                        {total}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Total this period
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                        isUp
                                                            ? "bg-green-50 text-green-700 border border-green-200"
                                                            : "bg-red-50 text-red-700 border border-red-200"
                                                    }`}
                                                >
                                                    <TrendingUp
                                                        className={`h-3 w-3 ${
                                                            !isUp &&
                                                            "rotate-180"
                                                        }`}
                                                    />
                                                    <span>
                                                        {Math.abs(
                                                            deltaPct
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                            {renderInteractiveAreaChart(
                                                filtered
                                            )}
                                            <div className="text-xs text-gray-400 text-center mt-4">
                                                Hover over the chart to see
                                                detailed values
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
