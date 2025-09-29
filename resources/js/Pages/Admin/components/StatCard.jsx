import React from 'react';

export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    iconBgColor = "bg-blue-50", 
    iconColor = "text-blue-600",
    additionalInfo = null 
}) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-3xl font-light text-gray-900 mt-2">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                    {additionalInfo && (
                        <div className="flex items-center mt-2 space-x-4 text-xs">
                            {additionalInfo}
                        </div>
                    )}
                </div>
                <div className={`p-3 ${iconBgColor} rounded-xl`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}
