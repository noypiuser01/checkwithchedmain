import { computeTotals, formatUnitsDisplay, lookupUnitsNormalized } from '../utils/helpers';

export default function VerificationSummary({
	cmoReferences,
	programNamesLoadingKey,
	programTotalsLoadingKey,
	programProvidedLoadingKey,
	programNamesCacheByCmo,
	programTotalsCacheByCmo,
	programProvidedCacheByCmo,
	collectDisplayedCoursesByProgram,
	collectDisplayedCourses,
	checkMissingPrerequisites,
	checkMissingReqUnits,
	checkReqUnitsTotalIssues,
	checkCoursesWithExtraUnits
}) {
	return (
		<div>
			<h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
			{cmoReferences.length === 0 ? (
				<div className="text-sm text-blue-600">Select <strong>CMO/PSG References</strong> to check prerequisites.</div>
			) : programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey ? (
				<div className="flex items-center gap-2 text-blue-600">
					<div className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
					Summarizing...
				</div>
			) : (() => {
				const missingPrereqs = checkMissingPrerequisites();
				const missingReqUnits = checkMissingReqUnits();
				const reqTotalIssues = checkReqUnitsTotalIssues();

				const cmoKey = cmoReferences.slice().sort().join('|');
				const programList = programNamesCacheByCmo[cmoKey] || [];
				const requiredMap = programTotalsCacheByCmo[cmoKey] || {};
				const providedForSelectedProgram = (() => {
					const list = collectDisplayedCourses();
					const { totalUnits } = computeTotals(list);
					return totalUnits;
				})();

				return (
					<div className="space-y-4">
						{(() => {
							const isLoading = programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey;
							if (isLoading) {
								return (
									<div>
										<div className="text-sm text-green-700 mb-1">All Requirements Met</div>
										<div className="flex items-center gap-2 text-blue-600 text-xs">
											<div className="w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
											Loading programs and totals...
										</div>
									</div>
								);
							}

							// Check if ALL selected CMO references are fully met
							const allRefsFullyMet = cmoReferences.every(ref => {
								// Only consider refs with per-reference data loaded
								if (!programNamesCacheByCmo[ref] || !programTotalsCacheByCmo[ref]) return false;
								// Use only per-reference caches and deduplicate program names
								const names = Array.from(new Set((programNamesCacheByCmo[ref] || []).filter(Boolean)));
								const totals = programTotalsCacheByCmo[ref] || {};
								const providedMap = programProvidedCacheByCmo[ref] || {};
								
								// Check if ALL programs in this reference are fully met
								return names.every(name => {
									const required = Number(lookupUnitsNormalized(totals, name) || 0);
									const list = collectDisplayedCoursesByProgram(name);
									const { totalUnits } = computeTotals(list);
									const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
									const missing = Math.max(required - provided, 0);
									
									// Check if there are any missing notes for this program
									const missingPrereqs = checkMissingPrerequisites();
									const missingReqUnits = checkMissingReqUnits();
									const reqTotalIssues = checkReqUnitsTotalIssues();
									const extraUnitsCourses = checkCoursesWithExtraUnits().sort((a, b) => a.courseCode.localeCompare(b.courseCode));
									
									// Check if any courses in this program have missing notes
									const hasMissingNotes = list.some(course => {
										// Check for missing prerequisites
										const hasMissingPrereq = missingPrereqs.some(prereq => 
											prereq.courseCode === course.courseCode && 
											prereq.courseTitle === course.courseTitle &&
											prereq.year === course.year &&
											prereq.semester === course.semester
										);
										
										// Check for missing required units
										const hasMissingReqUnit = missingReqUnits.some(reqUnit => 
											reqUnit.courseCode === course.courseCode && 
											reqUnit.courseTitle === course.courseTitle &&
											reqUnit.year === course.year &&
											reqUnit.semester === course.semester
										);
										
										// Check for total units issues
										const hasTotalIssue = reqTotalIssues.some(totalIssue => 
											totalIssue.courseCode === course.courseCode && 
											totalIssue.courseTitle === course.courseTitle &&
											totalIssue.year === course.year &&
											totalIssue.semester === course.semester
										);
										
										// Check for extra units
										const hasExtraUnits = extraUnitsCourses.some(extraUnit => 
											extraUnit.courseCode === course.courseCode && 
											extraUnit.courseTitle === course.courseTitle &&
											extraUnit.year === course.year &&
											extraUnit.semester === course.semester
										);
										
										return hasMissingPrereq || hasMissingReqUnit || hasTotalIssue || hasExtraUnits;
									});
									
									return missing === 0 && !hasMissingNotes;
								});
							});

							// If ALL references are fully met, show clean note
							if (allRefsFullyMet && cmoReferences.length > 0) {
								return (
									<div>
										<div className="text-sm text-green-700 mb-1">✅ All requirements met for <strong>{cmoReferences.join(', ')}</strong></div>
									</div>
								);
							}

							// Otherwise, check for partially met requirements and show detailed list
                            const hasMetRequirements = cmoReferences.some(ref => {
                                // Only consider refs with per-reference data loaded
                                if (!programNamesCacheByCmo[ref] || !programTotalsCacheByCmo[ref]) return false;
                                // Use only per-reference caches and deduplicate program names
                                const names = Array.from(new Set((programNamesCacheByCmo[ref] || []).filter(Boolean)));
                                const totals = programTotalsCacheByCmo[ref] || {};
                                const providedMap = programProvidedCacheByCmo[ref] || {};
								return names.some(name => {
									const required = Number(lookupUnitsNormalized(totals, name) || 0);
									const list = collectDisplayedCoursesByProgram(name);
									const { totalUnits } = computeTotals(list);
									const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
									const missing = Math.max(required - provided, 0);
									
									// Check if there are any missing notes for this program
									const missingPrereqs = checkMissingPrerequisites();
									const missingReqUnits = checkMissingReqUnits();
									const reqTotalIssues = checkReqUnitsTotalIssues();
									const extraUnitsCourses = checkCoursesWithExtraUnits().sort((a, b) => a.courseCode.localeCompare(b.courseCode));
									
									// Check if any courses in this program have missing notes
									const hasMissingNotes = list.some(course => {
										// Check for missing prerequisites
										const hasMissingPrereq = missingPrereqs.some(prereq => 
											prereq.courseCode === course.courseCode && 
											prereq.courseTitle === course.courseTitle &&
											prereq.year === course.year &&
											prereq.semester === course.semester
										);
										
										// Check for missing required units
                                            const hasMissingReqUnit = missingReqUnits.some(reqUnit => 
											reqUnit.courseCode === course.courseCode && 
											reqUnit.courseTitle === course.courseTitle &&
											reqUnit.year === course.year &&
											reqUnit.semester === course.semester
										);
										
										// Check for total units issues
										const hasTotalIssue = reqTotalIssues.some(totalIssue => 
											totalIssue.courseCode === course.courseCode && 
											totalIssue.courseTitle === course.courseTitle &&
											totalIssue.year === course.year &&
											totalIssue.semester === course.semester
										);
										
										// Check for extra units
										const hasExtraUnits = extraUnitsCourses.some(extraUnit => 
											extraUnit.courseCode === course.courseCode && 
											extraUnit.courseTitle === course.courseTitle &&
											extraUnit.year === course.year &&
											extraUnit.semester === course.semester
										);
										
										return hasMissingPrereq || hasMissingReqUnit || hasTotalIssue || hasExtraUnits;
									});
									
									return missing === 0 && !hasMissingNotes;
								});
							});

							if (!hasMetRequirements) return null;

                            return (
								<div>
									<div className="text-sm text-green-700 mb-1">All Requirements Met</div>
									{cmoReferences.length === 0 ? (
										<div className="text-xs text-gray-500">No references selected</div>
									) : (
										<div className="space-y-2 text-xs text-gray-900">
                                            {cmoReferences.map(ref => {
                                                // Skip refs until per-reference data is present
                                                if (!programNamesCacheByCmo[ref] || !programTotalsCacheByCmo[ref]) return null;
                                                // Only use per-reference caches and deduplicate program names
                                                const names = Array.from(new Set((programNamesCacheByCmo[ref] || []).filter(Boolean)));
                                                const totals = programTotalsCacheByCmo[ref] || {};
                                                const providedMap = programProvidedCacheByCmo[ref] || {};
												const metRequirementsPrograms = names.filter(name => {
													const required = Number(lookupUnitsNormalized(totals, name) || 0);
													const list = collectDisplayedCoursesByProgram(name);
													const { totalUnits } = computeTotals(list);
													const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
													const missing = Math.max(required - provided, 0);
													
													// Check if there are any missing notes for this program
													const missingPrereqs = checkMissingPrerequisites();
													const missingReqUnits = checkMissingReqUnits();
													const reqTotalIssues = checkReqUnitsTotalIssues();
													const extraUnitsCourses = checkCoursesWithExtraUnits().sort((a, b) => a.courseCode.localeCompare(b.courseCode));
													
													// Check if any courses in this program have missing notes
													const hasMissingNotes = list.some(course => {
														// Check for missing prerequisites
														const hasMissingPrereq = missingPrereqs.some(prereq => 
															prereq.courseCode === course.courseCode && 
															prereq.courseTitle === course.courseTitle &&
															prereq.year === course.year &&
															prereq.semester === course.semester
														);
														
														// Check for missing required units
														const hasMissingReqUnit = missingReqUnits.some(reqUnit => 
															reqUnit.courseCode === course.courseCode && 
															reqUnit.courseTitle === course.courseTitle &&
															reqUnit.year === course.year &&
															reqUnit.semester === course.semester
														);
														
														// Check for total units issues
														const hasTotalIssue = reqTotalIssues.some(totalIssue => 
															totalIssue.courseCode === course.courseCode && 
															totalIssue.courseTitle === course.courseTitle &&
															totalIssue.year === course.year &&
															totalIssue.semester === course.semester
														);
														
														// Check for extra units
														const hasExtraUnits = extraUnitsCourses.some(extraUnit => 
															extraUnit.courseCode === course.courseCode && 
															extraUnit.courseTitle === course.courseTitle &&
															extraUnit.year === course.year &&
															extraUnit.semester === course.semester
														);
														
														return hasMissingPrereq || hasMissingReqUnit || hasTotalIssue || hasExtraUnits;
													});
													
													return missing === 0 && !hasMissingNotes;
                                                });
                                                // Deduplicate final list by name
                                                const uniqueMet = Array.from(new Set(metRequirementsPrograms));
                                                return uniqueMet.length > 0 ? (
													<div key={`ref-met-${ref}`}>
														<div className="font-semibold mb-1">{ref}</div>
														<ul className="list-disc pl-6 space-y-1">
                                                            {uniqueMet.map(name => (
																	<li key={`ref-met-${ref}-prog-${name}`}>All requirements met for <strong>"{name}"</strong></li>
																))}
														</ul>
													</div>
												) : null;
											})}
										</div>
									)}
								</div>
							);
						})()}

						{(() => {
							const extraUnitsCourses = checkCoursesWithExtraUnits().sort((a, b) => a.courseCode.localeCompare(b.courseCode));
							if (extraUnitsCourses.length > 0) {
								return (
									<div>
										<div className="text-sm text-red-700 mb-1">Courses with Extra Units:</div>
										<ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
											{extraUnitsCourses.map((course, index) => (
												<li key={`extra-${index}`}>
													<strong>{course.courseCode}</strong> <strong>{course.courseTitle}</strong> (<strong>{course.year}</strong>, <strong>{course.semester}</strong>) requires <strong>{formatUnitsDisplay(course.required)}</strong> units, but provided <strong>{formatUnitsDisplay(course.provided)}</strong> units (+<strong>{formatUnitsDisplay(course.extraUnits)}</strong> extra).
												</li>
											))}
										</ul>
									</div>
								);
							}
							return null;
						})()}
							{(() => {
							const missingReqUnits = checkMissingReqUnits().filter(item => 
								item.courseTitle && item.courseTitle.trim() !== '' && item.courseTitle !== 'Untitled'
							).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
							const reqTotalIssues = checkReqUnitsTotalIssues().filter(item => 
								item.courseTitle && item.courseTitle.trim() !== '' && item.courseTitle !== 'Untitled'
							).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
							if (missingReqUnits.length > 0 || reqTotalIssues.length > 0) {
								return (
									<div>
										<div className="text-sm text-red-700 mb-1">Missing Required Units:</div>
										<ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
											{missingReqUnits.map((item, index) => (
												<li key={`ru-${index}`}>
													{item.courseCode ? (<><strong>{item.courseCode}</strong> </>) : null}
													<strong>{item.courseTitle}</strong> (<strong>{item.year}</strong>, <strong>{item.semester}</strong>) has no Req Units.
												</li>
											))}
											{reqTotalIssues.map((item, index) => (
												<li key={`rt-${index}`}>
													{item.type === 'missing_total' ? (
														<>
															<strong>{item.courseCode}</strong> <strong>{item.courseTitle}</strong> (<strong>{item.year}</strong>, <strong>{item.semester}</strong>) requires <strong>{formatUnitsDisplay(item.required)}</strong> total units, but Total Units is missing.
														</>
													) : (
														<>
															<strong>{item.courseCode}</strong> <strong>{item.courseTitle}</strong> (<strong>{item.year}</strong>, <strong>{item.semester}</strong>) requires <strong>{formatUnitsDisplay(item.required)}</strong> total units, but provided <strong>{formatUnitsDisplay(item.provided)}</strong>.
														</>
													)}
												</li>
											))}
										</ul>
									</div>
								);
							}
							return null;
						})()}
						
						{(() => {
							const missingPrereqs = checkMissingPrerequisites().sort((a, b) => a.courseCode.localeCompare(b.courseCode));
							if (missingPrereqs.length > 0) {
								return (
									<div>
										<div className="text-sm text-red-700 mb-1">Missing Required prerequisite/s:</div>
										<ul className="list-disc pl-6 text-xs text-gray-900 space-y-1">
											{missingPrereqs.map((item, index) => (
												<li key={`pr-${index}`}>
													<strong>{item.courseCode}</strong> <strong>{item.courseTitle}</strong> requires <strong>{item.missingPrereq}</strong> <strong>{item.missingPrereqTitle}</strong> as prerequisite.
												</li>
											))}
										</ul>
									</div>
								);
							}
							return null;
						})()}
						{(() => {
							const isLoading = programNamesLoadingKey || programTotalsLoadingKey || programProvidedLoadingKey;
							if (isLoading) {
								return (
									<div>
										<div className="text-sm text-red-700 mb-1">Missing Total Units for Selected References</div>
										<div className="flex items-center gap-2 text-blue-600 text-xs">
											<div className="w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
											Loading programs and totals...
										</div>
									</div>
								);
							}

                            const hasMissingUnits = cmoReferences.some(ref => {
                                if (!programNamesCacheByCmo[ref] || !programTotalsCacheByCmo[ref]) return false;
                                // Only use per-reference caches and deduplicate
                                const names = Array.from(new Set((programNamesCacheByCmo[ref] || []).filter(Boolean)));
                                const totals = programTotalsCacheByCmo[ref] || {};
                                const providedMap = programProvidedCacheByCmo[ref] || {};
								return names.some(name => {
									const required = Number(lookupUnitsNormalized(totals, name) || 0);
									const list = collectDisplayedCoursesByProgram(name);
									const { totalUnits } = computeTotals(list);
									const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
									const missing = Math.max(required - provided, 0);
									return missing > 0;
								});
							});

							if (!hasMissingUnits) return null;

							return (
								<div>
									<div className="text-sm text-red-700 mb-1">Missing Total Units for Selected CMO/PSG References</div>
									{cmoReferences.length === 0 ? (
										<div className="text-xs text-gray-500">No references selected</div>
									) : (
										<div className="space-y-2 text-xs text-gray-900">
                                            {cmoReferences.map(ref => {
                                                if (!programNamesCacheByCmo[ref] || !programTotalsCacheByCmo[ref]) return null;
                                                // Only use per-reference caches and deduplicate program names
                                                const names = Array.from(new Set((programNamesCacheByCmo[ref] || []).filter(Boolean)));
                                                const totals = programTotalsCacheByCmo[ref] || {};
                                                const providedMap = programProvidedCacheByCmo[ref] || {};
                                                const missingUnitsPrograms = names.filter(name => {
													const required = Number(lookupUnitsNormalized(totals, name) || 0);
													const list = collectDisplayedCoursesByProgram(name);
													const { totalUnits } = computeTotals(list);
													const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
													const missing = Math.max(required - provided, 0);
													return missing > 0;
                                                }).sort((a, b) => a.localeCompare(b));
                                                // Deduplicate final list
                                                const uniqueMissing = Array.from(new Set(missingUnitsPrograms));
                                                return uniqueMissing.length > 0 ? (
													<div key={`ref-${ref}`}>
														<div className="font-semibold mb-1">{ref}</div>
														<ul className="list-disc pl-6 space-y-1">
                                                            {uniqueMissing.map(name => {
																const required = Number(lookupUnitsNormalized(totals, name) || 0);
																const list = collectDisplayedCoursesByProgram(name);
																const { totalUnits } = computeTotals(list);
																const provided = totalUnits || Number(lookupUnitsNormalized(providedMap, name) || 0);
																const missing = Math.max(required - provided, 0);
																return (
																	<li key={`ref-${ref}-prog-${name}`}>You're lacking <strong>{formatUnitsDisplay(missing)}</strong> units in <strong>"{name}"</strong></li>
																);
															})}
														</ul>
													</div>
												) : null;
											})}
										</div>
									)}
								</div>
							);
						})()}
					</div>
				);
			})()}
		</div>
	);
}


