import React from 'react';

const COLORS = [
    "#3B82F6",
    "#10B981", 
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
];

export default function DonutChart({ data = [] }) {
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
            color: COLORS[index % COLORS.length],
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
}
