import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { User, LogOut, Menu } from 'lucide-react';

export default function AdminHeader({ sidebarOpen, setSidebarOpen, admin }) {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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

    const handleLogout = () => {
        window.location.href = '/checkwithched';
    };

    return (
        <header
            className="shadow-lg sticky top-0 z-50 w-full flex items-center"
            style={{
                background: '#1e3c73',
            }}
        >
            {/* Fixed Logo Section (Left) */}
            <div className="flex items-center px-2 sm:px-4 py-2 sticky top-0 z-50">
                <img
                    src="/images/logo.png"
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
                    className="lg:hidden p-1.5 sm:p-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* User profile dropdown */}
                <div className="relative ml-2 sm:ml-3" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        aria-expanded={isProfileDropdownOpen}
                        className="flex items-center text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 hover:bg-blue-700 active:bg-blue-800"
                    >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">
                            Admin
                        </span>
                        <span className="sm:hidden">
                            Admin
                        </span>
                    </button>

                    {/* Dropdown */}
                    {isProfileDropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 sm:w-56 lg:w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeInScale"
                            role="menu"
                            aria-orientation="vertical"
                        >
                            <div className="py-1">
                                {/* Admin Info Section - Show for both Super Admin and Admin */}
                                {admin && (admin.type === 'super_admin' || admin.type === 'admin') && (
                                    <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                admin.type === 'super_admin' 
                                                    ? 'bg-purple-100' 
                                                    : 'bg-blue-100'
                                            }`}>
                                                <User className={`h-4 w-4 ${
                                                    admin.type === 'super_admin' 
                                                        ? 'text-purple-600' 
                                                        : 'text-blue-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    Admin
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {admin.email || 'admin@example.com'}
                                                </p>
                                                <p className={`text-xs ${
                                                    admin.type === 'super_admin' 
                                                        ? 'text-purple-600' 
                                                        : 'text-blue-600'
                                                }`}>
                                                    {admin.type === 'super_admin' 
                                                        ? 'Super Admin' 
                                                        : 'Admin'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                        <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dropdown animatiqon */}
            <style>{`
                .animate-fadeInScale {
                    animation: fadeInScale 0.2s ease-out forwards;
                }
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </header>
    );
}
