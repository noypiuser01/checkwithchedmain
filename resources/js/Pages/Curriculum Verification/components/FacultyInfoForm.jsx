export default function FacultyInfoForm({
    facultyName,
    setFacultyName,
    position,
    setPosition,
    validationErrors,
    clearValidationError,
    facultyNameRef,
    positionRef
}) {
    return (
        <div className="space-y-6">
            {/* Faculty Name */}
            <div className="relative" ref={facultyNameRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => {
                        setFacultyName(e.target.value);
                        clearValidationError('facultyName');
                    }}
                    placeholder="Enter faculty name"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                        validationErrors.facultyName 
                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                            : 'border-gray-200'
                    }`}
                />
                {validationErrors.facultyName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.facultyName}</p>
                )}
            </div>

            {/* Position */}
            <div className="relative" ref={positionRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={position}
                    onChange={(e) => {
                        setPosition(e.target.value);
                        clearValidationError('position');
                    }}
                    placeholder="Enter position"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                        validationErrors.position 
                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                            : 'border-gray-200'
                    }`}
                />
                {validationErrors.position && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.position}</p>
                )}
            </div>
        </div>
    );
}
