import { LayoutDashboard, BookOpen, Layers, X } from 'lucide-react';

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, activeTab = 'dashboard' }) {
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
        <>
            {/* Desktop navbar */}
            <nav className="hidden lg:block w-full bg-white shadow border-b border-gray-200 sticky top-[4rem] z-40">
                <div className="max-w-full px-4">
                    <div className="flex items-center space-x-2">
                        <NavButton
                            isActive={activeTab === 'dashboard'}
                            onClick={() => (window.location.href = '/admin/dashboard')}
                            icon={LayoutDashboard}
                            label="Dashboard"
                        />
                        <NavButton
                            isActive={activeTab === 'add-curriculum'}
                            onClick={() => (window.location.href = '/admin/AddCurriculum')}
                            icon={BookOpen}
                            label="Add CMO/PSG"
                        />
                        <NavButton
                            isActive={activeTab === 'curriculum-list'}
                            onClick={() => (window.location.href = '/admin/CurriculumList')}
                            icon={Layers}
                            label="List CMO/PSG"
                        />
                        {/* Admin list removed as requested */}
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown navbar, controlled by sidebarOpen from header */}
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
                            onClick={() => { setSidebarOpen(false); window.location.href = '/admin/dashboard'; }}
                            className={`w-full text-left inline-flex items-center px-4 py-3 rounded-lg ${
                                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <LayoutDashboard className={`h-5 w-5 mr-3 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setSidebarOpen(false); window.location.href = '/admin/AddCurriculum'; }}
                            className={`w-full text-left inline-flex items-center px-4 py-3 rounded-lg ${
                                activeTab === 'add-curriculum' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <BookOpen className={`h-5 w-5 mr-3 ${activeTab === 'add-curriculum' ? 'text-blue-600' : 'text-gray-400'}`} />
                            Add CMO/PSG
                        </button>
                        <button
                            onClick={() => { setSidebarOpen(false); window.location.href = '/admin/CurriculumList'; }}
                            className={`w-full text-left inline-flex items-center px-4 py-3 rounded-lg ${
                                activeTab === 'curriculum-list' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Layers className={`h-5 w-5 mr-3 ${activeTab === 'curriculum-list' ? 'text-blue-600' : 'text-gray-400'}`} />
                            List CMO/PSG
                        </button>
                        {/* Admin list removed as requested */}
                    </div>
                </div>
            </div>
        </>
    );
}
