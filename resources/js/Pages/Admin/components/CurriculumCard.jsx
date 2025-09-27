import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function CurriculumCard({ 
    semester, 
    curriculum, 
    activeViewSemesterId, 
    onViewToggle, 
    onEdit, 
    onDelete, 
    getCurriculumStatus, 
    calculateTotalUnits, 
    admin 
}) {
    const isActive = getCurriculumStatus(curriculum) === 'Active';
    const isViewing = activeViewSemesterId === semester.id;
    
    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <div className="bg-white px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                                {curriculum.curriculum_name} - {curriculum.program_name}
                            </h3>
                            <div className="mt-1">
                                <span className="text-xs text-gray-600">
                                    Units: {(() => {
                                        const total = calculateTotalUnits(curriculum);
                                        return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                    })()}
                                </span>
                            </div>
                        </div>
                        
                        {(semester.year_level !== 'N/A' || semester.semester !== 'N/A') && (
                            <>
                                <div>
                                    <span className="inline-flex px-3 py-1 text-sm font-medium text-blue-800 rounded-full">
                                        {semester.year_level}
                                    </span>
                                </div>
                                <div>
                                    <span className="inline-flex px-3 py-1 text-sm font-medium text-red-800 rounded-full">
                                        {semester.semester}
                                    </span>
                                </div>
                            </>
                        )}
                        
                        <button 
                            onClick={() => onViewToggle(semester, curriculum)}
                            className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                                isViewing 
                                    ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' 
                                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}
                        >
                            {isViewing ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                            {isViewing ? 'Hide' : 'View'}
                        </button>
                        
                        <div className="relative group">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                isActive 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {getCurriculumStatus(curriculum)}
                            </span>
                            {!isActive && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    This curriculum is inactive because a newer version exists
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                        {isActive && (
                            <button 
                                onClick={() => onEdit({ ...curriculum, ...semester })}
                                className="inline-flex items-center justify-center p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200"
                                title="Edit Curriculum"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        )}
                        
                        {(admin?.type === 'super_admin' || admin?.type === 'admin') && (
                            <button 
                                onClick={() => onDelete({ ...curriculum, ...semester })}
                                className="inline-flex items-center justify-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200"
                                title="Delete Curriculum"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
