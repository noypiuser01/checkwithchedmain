import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Layers, X } from 'lucide-react';
import AdminLayout from '@/Components/Admin/AdminLayout';

// Import components
import SearchAndFilter from './components/SearchAndFilter';
import CurriculumCard from './components/CurriculumCard';
import EditCurriculumModal from './components/EditCurriculumModal';
import ViewCoursesModal from './components/ViewCoursesModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

// Import hooks
import { useCurriculumData } from './hooks/useCurriculumData';
import { useCurriculumFiltering } from './hooks/useCurriculumFiltering';
import { usePagination } from './hooks/usePagination';

export default function CurriculumList({ 
    curricula = [], 
    groupedCurricula = [], 
    success = null, 
    error = null,
    admin
}) {
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [pageSize, setPageSize] = useState(5);
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [editFormData, setEditFormData] = useState({
        curriculumName: '',
        programName: '',
        courses: []
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
    // View courses modal
    const [showCoursesModal, setShowCoursesModal] = useState(false);
    const [modalProgram, setModalProgram] = useState(null);
    const [modalSemester, setModalSemester] = useState(null);
    const [activeViewSemesterId, setActiveViewSemesterId] = useState(null);
    
    // Delete modals
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);
    const [showDeleteCurriculumModal, setShowDeleteCurriculumModal] = useState(false);
    const [curriculumToDelete, setCurriculumToDelete] = useState(null);
    const [isDeletingCurriculum, setIsDeletingCurriculum] = useState(false);
    
    // Other modals
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
    const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

    // Custom hooks
    const { localGroupedCurricula, setLocalGroupedCurricula, calculateTotalUnits, getCurriculumStatus } = useCurriculumData(groupedCurricula);
    const { filteredGroupedData, flattenedData } = useCurriculumFiltering(localGroupedCurricula, searchTerm, selectedFilter, getCurriculumStatus);
    const { 
        currentPage, 
        totalPages, 
        totalItems, 
        startIndex, 
        endIndex, 
        paginatedData, 
        handlePageChange, 
        handlePreviousPage, 
        handleNextPage,
        resetPagination
    } = usePagination(flattenedData, pageSize);

    // Effects
    useEffect(() => {
        if (success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Reset pagination when search term or filter changes
    useEffect(() => {
        resetPagination();
    }, [searchTerm, selectedFilter, resetPagination]);

    // Event handlers
    const handleEdit = (curriculumData) => {
        // Extract the curriculum object from the merged data
        const curriculum = {
            id: curriculumData.id,
            curriculum_name: curriculumData.curriculum_name,
            program_name: curriculumData.program_name,
            semesters: curriculumData.semesters || []
        };
        
        setSelectedCurriculum(curriculum);
        setEditFormData({
            curriculumName: curriculum.curriculum_name,
            programName: curriculum.program_name,
            courses: curriculumData.courses ? curriculumData.courses.map(course => ({
                id: course.id, // Include the course ID for deletion
                code: course.code,
                category: course.category,
                title: course.title,
                totalUnits: course.total_units,
                lecUnits: course.lec_units,
                labUnits: course.lab_units,
                prereq: course.prereq
            })) : []
        });
        setIsEditModalOpen(true);
    };

    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCourseChange = (index, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            courses: prev.courses.map((course, i) => 
                i === index ? { ...course, [field]: value } : course
            )
        }));
    };

    const addCourse = () => {
        setEditFormData(prev => ({
            ...prev,
            courses: [...prev.courses, {
                id: null, // New courses don't have an ID yet
                code: '',
                title: '',
                category: '',
                totalUnits: '',
                lecUnits: '',
                labUnits: '',
                prereq: ''
            }]
        }));
    };

    const removeCourse = (index) => {
        setCourseToDelete({ ...editFormData.courses[index], index });
        setShowDeleteCourseModal(true);
    };

    const confirmDeleteCourse = () => {
        if (!courseToDelete) return;
        
        setIsDeletingCourse(true);

        // If the course has an ID (existing course), delete it from database
        if (courseToDelete.id) {
            // Use fetch instead of Inertia router to avoid response issues
            fetch(`/admin/curriculum-course/${courseToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove from local state after successful deletion
        setEditFormData(prev => ({
            ...prev,
                        courses: prev.courses.filter((_, i) => i !== courseToDelete.index)
                    }));
                    
                    // Close modal and reset state
                    setShowDeleteCourseModal(false);
                    setCourseToDelete(null);
                    setIsDeletingCourse(false);
                } else {
                    throw new Error(data.message || 'Failed to delete course');
                }
            })
            .catch(error => {
                console.error('Delete course failed:', error);
                setIsDeletingCourse(false);
                setShowDeleteCourseModal(false);
                alert('Failed to delete course. Please try again.');
            });
        } else {
            // For new courses (no ID), just remove from local state
            setEditFormData(prev => ({
                ...prev,
                courses: prev.courses.filter((_, i) => i !== courseToDelete.index)
            }));
            
            // Close modal and reset state
            setShowDeleteCourseModal(false);
            setCourseToDelete(null);
            setIsDeletingCourse(false);
        }
    };

    const cancelDeleteCourse = () => {
        setShowDeleteCourseModal(false);
        setCourseToDelete(null);
        setIsDeletingCourse(false);
    };

    const handleUpdate = () => {
        // Basic validation - only check if curriculum and program names are provided
        if (!editFormData.curriculumName.trim() || !editFormData.programName.trim()) {
            setShowValidationModal(true);
            return;
        }

        // Show confirmation modal
        setShowEditConfirmModal(true);
    };

    const confirmEditUpdate = () => {
        setIsUpdating(true);

        // Prepare the data in the format expected by the backend
        const updateData = {
            curriculumName: editFormData.curriculumName,
            programName: editFormData.programName,
            courses: editFormData.courses.filter(course => 
                // Only include courses that have at least a code or title
                course.code.trim() !== '' || course.title.trim() !== ''
            ).map(course => ({
                code: course.code || '',
                category: course.category || '',
                title: course.title || '',
                totalUnits: course.totalUnits || '0',
                lecUnits: course.lecUnits || '0',
                labUnits: course.labUnits || '0',
                prereq: course.prereq || ''
            }))
        };

        // Send the update request to the server
        router.put(`/admin/curriculum/${selectedCurriculum.id}`, updateData, {
            onSuccess: (page) => {
                // Update the local state to reflect the changes
                setLocalGroupedCurricula(prev => {
                    const updated = prev.map(curriculum => {
                        if (curriculum.id === selectedCurriculum.id) {
                            // Update the curriculum with new data
                            return {
                                ...curriculum,
                                curriculum_name: editFormData.curriculumName,
                                program_name: editFormData.programName,
                                semesters: curriculum.semesters.map(semester => {
                                    if (semester.id === selectedCurriculum.id) {
                                        return {
                                            ...semester,
                                            courses: editFormData.courses.filter(course => 
                                                course.code.trim() !== '' || course.title.trim() !== ''
                                            ).map(course => ({
                                                code: course.code,
                                                title: course.title,
                                                total_units: parseFloat(course.totalUnits) || 0,
                                                lec_units: parseFloat(course.lecUnits) || 0,
                                                lab_units: parseFloat(course.labUnits) || 0,
                                                prereq: course.prereq
                                            }))
                                        };
                                    }
                                    return semester;
                                })
                            };
                        }
                        return curriculum;
                    });
                    return updated;
                });

                // Close modals and reset state
                setIsUpdating(false);
                setShowEditConfirmModal(false);
                setIsEditModalOpen(false);
                setSelectedCurriculum(null);
                setEditFormData({
                    curriculumName: '',
                    programName: '',
                    courses: []
                });
                setShowEditSuccessModal(true);
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
                setIsUpdating(false);
                setShowEditConfirmModal(false);
                alert('Failed to update curriculum. Please check your data and try again.');
            }
        });
    };

    const cancelEditUpdate = () => {
        setShowEditConfirmModal(false);
        setIsUpdating(false);
    };

    const closeEditSuccessModal = () => {
        setShowEditSuccessModal(false);
    };

    const handleDeleteCurriculum = (curriculumData) => {
        setCurriculumToDelete(curriculumData);
        setShowDeleteCurriculumModal(true);
    };

    const confirmDeleteCurriculum = () => {
        if (!curriculumToDelete) return;
        
        setIsDeletingCurriculum(true);
        
        // Use fetch instead of Inertia router to avoid response issues
        fetch(`/admin/curriculum/${curriculumToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
                    .getAttribute('content'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove from local state after successful deletion
                setLocalGroupedCurricula(prev => 
                    prev.filter(curriculum => curriculum.id !== curriculumToDelete.id)
                );
                
                // Close modal and reset state
                setShowDeleteCurriculumModal(false);
                setCurriculumToDelete(null);
                setIsDeletingCurriculum(false);
                
                // Show success modal
                setShowDeleteSuccessModal(true);
            } else {
                throw new Error(data.message || 'Failed to delete curriculum');
            }
        })
        .catch(error => {
            console.error('Delete curriculum failed:', error);
            setIsDeletingCurriculum(false);
            setShowDeleteCurriculumModal(false);
            alert('Failed to delete curriculum. Please try again.');
        });
    };

    const cancelDeleteCurriculum = () => {
        setShowDeleteCurriculumModal(false);
        setCurriculumToDelete(null);
        setIsDeletingCurriculum(false);
    };

    const closeDeleteSuccessModal = () => {
        setShowDeleteSuccessModal(false);
    };

    const openSemesterCoursesModal = (curriculum, semester) => {
        setModalProgram(curriculum);
        setModalSemester(semester);
        setShowCoursesModal(true);
        setActiveViewSemesterId(semester.id);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedCurriculum(null);
        setEditFormData({
            curriculumName: '',
            programName: '',
            courses: []
        });
    };

    const closeViewCoursesModal = () => {
        setShowCoursesModal(false);
        setActiveViewSemesterId(null);
        setModalProgram(null);
        setModalSemester(null);
    };

    const handleViewToggle = (semester, curriculum) => {
        if (activeViewSemesterId === semester.id) {
            closeViewCoursesModal();
        } else {
            openSemesterCoursesModal(curriculum, semester);
        }
    };
    
    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <AdminLayout activeTab="curriculum-list" admin={admin}>
                <div className="p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                        <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                        List CHED Memorandum Order / Policies, Standards and Guidelines
                        </h2>
                            <p className="text-gray-600 text-sm">
                        View and manage all CMO/PSG entries in the system.
                    </p>
                    </div>

                        {/* Search and Filter Section */}
                        <SearchAndFilter
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedFilter={selectedFilter}
                            setSelectedFilter={setSelectedFilter}
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                        />

                                    {/* Success/Error Messages */}
                                    {success && showSuccessMessage && (
                                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-green-800">{success}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">✗</span>
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                        {/* Curricula List */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((semester) => {
                                                // Find the parent curriculum for this semester
                                                const curriculum = filteredGroupedData.find(c => 
                                                    c.semesters.some(s => s.id === semester.id)
                                                );
                                    
                                                return (
                                        <CurriculumCard
                                            key={semester.id}
                                            semester={semester}
                                            curriculum={curriculum}
                                            activeViewSemesterId={activeViewSemesterId}
                                            onViewToggle={handleViewToggle}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteCurriculum}
                                            getCurriculumStatus={getCurriculumStatus}
                                            calculateTotalUnits={calculateTotalUnits}
                                            admin={admin}
                                        />
                                    );
                                })
                                        ) : (
                                            <div className="text-center py-12">
                                                    <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                    <p className="text-lg font-medium">No curriculum found</p>
                                                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
                                            <div className="flex-1 flex justify-between sm:hidden">
                                                <button 
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                <button 
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                                                        <span className="font-medium">{totalItems}</span> curricula
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                        <button 
                                                            onClick={handlePreviousPage}
                                                            disabled={currentPage === 1}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Previous
                                                        </button>
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                            <button
                                                                key={page}
                                                                onClick={() => handlePageChange(page)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                    page === currentPage
                                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        ))}
                                                        <button 
                                                            onClick={handleNextPage}
                                                            disabled={currentPage === totalPages}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Next
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                        </div>
                                    </div>

                {/* Modals */}
                <EditCurriculumModal
                    isOpen={isEditModalOpen}
                    selectedCurriculum={selectedCurriculum}
                    editFormData={editFormData}
                    isUpdating={isUpdating}
                    localGroupedCurricula={localGroupedCurricula}
                    getCurriculumStatus={getCurriculumStatus}
                    onClose={closeEditModal}
                    onInputChange={handleInputChange}
                    onCourseChange={handleCourseChange}
                    onAddCourse={addCourse}
                    onRemoveCourse={removeCourse}
                    onUpdate={handleUpdate}
                />

                <ViewCoursesModal
                    isOpen={showCoursesModal}
                    modalProgram={modalProgram}
                    modalSemester={modalSemester}
                    onClose={closeViewCoursesModal}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteCourseModal}
                    type="course"
                    itemToDelete={courseToDelete}
                    isDeleting={isDeletingCourse}
                    onConfirm={confirmDeleteCourse}
                    onCancel={cancelDeleteCourse}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteCurriculumModal}
                    type="curriculum"
                    itemToDelete={curriculumToDelete}
                    isDeleting={isDeletingCurriculum}
                    onConfirm={confirmDeleteCurriculum}
                    onCancel={cancelDeleteCurriculum}
                />

                {/* Delete Success Modal */}
                {showDeleteSuccessModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                            <div className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
                                    </div>
                                <p className="text-gray-600 mb-6">
                                    Curriculum deleted successfully!
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeDeleteSuccessModal}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                                    >
                                        OK
                                    </button>
                                </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Curriculum Confirmation Modal */}
            {showEditConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Update</h3>
                            <button
                                onClick={cancelEditUpdate}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4">
                                <p className="text-sm text-gray-600 mb-6">
                                    Are you sure you want to update this curriculum? This action will modify the curriculum data permanently.
                            </p>

                                <div className="flex space-x-3">
                            <button
                                onClick={cancelEditUpdate}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEditUpdate}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                            >
                                        {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                                </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Curriculum Success Modal */}
            {showEditSuccessModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Update Successful</h3>
                            <button
                                onClick={closeEditSuccessModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4">
                            <p className="text-sm text-gray-600">
                                Curriculum has been updated successfully.
                            </p>
                        </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end p-4 border-t border-gray-200">
                            <button
                                onClick={closeEditSuccessModal}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 text-lg font-bold">!</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Validation Required</h3>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Please fill in CMO/PSG and Program Name.
                            </p>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowValidationModal(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </AdminLayout>
        </>
    );
}
