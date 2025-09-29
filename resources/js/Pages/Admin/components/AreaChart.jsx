import React, { useState } from 'react';

export default function AreaChart({ data = [] }) {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    if (!Array.isArray(data) || data.length === 0) {
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

    const counts = data.map((d) => d.count || 0);
    const maxY = Math.max(1, ...counts);
    const minY = 0;
    const yRange = maxY - minY;

    // Generate smooth curve points
    const points = data.map((item, index) => {
        const x = padding.left + (index * innerW) / Math.max(1, data.length - 1);
        const y = padding.top + innerH - ((item.count - minY) / yRange) * innerH;
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
                const cp1x = prev.x + (curr.x - prev.x) * 0.5;
                const cp1y = prev.y;
                path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
            } else {
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
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
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
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
                            opacity={hoveredPoint?.index === point.index ? "0.2" : "0"}
                            className="transition-all duration-200"
                        />
                        {/* Main point */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredPoint?.index === point.index ? "5" : "4"}
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
}
