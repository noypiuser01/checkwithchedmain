export const validateRequiredFields = ({ facultyName, selectedInstitution, position, cmoReferences, programName, selectedSemester }) => {
	const errors = {};
	if (!String(facultyName || '').trim()) errors.facultyName = 'Faculty Name is required';
	if (!String(selectedInstitution || '').trim()) errors.institution = 'Institute is required';
	if (!String(position || '').trim()) errors.position = 'Position is required';
	if (!Array.isArray(cmoReferences) || cmoReferences.length === 0) errors.cmoReferences = 'CMO/PSG References is required';
	if (!String(programName || '').trim()) errors.programName = 'Program Name is required';
	if (!String(selectedSemester || '').trim()) errors.selectedSemester = 'Mode (Semester) is required';
	return errors;
};

export const clearValidationError = (field, validationErrors, setValidationErrors) => {
	if (validationErrors[field]) {
		setValidationErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	}
};

export const scrollToFirstEmptyField = (errors, refs = {}) => {
	const { facultyNameRef, institutionRef, positionRef, programNameRef } = refs;
	if (errors.facultyName && facultyNameRef?.current) {
		facultyNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => {
			const input = facultyNameRef.current.querySelector('input');
			if (input) input.focus();
		}, 500);
		return;
	}
	if (errors.institution && institutionRef?.current) {
		institutionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => {
			const input = institutionRef.current.querySelector('input');
			if (input) input.focus();
		}, 500);
		return;
	}
	if (errors.position && positionRef?.current) {
		positionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => {
			const input = positionRef.current.querySelector('input');
			if (input) input.focus();
		}, 500);
		return;
	}
	if (errors.cmoReferences) {
		const cmoSection = document.querySelector('[data-cmo-section]');
		if (cmoSection) {
			cmoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setTimeout(() => {
				const select = cmoSection.querySelector('select');
				if (select) select.focus();
			}, 500);
		}
		return;
	}
	if (errors.programName && programNameRef?.current) {
		programNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => {
			const input = programNameRef.current.querySelector('input');
			if (input) input.focus();
		}, 500);
		return;
	}
	if (errors.selectedSemester) {
		const modeSection = document.querySelector('[data-mode-section]');
		if (modeSection) {
			modeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setTimeout(() => {
				const select = modeSection.querySelector('select');
				if (select) select.focus();
			}, 500);
		}
	}
};


