import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { BookOpen, Layers, Award, CheckCircle, MapPin, Home, LogOut, User, ChevronDown, Settings, Shield } from 'lucide-react';

export default function Dashboard({ results = [] }) {
    const { data, setData } = useForm({ query: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [programs, setPrograms] = useState({});
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminFormData, setAdminFormData] = useState({ email: '', password: '' });
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState('');
    const profileDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.query.trim()) return;

        setIsLoading(true);
        setSubmitted(true);

        try {
            const response = await fetch(`/search?query=${encodeURIComponent(data.query.trim())}`);
            const results = await response.json();
            setSearchResults(results);
            setPrograms({});
            
            // Auto scroll down to results section after search
            setTimeout(() => {
                const resultsSection = document.getElementById('search-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrograms = async (heiCode, heiName) => {
        if (!programs[heiCode]) {
            try {
                const res = await fetch(`/programs/${heiCode}?name=${encodeURIComponent(heiName)}`);
                const data = await res.json();

                setPrograms(prev => ({
                    ...prev,
                    [heiCode]: { list: data || [], expanded: false },
                }));
            } catch (err) {
                console.error("Error fetching programs:", err);
                setPrograms(prev => ({
                    ...prev,
                    [heiCode]: { list: [], expanded: false },
                }));
            }
        }
    };

    const openModal = async (payload) => {
        setLoadingProgramDetails(true);
        setIsModalOpen(true);

        try {
            const programName = typeof payload === 'string' ? payload : (payload?.programName || '');
            const instCode = payload?.instCode;
            const instName = payload?.instName;
            const progFromList = payload?.prog || null;

            if (instCode && programName) {
                const [detailsRes, majorsRes, addressRes] = await Promise.all([
                    fetch(`/programs/${encodeURIComponent(instCode)}/details?program=${encodeURIComponent(programName)}${instName ? `&name=${encodeURIComponent(instName)}` : ''}`),
                    fetch(`/programs/${encodeURIComponent(instCode)}/majors?program=${encodeURIComponent(programName)}`),
                    fetch(`/programs/${encodeURIComponent(instCode)}/address?name=${encodeURIComponent(instName || '')}`)
                ]);

                const detailsRaw = await detailsRes.json();
                const majors = await majorsRes.json();
                const addressData = await addressRes.json();

                // Normalize details structure (handle array/nested payloads)
                let details = detailsRaw;
                if (details && typeof details === 'object' && 'data' in details && details.data) {
                    details = details.data;
                }
                if (Array.isArray(details)) {
                    details = details[0] || {};
                }
                // Extract possible nested institution fields
                const institution = details.institution || details.school || details.university || {};
                // Debug: surface keys to help diagnose missing fields in dev tools
                try {
                  console.debug('Program details raw payload:', detailsRaw);
                  console.debug('Program details normalized object keys:', Object.keys(details || {}));
                  console.debug('Institution object keys:', Object.keys(institution || {}));
                  console.debug('Full details object:', details);
                  console.debug('Full institution object:', institution);
                } catch (_) {}

                // Utility: deep search for a key containing substring (case-insensitive)
                const deepFindByKeyContains = (obj, substr) => {
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

                // Normalize Address - Use API-fetched address data first
                let addressNormalized = 'N/A';
                
                // First, try to get address from API response
                if (addressData && typeof addressData === 'object') {
                    // Check if addressData contains a proper address string
                    if (addressData.address && typeof addressData.address === 'string' && addressData.address.trim() !== '') {
                        addressNormalized = addressData.address.trim();
                    } else if (addressData.fullAddress && typeof addressData.fullAddress === 'string' && addressData.fullAddress.trim() !== '') {
                        addressNormalized = addressData.fullAddress.trim();
                    } else if (addressData.location && typeof addressData.location === 'string' && addressData.location.trim() !== '') {
                        addressNormalized = addressData.location.trim();
                    } else if (addressData.data && typeof addressData.data === 'string' && addressData.data.trim() !== '') {
                        addressNormalized = addressData.data.trim();
                    } else if (Array.isArray(addressData) && addressData.length > 0) {
                        // Handle case where API returns an array
                        const firstItem = addressData[0];
                        if (typeof firstItem === 'string' && firstItem.trim() !== '') {
                            addressNormalized = firstItem.trim();
                        } else if (firstItem && typeof firstItem === 'object') {
                            addressNormalized = firstItem.address || firstItem.fullAddress || firstItem.location || 'N/A';
                        }
                    } else {
                        // Construct address from available parts (province, city, region, etc.)
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
                    
                    // Try to get city, province, region from various sources
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
                    // Common Philippine location patterns in institution names
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
                
                // Enhanced Debug logging for address
                console.log('=== COMPREHENSIVE ADDRESS DEBUG ===');
                console.log('1. API Response Status:', {
                    detailsStatus: detailsRes.status,
                    majorsStatus: majorsRes.status,
                    addressStatus: addressRes.status
                });
                console.log('2. Raw API Responses:', {
                    detailsRaw: detailsRaw,
                    majors: majors,
                    addressData: addressData
                });
                console.log('3. Normalized Details:', details);
                console.log('4. Institution Object:', institution);
                console.log('5. Address Data Analysis:', {
                    hasAddressData: !!addressData,
                    addressDataType: typeof addressData,
                    addressDataKeys: addressData ? Object.keys(addressData) : 'N/A',
                    addressValue: addressData?.address,
                    fullAddressValue: addressData?.fullAddress,
                    locationValue: addressData?.location
                });
                console.log('6. Details Address Fields:', {
                    address: details.address,
                    institutionAddress: details.institutionAddress,
                    campusAddress: details.campusAddress,
                    location: details.location,
                    fullAddress: details.fullAddress,
                    city: details.city,
                    province: details.province,
                    region: details.region
                });
                console.log('7. Institution Address Fields:', {
                    address: institution.address,
                    location: institution.location,
                    fullAddress: institution.fullAddress,
                    city: institution.city,
                    province: institution.province,
                    region: institution.region
                });
                console.log('8. Final Normalized Address:', addressNormalized);
                console.log('=== END COMPREHENSIVE DEBUG ===');

                // Normalize Status (accepts string/boolean/numeric)
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

                const normalized = {
                    degreeName: details.degreeName || details.programName || programName || 'N/A',
                    major: Array.isArray(majors) && majors.length > 0 ? majors.join(', ') : (details.major || 'N/A'),
                    authorizationType: details.authorizationType || details.authType || details.authorization || 'N/A',
                    status: (statusNormalized && statusNormalized !== 'N/A') ? statusNormalized : (progFromList?.status || 'N/A'),
                    institutionName: details.institutionName || details.schoolName || institution.name || instName || 'N/A',
                    address: (addressNormalized && addressNormalized !== 'N/A') ? addressNormalized : (progFromList?.address || 'N/A'),
                    programName: details.programName || programName || 'N/A',
                };
                setSelectedProgram(normalized);
            } else {
                setSelectedProgram({
                    degreeName: 'N/A',
                    major: 'N/A',
                    authorizationType: 'N/A',
                    status: 'N/A',
                    institutionName: instName || 'N/A',
                    address: 'N/A',
                    programName: programName || 'N/A',
                });
            }
        } catch (error) {
            console.error('Error loading program details:', error);
            setSelectedProgram({
                degreeName: 'N/A',
                major: 'N/A',
                authorizationType: 'N/A',
                status: 'N/A',
                institutionName: payload?.instName || 'N/A',
                address: 'N/A',
                programName: (typeof payload === 'string' ? payload : payload?.programName) || 'N/A',
            });
        } finally {
            setLoadingProgramDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedProgram(null);
        setIsModalOpen(false);
    };

    const openAdminModal = () => {
        setIsAdminModalOpen(true);
        setAdminError('');
        setAdminFormData({ email: '', password: '' });
    };

    const closeAdminModal = () => {
        setIsAdminModalOpen(false);
        setAdminError('');
        setAdminFormData({ email: '', password: '' });
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAdminLoading(true);
        setAdminError('');

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(adminFormData),
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to admin dashboard or handle success
                window.location.href = '/admin/dashboard';
            } else {
                setAdminError(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            setAdminError('An error occurred. Please try again.');
        } finally {
            setAdminLoading(false);
        }
    };

    return (
      <>
        <Head title="">
          <link rel="icon" type="image/png" href="/images/logo.png" />
        </Head>
        <PublicLayout
      
              header={
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
                <h4 className="text-sm sm:text-xl font-semibold leading-tight text-gray-800">
                    Regional Offices | Commission on Higher Education - CHED
                </h4>
                <button
                    onClick={openAdminModal}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                </button>
            </div>
        }
  >
{/* Enhanced CheckwithChed section */}
<section className="pt-12 pb-16 relative overflow-hidden bg-gray-50">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-400 rounded-full blur-2xl"></div>
    <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-cyan-400 rounded-full blur-xl"></div>
  </div>

  {/* Main Content */}
  <div className="relative z-10">
    <div className="text-center mb-16">
      {/* Logo with enhanced glow */}
      <div className="flex justify-center mb-8">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 w-24 h-24 bg-blue-500/25 rounded-full blur-sm group-hover:bg-blue-500/40 group-hover:blur-md transition-all duration-500"></div>
          <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
          <div className="relative w-24 h-24 rounded-full shadow-lg hover:shadow-blue-400/40 hover:scale-110 transition-all duration-300 group-hover:border-blue-300 overflow-hidden">
            <img
              src="/images/logo.png"
              alt="CHED Logo"
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Title with gradient text */}
      <div className="relative">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-3xl sm:text-5xl lg:text-6xl font-extrabold drop-shadow-sm mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300 cursor-default">
          Check with CHED
        </p>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>

      <p className="text-gray-600 text-base sm:text-xl lg:text-2xl mt-2 sm:mt-4 max-w-2xl mx-auto px-4 leading-relaxed hover:text-gray-700 transition-colors duration-300">
        Search for accredited higher education institutions and programs in the Philippines.
      </p>

      {/* Enhanced Accent Line with animation */}
      <div className="flex justify-center mt-6">
        <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-md hover:w-40 hover:shadow-lg transition-all duration-500 cursor-pointer"></div>
      </div>
    </div>

    {/* Enhanced Search Bar */}
    <div className="flex justify-center px-4">
      <div className="relative max-w-2xl w-full">
        {/* Glow effect behind search bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 scale-110"></div>
        
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col sm:flex-row items-stretch sm:items-center w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-200 hover:shadow-2xl hover:shadow-blue-300/30 hover:border-blue-300 transition-all duration-300 group"
        >
          <div className="relative flex-1">
            <svg
              className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6 group-focus-within:text-blue-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              name="query"
              value={data.query}
              onChange={(e) => setData("query", e.target.value)}
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none transition-all text-base sm:text-lg bg-transparent group-hover:placeholder-gray-600"
              placeholder="Enter institution name, program, or course..."
              disabled={isLoading}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !data.query.trim()}
            className="relative px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-b-2xl sm:rounded-r-2xl sm:rounded-b-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg shadow-lg group/btn overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5 sm:w-6 sm:h-6 relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="relative z-10">Searching...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="relative z-10">Search</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>

  {/* Enhanced Tip Section */}
  <div className="mt-6 sm:mt-8 text-center px-4">
    <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 rounded-full px-4 sm:px-6 py-3 border border-blue-200 bg-blue-50/80 backdrop-blur-sm hover:bg-blue-100/80 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer group/tip">
      <span className="text-lg animate-pulse group-hover/tip:animate-bounce">💡</span>
      <p className="text-gray-700 text-sm sm:text-base font-medium group-hover/tip:text-gray-800 transition-colors duration-300 text-center sm:text-left">
        Try searching for "University", "College", specific programs, or institution names.
      </p>
    </div>
  </div>


</section>


  {/* Enhanced Result Section */}
  <section id="search-results" className="py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-[400px] relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            <div className="flex-1 mb-6 lg:mb-0">
              {submitted && searchResults.length > 0 ? (
                <>
                  {/* Enhanced Results Header */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm sm:text-lg">🎓</span>
                      </div>
                      <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        HEIs Results
                      </h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-3 border-l-4 border-blue-500">
                      <p className="text-gray-700 text-sm sm:text-base">
                        Found{" "}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">{searchResults.length}</span>{" "}
                        result{searchResults.length !== 1 ? "s" : ""} for{" "}
                        <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">"{data.query}"</span>
                      </p>
                    </div>
                  </div>

                  {searchResults.length >= 10 && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 text-red-700 rounded-lg p-3 mb-4 flex items-center shadow-sm">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <span>Maximum number of search results is 10. Please refine your search.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    {searchResults.map((item, index) => {
                      if (!programs[item.code]) {
                        fetchPrograms(item.code, item.name);
                      }

                      return (
                        <div
                          key={index}
                          className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                        >
                          {/* Subtle gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          
                          {/* Institution Header */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 relative z-10 gap-3 sm:gap-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{item.name}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                                {programs[item.code]?.list?.length || 0} Programs
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4 relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <h4 className="font-semibold text-gray-800">Programs Offered</h4>
                            </div>

                            {programs[item.code] ? (
                              programs[item.code].list && programs[item.code].list.length > 0 ? (
                                <>
                                  <div
                                    className={`transition-all duration-300 ${
                                      programs[item.code]?.expanded
                                        ? "max-h-screen"
                                        : "max-h-40 overflow-hidden"
                                    }`}
                                  >
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                      {programs[item.code].list.map((prog, i) => (
                                        <li
                                          key={i}
                                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                                        >
                                          <span className="flex-1 text-sm sm:text-sm">{prog.programName ?? prog}</span>
                                          <button
                                            onClick={() =>
                                              openModal({
                                                programName: prog.programName ?? prog,
                                                instCode: item.code,
                                                instName: item.name,
                                                prog: typeof prog === 'object' ? prog : null,
                                              })
                                            }
                                            className="w-full sm:w-auto sm:ml-4 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-md transition-all duration-200 transform hover:scale-105"

                                          >
                                            View
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {programs[item.code].list.length > 5 && (
                                    <button
                                      onClick={() =>
                                        setPrograms((prev) => ({
                                          ...prev,
                                          [item.code]: {
                                            ...prev[item.code],
                                            expanded: !prev[item.code]?.expanded,
                                          },
                                        }))
                                      }
                                      className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition-all duration-200"
                                    >
                                      <svg className={`w-4 h-4 transition-transform duration-300 ${programs[item.code]?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                      {programs[item.code]?.expanded ? "See Less" : "See More"}
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                  <svg className="w-8 h-8 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-sm italic">No programs found.</p>
                                </div>
                              )
                            ) : (
                              <div className="flex items-center justify-center py-4">
                                <svg className="animate-spin w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm text-gray-500">Loading programs...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
            
                  ) : !isLoading && submitted && searchResults.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <div className="relative group mb-6">
                        <div className="absolute inset-0 w-16 h-16 bg-red-200 rounded-full blur-xl opacity-20 mx-auto"></div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="relative h-12 w-12 mb-3 mx-auto text-gray-400 group-hover:text-red-500 transition-colors duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-l-4 border-red-400 max-w-md mx-auto">
                        <p className="text-base font-medium text-gray-700 mb-2">
                          No results found for{" "}
                          <span className="font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">"{data.query}"</span>
                        </p>
                        <button
                          onClick={() => (window.location.href = "/")}
                          className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
                            {/* Modal */}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
                      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                        {/* Modal Header - Blue gradient to match results styling */}
                        <div className="flex items-center justify-between p-4 sm:p-6 bg-[#1e3c73] text-white">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                              <img src="/images/logo.png" alt="CHED Logo" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" />
                            </div>
                            <h3 className="text-lg sm:text-2xl font-bold">Program Details</h3>
                          </div>
                          <button
                            onClick={closeModal}
                            className="text-white/90 hover:text-white transition-colors duration-200 p-1"
                            aria-label="Close"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6">
                          {loadingProgramDetails ? (
                            <div className="flex flex-col sm:flex-row justify-center items-center py-6 sm:py-8 gap-2 sm:gap-0">
                              <svg className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="ml-0 sm:ml-2 text-gray-600 text-sm sm:text-base">Loading program details...</span>
                            </div>
                          ) : selectedProgram ? (
                            <>
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                                  {selectedProgram.programName && selectedProgram.programName !== "N/A"
                                    ? selectedProgram.programName
                                    : "Program Name Not Available"}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 gap-3 text-gray-700 text-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-semibold">Institution Name:</span>
                                  </div>
                                  <span className={`sm:ml-0 ${selectedProgram.institutionName === "N/A" ? "text-gray-400 italic" : ""}`}>
                                    {selectedProgram.institutionName || "N/A"}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-semibold">Address:</span>
                                  </div>
                                  <span className={`sm:ml-0 ${selectedProgram.address === "N/A" ? "text-gray-400 italic" : ""}`}>
                                    {selectedProgram.address || "N/A"}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-semibold">Degree Name:</span>
                                  </div>
                                  <span className={`sm:ml-0 ${selectedProgram.degreeName === "N/A" ? "text-gray-400 italic" : ""}`}>
                                    {selectedProgram.degreeName || "N/A"}
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-semibold">Status:</span>
                                  </div>
                                  {selectedProgram.status && selectedProgram.status !== "N/A" ? (
                                    <span className="sm:ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      {selectedProgram.status}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">N/A</span>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                  <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-semibold">Major:</span>
                                  </div>
                                  <div className="sm:ml-0">
                                    {selectedProgram.major && selectedProgram.major !== "N/A" ? (
                                      <ul className="list-disc list-inside text-gray-700 ml-2">
                                        {selectedProgram.major.split(",").map((major, index) => (
                                          <li key={index}>{major.trim()}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-gray-400 italic ml-2">N/A</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
                                <span className="italic">
                                  Note: Fields showing "N/A" indicate that information is not available in the current dataset.
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-gray-500 py-6 sm:py-8">
                              No program details available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                      </section>

                      {/* Admin Login Modal */}
                      {isAdminModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
                          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 relative">
                            <div className="text-center mb-4 sm:mb-6">
                              <div className="mx-auto flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full mb-3 sm:mb-4">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              </div>
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Login</h3>
                              <p className="text-gray-600 mt-2 text-sm sm:text-base">Enter your credentials to access the admin panel</p>
                            </div>

                            <form onSubmit={handleAdminLogin} className="space-y-4">
                              <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  id="email"
                                  value={adminFormData.email}
                                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter email address"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                  Password
                                </label>
                                <input
                                  type="password"
                                  id="password"
                                  value={adminFormData.password}
                                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter password"
                                  required
                                />
                              </div>

                              {adminError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                                  {adminError}
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={closeAdminModal}
                                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={adminLoading}
                                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                                >
                                  {adminLoading ? (
                                    <>
                                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Logging in...
                                    </>
                                  ) : (
                                    'Login'
                                  )}
                                </button>
                              </div>
                            </form>

                            <button
                              onClick={closeAdminModal}
                              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}

                  </PublicLayout>
              </>
              );
          }
