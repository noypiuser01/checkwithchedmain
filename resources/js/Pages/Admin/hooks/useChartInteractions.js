import { useState, useEffect, useRef } from 'react';

export const useChartInteractions = () => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);

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

    const handleMouseMove = (e, points) => {
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

    return {
        hoveredPoint,
        mousePos,
        chartContainerRef,
        chartWidth,
        handleMouseMove,
        handleMouseLeave,
    };
};
