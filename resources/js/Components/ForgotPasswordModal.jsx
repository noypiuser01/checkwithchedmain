import React from 'react';
import { X } from 'lucide-react';

export default function ForgotPasswordModal({ 
    isOpen, 
    onClose 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Content */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Forgot Password?</h3>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        To reset your password, please contact the system administrator at{' '}
                        <a 
                            href="mailto:admin@ched.gov.ph"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            chedro12@ched.gov.p
                        </a>
                        {' '}or call{' '}
                        <a 
                            href="tel:+63284440000"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                           (083) 228-1130
                        </a>
                        .
                    </p>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
