import Modal from './Modal';
import ModalHeaderDetails from './ModalHeaderDetails';
import TrimestralPrintTable from './TrimestralPrintTable';
import CurriculumBreakdown from './CurriculumBreakdown';
import VerificationSummary from './VerificationSummary';

export default function TrimestralVerifyModal({
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
		<Modal title="Curriculum Details - Trimestral" isOpen={isOpen} onClose={onClose} contentRef={modalContentRef}>
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
					
					// For Trimestral mode, group by trimester instead of year-semester
					const trimestralPeriods = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
					
					return trimestralPeriods.map(trimester => {
						const rows = all.filter(r => r.semester === trimester);
						return (
							<TrimestralPrintTable 
								key={trimester} 
								trimester={trimester} 
								rows={rows} 
								validateUnitsPerSemester={validateUnitsPerSemester} 
							/>
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
