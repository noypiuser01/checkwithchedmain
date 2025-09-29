export default function CmoReferencesSelector({
    cmoReferences,
    setCmoReferences,
    loading,
    availableCurricula,
    validationErrors,
    clearValidationError
}) {
    return (
        <div data-cmo-section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                CMO/PSG References <span className="text-red-500">*</span>
            </label>
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
            ) : (
                <div className="relative">
                    <div className={`w-full px-3 py-2 border rounded-md text-sm focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 min-w-0 min-h-[42px] flex flex-col gap-1 ${
                        validationErrors.cmoReferences 
                            ? 'border-red-300 focus-within:ring-red-400 focus-within:border-red-400' 
                            : 'border-gray-200'
                    }`}>
                        {cmoReferences.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                                {cmoReferences.map((reference, index) => (
                                    <div key={`${reference}-${index}`} className="flex items-center justify-between">
                                        <span className="text-sm">{reference}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setCmoReferences(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-500 hover:text-red-700 text-lg font-bold cursor-pointer relative z-10"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-500">Select CMO/PSG Reference</span>
                        )}
                    </div>
                    <select
                        onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            setCmoReferences(prev => {
                                const newRefs = prev.includes(value) ? prev : [...prev, value];
                                return newRefs;
                            });
                            clearValidationError('cmoReferences');
                            e.target.value = '';
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                    >
                        <option value="">Select CMO/PSG Reference</option>
                        {availableCurricula.map((curriculum) => (
                            <option 
                                key={curriculum.id} 
                                value={curriculum.curriculum_name}
                            >
                                {curriculum.curriculum_name}
                            </option>
                        ))}
                    </select
                    >
                </div>
            )}
            {validationErrors.cmoReferences && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.cmoReferences}</p>
            )}
        </div>
    );
}
