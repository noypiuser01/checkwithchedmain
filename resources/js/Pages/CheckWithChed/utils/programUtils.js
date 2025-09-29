// Utility functions for program data processing

// Deep search for a key containing substring (case-insensitive)
export const deepFindByKeyContains = (obj, substr) => {
    const target = substr.toLowerCase();
    const visited = new Set();
    const queue = [obj];
    
    while (queue.length) {
        const current = queue.shift();
        if (!current || typeof current !== 'object') continue;
        if (visited.has(current)) continue;
        visited.add(current);
        
        for (const [k, v] of Object.entries(current)) {
            if (typeof k === 'string' && k.toLowerCase().includes(target)) {
                if (v && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) return v;
                if (v && typeof v === 'object') {
                    // Try to stringify address-like objects with common parts
                    const parts = [];
                    for (const partKey of ['street','address1','address2','city','province','state','region','zip','zipcode','postal','country','barangay','municipality','town']) {
                        if (v[partKey]) parts.push(String(v[partKey]));
                    }
                    if (parts.length) return parts.join(', ');
                }
            }
            if (v && typeof v === 'object') queue.push(v);
        }
    }
    return undefined;
};

// Normalize address from various sources
export const normalizeAddress = (addressData, details, institution, progFromList, instName) => {
    let addressNormalized = 'N/A';
    
    // First, try to get address from API response
    if (addressData && typeof addressData === 'object') {
        if (addressData.address && typeof addressData.address === 'string' && addressData.address.trim() !== '') {
            addressNormalized = addressData.address.trim();
        } else if (addressData.fullAddress && typeof addressData.fullAddress === 'string' && addressData.fullAddress.trim() !== '') {
            addressNormalized = addressData.fullAddress.trim();
        } else if (addressData.location && typeof addressData.location === 'string' && addressData.location.trim() !== '') {
            addressNormalized = addressData.location.trim();
        } else if (addressData.data && typeof addressData.data === 'string' && addressData.data.trim() !== '') {
            addressNormalized = addressData.data.trim();
        } else if (Array.isArray(addressData) && addressData.length > 0) {
            const firstItem = addressData[0];
            if (typeof firstItem === 'string' && firstItem.trim() !== '') {
                addressNormalized = firstItem.trim();
            } else if (firstItem && typeof firstItem === 'object') {
                addressNormalized = firstItem.address || firstItem.fullAddress || firstItem.location || 'N/A';
            }
        } else {
            // Construct address from available parts
            const addressParts = [];
            if (addressData.city && typeof addressData.city === 'string' && addressData.city.trim() !== '') {
                addressParts.push(addressData.city.trim());
            }
            if (addressData.province && typeof addressData.province === 'string' && addressData.province.trim() !== '') {
                addressParts.push(addressData.province.trim());
            }
            if (addressData.region && typeof addressData.region === 'string' && addressData.region.trim() !== '') {
                addressParts.push(addressData.region.trim());
            }
            if (addressParts.length > 0) {
                addressNormalized = addressParts.join(', ');
            }
        }
    }
    
    // If API didn't provide address, try to get it from details or institution
    if (addressNormalized === 'N/A') {
        const addressCandidates = [
            details.address,
            details.institutionAddress,
            details.campusAddress,
            details.location,
            details.fullAddress,
            institution.address,
            institution.location,
            institution.fullAddress,
        ];
        
        addressNormalized = addressCandidates.find(v => 
            typeof v === 'string' && v.trim() !== '' && !v.toLowerCase().includes('list')
        ) || 'N/A';
    }
    
    // Additional fallback: check if we have address in the program list data
    if (addressNormalized === 'N/A' && progFromList && progFromList.address) {
        addressNormalized = progFromList.address;
    }
    
    // If still no address, try to construct one from available location data
    if (addressNormalized === 'N/A') {
        const locationParts = [];
        const city = details.city || institution.city || 
                    deepFindByKeyContains(details, 'city') || 
                    deepFindByKeyContains(institution, 'city');
        const province = details.province || institution.province || 
                       deepFindByKeyContains(details, 'province') || 
                       deepFindByKeyContains(institution, 'province');
        const region = details.region || institution.region || 
                     deepFindByKeyContains(details, 'region') || 
                     deepFindByKeyContains(institution, 'region');
        
        if (city && typeof city === 'string') locationParts.push(city.trim());
        if (province && typeof province === 'string') locationParts.push(province.trim());
        if (region && typeof region === 'string') locationParts.push(region.trim());
        
        if (locationParts.length > 0) {
            addressNormalized = locationParts.join(', ');
        }
    }
    
    // Final fallback: try to extract location from institution name
    if (addressNormalized === 'N/A' && instName) {
        const locationPatterns = [
            /(?:in|at|of)\s+([A-Za-z\s]+?)(?:\s+University|\s+College|\s+Institute|\s+School|$)/i,
            /([A-Za-z\s]+?)(?:\s+State\s+University|\s+University|\s+College|\s+Institute)/i,
            /(Manila|Quezon|Makati|Taguig|Pasig|Mandaluyong|Marikina|Parañaque|Las Piñas|Muntinlupa|Caloocan|Malabon|Navotas|Valenzuela|San Juan|Pateros|Davao|Cebu|Iloilo|Baguio|Bacolod|Zamboanga|Antipolo|Tupi|South Cotabato|Cotabato|General Santos|Gensan)/i
        ];
        
        for (const pattern of locationPatterns) {
            const match = instName.match(pattern);
            if (match && match[1]) {
                const location = match[1].trim();
                if (location.length > 2 && !location.toLowerCase().includes('university') && !location.toLowerCase().includes('college')) {
                    addressNormalized = location;
                    break;
                }
            }
        }
    }
    
    return addressNormalized;
};

// Normalize status from various sources
export const normalizeStatus = (details, institution, progFromList) => {
    let statusRaw = (
        details.status ??
        details.programStatus ??
        details.authorizationStatus ??
        details.approvalStatus ??
        details.complianceStatus ??
        institution.status ??
        details.active ??
        details.isActive ??
        details.is_active
    );
    
    if (statusRaw === undefined) {
        statusRaw = deepFindByKeyContains(details, 'status') ?? deepFindByKeyContains(institution, 'status');
    }

    let statusNormalized = 'N/A';
    if (typeof statusRaw === 'boolean') {
        statusNormalized = statusRaw ? 'Active' : 'Inactive';
    } else if (typeof statusRaw === 'number') {
        statusNormalized = statusRaw === 1 ? 'Active' : 'Inactive';
    } else if (typeof statusRaw === 'string') {
        const s = statusRaw.trim().toLowerCase();
        if (['active', 'inactive'].includes(s)) {
            statusNormalized = s.charAt(0).toUpperCase() + s.slice(1);
        } else if (['1', 'true', 'yes', 'y'].includes(s)) {
            statusNormalized = 'Active';
        } else if (['0', 'false', 'no', 'n'].includes(s)) {
            statusNormalized = 'Inactive';
        } else {
            statusNormalized = statusRaw;
        }
    }

    return (statusNormalized && statusNormalized !== 'N/A') ? statusNormalized : (progFromList?.status || 'N/A');
};
