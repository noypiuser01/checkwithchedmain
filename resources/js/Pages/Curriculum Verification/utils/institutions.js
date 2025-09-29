export const getFilteredInstitutions = (institutions, query) => {
	if (!String(query || '').trim()) {
		return institutions.slice(0, 10);
	}
	const q = String(query).toLowerCase().trim();
	return institutions
		.filter(inst => inst.instName && inst.instName.toLowerCase().includes(q))
		.slice(0, 10);
};


