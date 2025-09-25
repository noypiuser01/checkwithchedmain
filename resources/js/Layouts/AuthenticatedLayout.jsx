import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page?.props?.auth?.user;

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading... User data not available</div>
            </div>
        );
    }

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {header && (
                <header className="bg-white shadow border-b border-gray-100 sticky top-0 z-50">
                    <div className="max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center">
                            <img src="/images/logo.png" alt="CWCHD Logo" className="h-12 w-auto mr-4" />
                            <div className="flex flex-col">
                                <h4 className="text-lg font-semibold leading-tight text-gray-800">
                                    Commission on Higher Education - Region XII
                                </h4>
                                <span className="text-sm text-gray-500">
                                    Check With CHED
                                </span>
                            </div>
                        </div>
                        
                        {/* User dropdown */}
                        <div className="flex items-center space-x-4">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            {user.name}

                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>
            )}

            <nav className="border-b border-gray-100 bg-white sticky top-16 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-start">
                        {/* Desktop nav links aligned left */}
                        <div className="hidden space-x-8 sm:flex">
                            <NavLink href="/checkwithched" active={router?.page?.url === '/checkwithched'}>
                                Dashboard
                            </NavLink>
                            <NavLink href="/ched-website" active={router?.page?.url === '/ched-website'}>
                                CHED Website
                            </NavLink>
                            <NavLink href="/contact-us" active={router?.page?.url === '/contact-us'}>
                                Contact Us
                            </NavLink>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href="/checkwithched" active={router?.page?.url === '/checkwithched'}>
                            Dashboard
                        </ResponsiveNavLink>

                        <ResponsiveNavLink href="/ched-website" active={router?.page?.url === '/ched-website'}>
                            CHED Website
                        </ResponsiveNavLink>

                        <ResponsiveNavLink href="/contact-us" active={router?.page?.url === '/contact-us'}>
                            Contact Us
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink href={route('profile.edit')}>
                            Profile
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink href={route('logout')} method="post" as="button">
                            Log Out
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <main className="flex-grow">{children}</main>

            <footer className="bg-black text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Address & Office Hours */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                            <p className="text-sm">📍 Address: FV2H+V6P, Regional Center, Brgy. Carpenter Hill, AH26, Koronadal, Timog Cotabato</p>
                            <p className="text-sm mt-2">🕘 Office Hours: 8:00 AM – 5:00 PM</p>
                            <p className="text-sm mt-2">📧 Email: <a href="mailto:chedcar@ched.gov.ph" className="underline">chedcar@ched.gov.ph</a></p>
                            <p className="text-sm mt-2">📞 Contact Nos.: (074) 442 2418 / 4052</p>
                        </div>

                        {/* Useful Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
                            <ul className="text-sm space-y-2">
                                <li><a href="https://ched.gov.ph" target="_blank" className="hover:underline">CHED Website</a></li>
                                <li><a href="#" className="hover:underline">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs">
                        <p>© {new Date().getFullYear()} Commission on Higher Education - Region XII. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
