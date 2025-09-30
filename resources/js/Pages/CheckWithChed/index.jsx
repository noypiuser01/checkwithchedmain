import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';

// Components
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ProgramDetailsModal from './components/ProgramDetailsModal';
import AdminLoginModal from './components/AdminLoginModal';

// Hooks
import { useSearch } from './hooks/useSearch';
import { usePrograms } from './hooks/usePrograms';
import { useModals } from './hooks/useModals';

// Utils
import { normalizeAddress, normalizeStatus } from './utils/programUtils';

export default function CheckWithChed({ results = [] }) {
    const { data, setData } = useForm({ query: '' });
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [adminFormData, setAdminFormData] = useState({ email: '', password: '' });
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState('');
    const profileDropdownRef = useRef(null);

    // Custom hooks
    const { searchResults, isLoading, submitted, handleSubmit, setSearchResults } = useSearch();
    const { programs, fetchPrograms, toggleProgramExpansion, setPrograms } = usePrograms();
    const { 
        isModalOpen, 
        isAdminModalOpen, 
        selectedProgram, 
        loadingProgramDetails,
        setSelectedProgram,
        setLoadingProgramDetails,
        openModal,
        closeModal,
        openAdminModal,
        closeAdminModal
    } = useModals();

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

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await handleSubmit(data.query);
        setPrograms({});
    };

    const openProgramModal = async (payload) => {
        setLoadingProgramDetails(true);
        openModal();

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

                // Normalize details structure
                let details = detailsRaw;
                if (details && typeof details === 'object' && 'data' in details && details.data) {
                    details = details.data;
                }
                if (Array.isArray(details)) {
                    details = details[0] || {};
                }
                const institution = details.institution || details.school || details.university || {};

                // Normalize address and status
                const addressNormalized = normalizeAddress(addressData, details, institution, progFromList, instName);
                const statusNormalized = normalizeStatus(details, institution, progFromList);

                const normalized = {
                    degreeName: details.degreeName || details.programName || programName || 'N/A',
                    major: Array.isArray(majors) && majors.length > 0 ? majors.join(', ') : (details.major || 'N/A'),
                    authorizationType: details.authorizationType || details.authType || details.authorization || 'N/A',
                    status: statusNormalized,
                    institutionName: details.institutionName || details.schoolName || institution.name || instName || 'N/A',
                    address: addressNormalized,
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
                <link rel="icon" type="image/png" href="/images/logo1.png" />
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
                <section className="pt-8 pb-10 relative overflow-hidden bg-gray-50">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-400 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-cyan-400 rounded-full blur-xl"></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            {/* Logo with enhanced glow */}
                            <div className="flex justify-center mb-8">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 w-16 h-16 bg-blue-500/25 rounded-full blur-[2px] group-hover:bg-blue-500/40 group-hover:blur-sm transition-all duration-500"></div>
                                    <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-lg group-hover:scale-110 transition-all duration-500"></div>
                                    <div className="relative w-16 h-16 rounded-full shadow-md hover:shadow-blue-400/40 hover:scale-105 transition-all duration-300 group-hover:border-blue-300 overflow-hidden">
                                        <img
                                            src="/images/logo1.png"
                                            alt="CHED Logo"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Title with gradient text */}
                            <div className="relative">
                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-2xl sm:text-4xl lg:text-5xl font-extrabold drop-shadow-sm mb-3 sm:mb-5 hover:scale-105 transition-transform duration-300 cursor-default">
                                    Check with CHED
                                </p>
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                            </div>

                            <p className="text-gray-600 text-sm sm:text-lg lg:text-xl mt-1 sm:mt-3 max-w-xl mx-auto px-4 leading-relaxed hover:text-gray-700 transition-colors duration-300">
                                Search for accredited higher education institutions and programs in the Philippines.
                            </p>

                            {/* Enhanced Accent Line with animation */}
                            <div className="flex justify-center mt-4">
                                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-md hover:w-28 hover:shadow-lg transition-all duration-500 cursor-pointer"></div>
                            </div>
                        </div>

                        {/* Enhanced Search Bar */}
                        <SearchBar
                            query={data.query}
                            onQueryChange={(value) => setData("query", value)}
                            onSubmit={handleSearchSubmit}
                            isLoading={isLoading}
                        />
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
                            <div className="flex-1 mb-6 lg:mb-0 max-w-7xl mx-auto">
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

                                        <SearchResults
                                            searchResults={searchResults}
                                            programs={programs}
                                            onFetchPrograms={fetchPrograms}
                                            onOpenModal={openProgramModal}
                                        />
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
                </section>

                {/* Modals */}
                <ProgramDetailsModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    selectedProgram={selectedProgram}
                    loadingProgramDetails={loadingProgramDetails}
                />

                <AdminLoginModal
                    isOpen={isAdminModalOpen}
                    onClose={closeAdminModal}
                    formData={adminFormData}
                    onFormChange={setAdminFormData}
                    onSubmit={handleAdminLogin}
                    isLoading={adminLoading}
                    error={adminError}
                />
            </PublicLayout>
        </>
    );
}