import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, FileText, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function PublicLayout({ header, children }) {
    const page = usePage();
    const user = page?.props?.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // NavButton component similar to AdminSidebar
    const NavButton = ({ isActive, onClick, icon: Icon, label }) => (
        <button
            onClick={onClick}
            className={`inline-flex items-center px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
            <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            {label}
        </button>
    );

    

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {header && (
                <header
                    className="shadow-lg sticky top-0 z-50 w-full flex items-center"
                    style={{
                        background: 'linear-gradient(135deg, #1e3c73 0%, #2c5282 100%)',
                    }}
                >
                    {/* Fixed Logo Section (Left) */}
                    <div className="flex items-center px-2 sm:px-4 py-2 sticky top-0 z-50">
                        <img
                            src="/images/logo1.png"
                            alt="CWCHD Logo"
                            className="h-8 sm:h-10 lg:h-12 w-auto mr-2 sm:mr-3 lg:mr-4"
                        />
                        <div className="flex flex-col">
                            <h4 className="text-xs sm:text-sm font-bold leading-tight text-white">
                                <span className="hidden sm:inline">Commission on Higher Education - Region XII</span>
                                <span className="sm:hidden">CHED Region XII</span>
                            </h4>
                            <button
                                onClick={() => router.visit('/')}
                                className="text-xs sm:text-sm bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent font-bold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-200 text-left"
                            >
                                CheckWithChed
                            </button>
                        </div>
                    </div>

                    {/* Right Side Content */}
                    <div className="flex-1 flex items-center justify-end px-2 sm:px-4 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 sm:p-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-200 mr-2 sm:mr-3"
                        >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Admin Login direct link */}
                        <Link
                            href="/admin/login"
                            className="flex items-center text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0 px-2 sm:px-3 py-1.5 sm:py-2 transition-colors duration-200 hover:underline"
                        >
                            Admin Login
                        </Link>
                    </div>

                    
                </header>
            )}

            {/* Desktop navbar */}
            <nav className="hidden lg:block w-full bg-white shadow border-b border-gray-200 sticky top-[4rem] z-40">
                <div className="max-w-full px-4">
                    <div className="flex items-center space-x-2">
                        <NavButton
                            isActive={window.location.pathname === '/checkwithched'}
                            onClick={() => router.visit('/checkwithched')}
                            icon={Search}
                            label="Check With Ched"
                        />
                        <NavButton
                            isActive={window.location.pathname === '/curriculum-verification'}
                            onClick={() => router.visit('/curriculum-verification')}
                            icon={FileText}
                            label="Curriculum Verification"
                        />
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown navbar */}
            <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 h-12">
                        <span className="text-sm font-semibold text-gray-700">Menu</span>
                        <button
                            className="p-2 rounded-md hover:bg-gray-100"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                    <div className="flex flex-col px-2 py-2">
                        <button
                            onClick={() => { setSidebarOpen(false); router.visit('/checkwithched'); }}
                            className={`w-full text-left inline-flex items-center px-4 py-3 rounded-lg ${
                                window.location.pathname === '/checkwithched' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Search className={`h-5 w-5 mr-3 ${window.location.pathname === '/checkwithched' ? 'text-blue-600' : 'text-gray-400'}`} />
                            Check With Ched
                        </button>
                        <button
                            onClick={() => { setSidebarOpen(false); router.visit('/curriculum-verification'); }}
                            className={`w-full text-left inline-flex items-center px-4 py-3 rounded-lg ${
                                window.location.pathname === '/curriculum-verification' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <FileText className={`h-5 w-5 mr-3 ${window.location.pathname === '/curriculum-verification' ? 'text-blue-600' : 'text-gray-400'}`} />
                            Curriculum Verification
                        </button>
                    </div>
                </div>
            </div>
            <main className="flex-grow">{children}</main>

            <footer className="bg-white border-t border-gray-200 text-center py-3 sm:py-4 px-4">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                    CHED Regional Office XII, Regional Center, Brgy. Carpenter Hill, Koronadal City, South Cotabato, Philippines
                </div>
                <div className="text-xs text-gray-500">
                    Tel. No.: (083) 228-1130 | Email: chedro12@ched.gov.ph / Website: ched.gov.ph
                </div>
                {/* <div className="text-xs text-gray-500 mt-2">
                    © {new Date().getFullYear()} 
                    <span className="hidden sm:inline"> Commission on Higher Education - Region XII / CheckWithChed.</span>
                    <span className="sm:hidden"> CHED Region XII / CheckWithChed.</span>
                </div> */}
            </footer>
        </div>
    );
}
