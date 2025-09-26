export default function InstitutionProgramForm({
    // Institution props
    institutionSearchQuery,
    handleInstitutionInputChange,
    showInstitutionSuggestions,
    setShowInstitutionSuggestions,
    handleInstitutionInputBlur,
    getFilteredInstitutions,
    handleInstitutionSelect,
    institutionsLoading,
    validationErrors,
    institutionRef,
    
    // Program Name props
    programName,
    setProgramName,
    cmoReferences,
    programNamesCacheByCmo,
    clearValidationError,
    programNameRef
}) {
    return (
        <div className="space-y-6">
            {/* Institute */}
            <div className="relative" ref={institutionRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute <span className="text-red-500">*</span>
                </label>
                {institutionsLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading institutions...</span>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={institutionSearchQuery}
                            onChange={handleInstitutionInputChange}
                            onFocus={() => setShowInstitutionSuggestions(true)}
                            onBlur={handleInstitutionInputBlur}
                            placeholder="Type to search for institution..."
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                                validationErrors.institution 
                                    ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                    : 'border-gray-200'
                            }`}
                        />
                        
                        {showInstitutionSuggestions && getFilteredInstitutions().length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredInstitutions().map((institution) => (
                                    <div
                                        key={institution.instCode}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); 
                                            handleInstitutionSelect(institution);
                                        }}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="font-medium">{institution.instName}</div>
                                        {institution.address && (
                                            <div className="text-xs text-gray-500 mt-1">{institution.address}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {showInstitutionSuggestions && institutionSearchQuery.trim() && getFilteredInstitutions().length === 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    No institutions found matching "{institutionSearchQuery}"
                                </div>
                            </div>
                        )}
                        
                        {validationErrors.institution && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.institution}</p>
                        )}
                    </>
                )}
            </div>

            {/* Program Name */}
            <div ref={programNameRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name <span className="text-red-500">*</span>
                </label>
                <input
                    list={cmoReferences.length > 0 ? 'programNames' : undefined}
                    value={programName}
                    onChange={(e) => {
                        setProgramName(e.target.value);
                        clearValidationError('programName');
                    }}
                    placeholder={cmoReferences.length === 0 ? 'Select CMO/PSG first' : 'Type or select program name'}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                        validationErrors.programName 
                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                            : 'border-gray-200'
                    }`}
                />
                {cmoReferences.length > 0 ? (
                    <datalist id="programNames">
                        {(() => {
                            const key = cmoReferences.slice().sort().join('|');
                            const names = programNamesCacheByCmo[key] || [];
                            return names.map(name => (
                                <option key={name} value={name} />
                            ));
                        })()}
                    </datalist>
                ) : null}
                {validationErrors.programName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.programName}</p>
                )}
            </div>
        </div>
    );
}
