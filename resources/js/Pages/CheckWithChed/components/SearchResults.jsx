import React from 'react';
import SearchResultItem from './SearchResultItem';

export default function SearchResults({ 
    searchResults, 
    programs, 
    onFetchPrograms, 
    onOpenModal,
    onToggleExpanded
}) {
    if (searchResults.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {searchResults.map((item, index) => {
                if (!programs[item.code]) {
                    onFetchPrograms(item.code, item.name);
                }

                return (
                    <SearchResultItem
                        key={index}
                        item={item}
                        programs={programs[item.code]}
                        onOpenModal={onOpenModal}
                        onToggleExpanded={onToggleExpanded}
                    />
                );
            })}
        </div>
    );
}
