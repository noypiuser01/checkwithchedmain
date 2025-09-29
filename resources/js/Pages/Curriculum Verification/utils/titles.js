import { fetchCmoCategoryTitles } from '../services/api';

export const fetchTitlesForCategoryUtil = async ({
	category,
	cmoReferences,
	titlesCacheByCategory,
	setTitlesCacheByCategory,
	setTitlesLoadingCategory,
}) => {
	if (!category || !Array.isArray(cmoReferences) || cmoReferences.length === 0) return;
	const cacheKey = `${category}__${cmoReferences.slice().sort().join('|')}`;
	if (titlesCacheByCategory[cacheKey]) return;
	try {
		setTitlesLoadingCategory(category);
		const response = await fetchCmoCategoryTitles(cmoReferences, category);
		const titles = Array.isArray(response.data) ? response.data : [];
		setTitlesCacheByCategory(prev => ({ ...prev, [cacheKey]: titles }));
	} catch (err) {
		console.error('Error fetching titles for category', category, err);
		setTitlesCacheByCategory(prev => ({ ...prev, [cacheKey]: [] }));
	} finally {
		setTitlesLoadingCategory('');
	}
};

export const getTitlesForCategoryUtil = ({ category, cmoReferences, titlesCacheByCategory }) => {
	if (!category) return [];
	const cacheKey = `${category}__${cmoReferences.slice().sort().join('|')}`;
	return titlesCacheByCategory[cacheKey] || [];
};


