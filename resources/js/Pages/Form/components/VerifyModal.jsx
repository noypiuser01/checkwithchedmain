import Modal from './Modal';
import ModalHeaderDetails from './ModalHeaderDetails';
import SemesterPrintTable from './SemesterPrintTable';
import CurriculumBreakdown from './CurriculumBreakdown';
import VerificationSummary from './VerificationSummary';

export default function VerifyModal({
	isOpen,
	onClose,
	modalContentRef,
	// header data
	facultyName,
	position,
	selectedInstitution,
	programName,
	referenceNo,
	// data & helpers
	orderedYears,
	getYearSemesters,
	collectDisplayedCourses,
	validateUnitsPerSemester,
	// summary props
	cmoReferences,
	programNamesLoadingKey,
	programTotalsLoadingKey,
	programProvidedLoadingKey,
	programNamesCacheByCmo,
	programTotalsCacheByCmo,
	programProvidedCacheByCmo,
	collectDisplayedCoursesByProgram,
	checkMissingPrerequisites,
	checkMissingReqUnits,
	checkReqUnitsTotalIssues,
	checkCoursesWithExtraUnits,
	// export action
	handleExport,
}) {
	return (
		<Modal title="Curriculum Details" isOpen={isOpen} onClose={onClose} contentRef={modalContentRef}>
			<ModalHeaderDetails facultyName={facultyName} position={position} selectedInstitution={selectedInstitution} programName={programName} referenceNo={referenceNo} />
			<div className="space-y-6">
				{(() => {
					const all = collectDisplayedCourses();
					if (all.length === 0) {
						return (
							<div className="overflow-x-auto">
								<table className="w-full text-xs border">
									<tbody>
										<tr>
											<td className="p-3 text-center text-gray-400">No courses added</td>
										</tr>
									</tbody>
								</table>
							</div>
						);
					}
					const yearsWithData = Array.from(new Set(all.map(r => r.year)));
					const yearOrder = orderedYears.filter(y => yearsWithData.includes(y));
					return yearOrder.map(year => {
						const byYear = all.filter(r => r.year === year);
						const semestersWithData = Array.from(new Set(byYear.map(r => r.semester)));
						const semOrder = (getYearSemesters(year) || []).filter(s => semestersWithData.includes(s));
						return (
							<div key={year} className="space-y-4">
								{semOrder.map(sem => {
									const rows = byYear.filter(r => r.semester === sem);
									return (
										<SemesterPrintTable key={`${year}-${sem}`} year={year} sem={sem} rows={rows} validateUnitsPerSemester={validateUnitsPerSemester} getYearSemesters={getYearSemesters} />
									);
								})}
							</div>
						);
					});
				})()}
			</div>
			<CurriculumBreakdown collectDisplayedCourses={collectDisplayedCourses} />
			<VerificationSummary
				cmoReferences={cmoReferences}
				programNamesLoadingKey={programNamesLoadingKey}
				programTotalsLoadingKey={programTotalsLoadingKey}
				programProvidedLoadingKey={programProvidedLoadingKey}
				programNamesCacheByCmo={programNamesCacheByCmo}
				programTotalsCacheByCmo={programTotalsCacheByCmo}
				programProvidedCacheByCmo={programProvidedCacheByCmo}
				collectDisplayedCoursesByProgram={collectDisplayedCoursesByProgram}
				collectDisplayedCourses={collectDisplayedCourses}
				checkMissingPrerequisites={checkMissingPrerequisites}
				checkMissingReqUnits={checkMissingReqUnits}
				checkReqUnitsTotalIssues={checkReqUnitsTotalIssues}
				checkCoursesWithExtraUnits={checkCoursesWithExtraUnits}
			/>
			<div className="flex justify-end gap-2 px-4 py-3 border-t no-print">
				<button
					type="button"
					onClick={handleExport}
					className="px-3 py-1.5 rounded-md text-sm text-white hover:opacity-90 border border-transparent no-print"
					style={{ backgroundColor: '#9B1C1C' }}
				>
					Export
				</button>
			</div>
		</Modal>
	);
}


