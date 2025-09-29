import { useState } from 'react';

export const usePrograms = () => {
    const [programs, setPrograms] = useState({});

    const fetchPrograms = async (heiCode, heiName) => {
        if (!programs[heiCode]) {
            try {
                const res = await fetch(`/programs/${heiCode}?name=${encodeURIComponent(heiName)}`);
                const data = await res.json();

                setPrograms(prev => ({
                    ...prev,
                    [heiCode]: { list: data || [], expanded: false },
                }));
            } catch (err) {
                console.error("Error fetching programs:", err);
                setPrograms(prev => ({
                    ...prev,
                    [heiCode]: { list: [], expanded: false },
                }));
            }
        }
    };

    const toggleProgramExpansion = (heiCode) => {
        setPrograms(prev => ({
            ...prev,
            [heiCode]: {
                ...prev[heiCode],
                expanded: !prev[heiCode]?.expanded,
            },
        }));
    };

    return {
        programs,
        fetchPrograms,
        toggleProgramExpansion,
        setPrograms
    };
};
