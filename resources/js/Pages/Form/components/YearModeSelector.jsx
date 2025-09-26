export default function YearModeSelector({
    selectedYear,
    setSelectedYear,
    selectedSemester,
    setSelectedSemester,
    setSelectedPeriod,
    ensureDefaultRowsForAllYearsUpTo,
    ensureDefaultRowsForTrimestral
}) {
    return (
        <div className="space-y-6">
            {/* Number of Years */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Years
                </label>
                <select
                    value={selectedYear}
                    onChange={(e) => {
                        const yearVal = e.target.value;
                        setSelectedYear(yearVal);
                        setSelectedSemester('');
                        setSelectedPeriod('');
                        if (yearVal) {
                            ensureDefaultRowsForAllYearsUpTo(yearVal);
                        }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                >
                    <option value="">Select Year</option>
                    <option value="3rd Year">3 Years</option>
                    <option value="4th Year">4 Years</option>
                    <option value="5th Year">5 Years</option>
                    <option value="6th Year">6 Years</option>
                </select>
            </div>

            {/* Mode */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                </label>
                <select
                    value={selectedSemester}
                    onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        if (selectedYear && e.target.value) {
                            setSelectedPeriod(`${selectedYear} - ${e.target.value}`);
                        } else {
                            setSelectedPeriod('');
                        }
                        if (e.target.value === '2nd Semester') { 
                            ensureDefaultRowsForTrimestral();
                        }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                >
                    <option value="">Select Semester</option>
                    <option value="1st Semester">Semesteral</option>
                    <option value="2nd Semester">Trimestral</option>
                </select>
            </div>
        </div>
    );
}
