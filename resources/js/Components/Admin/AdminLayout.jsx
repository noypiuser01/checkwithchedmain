import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, activeTab = 'dashboard', admin }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} admin={admin} />
            
            {/* Main content */}
            <main className="flex-grow pt-0">
                {/* Top navbar (converted from sidebar) */}
                <AdminSidebar 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    activeTab={activeTab}
                />

                {/* Content area */}
                <div className="bg-gray-100 min-w-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
