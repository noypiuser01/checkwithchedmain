import { useState } from 'react';

export const useSearch = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (query) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setSubmitted(true);

        try {
            const response = await fetch(`/search?query=${encodeURIComponent(query.trim())}`);
            const results = await response.json();
            setSearchResults(results);
            
            // Auto scroll down to results section after search
            setTimeout(() => {
                const resultsSection = document.getElementById('search-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        searchResults,
        isLoading,
        submitted,
        handleSubmit,
        setSearchResults
    };
};
