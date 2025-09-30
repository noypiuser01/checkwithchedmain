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
                    <div className="flex items-center justify-between w-full">
                        <h4 className="text-sm font-medium text-gray-700">
                            Regional Offices | Commission on Higher Education - CHED
                        </h4>
                        <button
                            onClick={openAdminModal}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <Shield className="w-4 h-4" />
                            Admin
                        </button>
                    </div>
                }
            >
                {/* Search Section - Matching AdminLogin Style */}
                <section className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
                    <div className="w-full max-w-4xl flex flex-col items-center -mt-48">
                        {/* Logo */}
                        <div className="mb-4">
                            <img src="/images/logo1.png" alt="CHED Logo" className="h-20 w-20" />
                        </div>
                        
                        {/* Title */}
                        <h1 className="text-3xl font-bold text-center text-[#1e3c73] mb-4">CHECK WITH CHED</h1>
                        
                        {/* Instruction text */}
                        <p className="text-sm text-gray-600 text-center mb-8">
                            Search for accredited higher education institutions and programs in the Philippines
                        </p>

                        {/* Search Bar */}
                        <div className="w-full">
                            <SearchBar
                                query={data.query}
                                onQueryChange={(value) => setData("query", value)}
                                onSubmit={handleSearchSubmit}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Tip */}
                        <p className="text-sm text-gray-600 text-center mt-4">
                            Try searching for universities, colleges, or specific programs
                        </p>
                    </div>
                </section>

                {/* Results Section */}
                <section id="search-results" className="py-12 bg-white min-h-[400px] -mt-24">
                    <div className="max-w-6xl mx-auto px-4">
                        {submitted && searchResults.length > 0 ? (
                            <>
                                {/* Results Header */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                                    HEIs Results
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{data.query}"
                                    </p>
                                </div>

                                {searchResults.length >= 10 && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-4">
                                        Maximum 10 results shown. Please refine your search.
                                    </div>
                                )}

                                <SearchResults
                                    searchResults={searchResults}
                                    programs={programs}
                                    onFetchPrograms={fetchPrograms}
                                    onOpenModal={openProgramModal}
                                    onToggleExpanded={toggleProgramExpansion}
                                />
                            </>
                        ) : !isLoading && submitted && searchResults.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mb-4 mx-auto text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                
                                <p className="text-gray-600 mb-4">
                                    No results found for "{data.query}"
                                </p>
                                <button
                                    onClick={() => (window.location.href = "/")}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : null}
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