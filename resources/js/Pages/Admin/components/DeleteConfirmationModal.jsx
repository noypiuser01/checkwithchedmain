import { Trash2 } from 'lucide-react';

export default function DeleteConfirmationModal({
    isOpen,
    type, // 'course' or 'curriculum'
    itemToDelete,
    isDeleting,
    onConfirm,
    onCancel
}) {
    if (!isOpen || !itemToDelete) return null;

    const isCourse = type === 'course';
    const title = isCourse ? 'Delete Course' : 'Delete Curriculum';
    const itemName = isCourse 
        ? (itemToDelete.title || itemToDelete.code || 'this course')
        : itemToDelete.curriculum_name;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete <span className="font-medium">"{itemName}"</span>? This action cannot be undone.
                    </p>

                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
