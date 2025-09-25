import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Layers, 
    Search, 
    Edit, 
    Filter, 
    ChevronDown, 
    BookOpen, 
    X, 
    Plus, 
    Trash2,
    Eye,
    EyeOff
} from 'lucide-react';
import AdminLayout from '@/Components/Admin/AdminLayout';

export default function CurriculumList({ 
    curricula = [], 
    groupedCurricula = [], 
    success = null, 
    error = null,
    admin
}) {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [editFormData, setEditFormData] = useState({
        curriculumName: '',
        programName: '',
        courses: []
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [localGroupedCurricula, setLocalGroupedCurricula] = useState(groupedCurricula);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [showCoursesModal, setShowCoursesModal] = useState(false);
    const [modalProgram, setModalProgram] = useState(null);
    const [modalSemester, setModalSemester] = useState(null);
    const [activeViewSemesterId, setActiveViewSemesterId] = useState(null);
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
    const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);
    const [showDeleteCurriculumModal, setShowDeleteCurriculumModal] = useState(false);
    const [curriculumToDelete, setCurriculumToDelete] = useState(null);
    const [isDeletingCurriculum, setIsDeletingCurriculum] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);

    useEffect(() => {
        setLocalGroupedCurricula(groupedCurricula);
    }, [groupedCurricula]);

    useEffect(() => {
        if (success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // ============================================================================
    // DATA FILTERING FUNCTIONS
    // ============================================================================
    
    // Calculate total units for a curriculum entry
    const calculateTotalUnits = (curriculum) => {
        let totalUnits = 0;
        curriculum.semesters.forEach(semester => {
            if (semester.courses) {
                semester.courses.forEach(course => {
                    totalUnits += parseFloat(course.total_units || 0);
                });
            }
        });
        return totalUnits;
    };
    
    // Filter curricula based on search term
    const filteredData = (curricula || []).filter(item => {
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch = 
            ((item.curriculum_name || '').toLowerCase().includes(searchLower)) ||
            ((item.program_name || '').toLowerCase().includes(searchLower)) ||
            ((item.year_level || '').toLowerCase().includes(searchLower)) ||
            ((item.semester || '').toLowerCase().includes(searchLower));
        return matchesSearch;
    });

    // Function to determine curriculum status (Active/Inactive)
    const getCurriculumStatus = (curriculum) => {
        const extractCMOInfo = (curriculumName) => {
            const match = curriculumName.match(/CMO\s*No\.?\s*(\d+).*?(\d{4})/i);
            return match ? { number: parseInt(match[1]), year: parseInt(match[2]) } : null;
        };
        
        const currentCMO = extractCMOInfo(curriculum.curriculum_name);
        if (!currentCMO) return 'Active'; // If no CMO info, consider it active
        
        // Find all curricula with the same CMO number
        const sameCMOCurricula = localGroupedCurricula.filter(c => {
            const cmoInfo = extractCMOInfo(c.curriculum_name);
            return cmoInfo && cmoInfo.number === currentCMO.number;
        });
        
        // If only one curriculum with this CMO number, it's active
        if (sameCMOCurricula.length === 1) return 'Active';
        
        // Find the highest year for this CMO number
        const highestYear = Math.max(...sameCMOCurricula.map(c => {
            const cmoInfo = extractCMOInfo(c.curriculum_name);
            return cmoInfo ? cmoInfo.year : 0;
        }));
        
        // If this curriculum has the highest year, it's active
        return currentCMO.year === highestYear ? 'Active' : 'Inactive';
    };

    // Filter grouped curricula based on search term and status
    const filteredGroupedData = localGroupedCurricula.filter(curriculum => {
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch = (
            (curriculum.curriculum_name || '').toLowerCase().includes(searchLower) ||
            (curriculum.program_name || '').toLowerCase().includes(searchLower) ||
            (Array.isArray(curriculum.semesters) && curriculum.semesters.some(semester => 
                ((semester.year_level || '').toLowerCase().includes(searchLower)) ||
                ((semester.semester || '').toLowerCase().includes(searchLower))
            ))
        );
        
        // Apply status filter
        const status = getCurriculumStatus(curriculum).toLowerCase();
        const matchesStatus = selectedFilter === 'all' || status === selectedFilter;
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        // First, sort by status: Active first, Inactive last
        const statusA = getCurriculumStatus(a) === 'Active' ? 0 : 1;
        const statusB = getCurriculumStatus(b) === 'Active' ? 0 : 1;
        if (statusA !== statusB) return statusA - statusB;

        // Then, within the same status, sort by CMO year (lowest to highest)
        const extractCMOInfo = (curriculumName) => {
            const match = curriculumName.match(/CMO\s*No\.?\s*(\d+).*?(\d{4})/i);
            return match ? { number: parseInt(match[1]), year: parseInt(match[2]) } : { number: 9999, year: 9999 };
        };
        
        const cmoInfoA = extractCMOInfo(a.curriculum_name);
        const cmoInfoB = extractCMOInfo(b.curriculum_name);
        
        // Sort by year first (lowest to highest)
        if (cmoInfoA.year !== cmoInfoB.year) {
            return cmoInfoA.year - cmoInfoB.year;
        }
        
        // If years are the same, sort by CMO number (lowest to highest)
        if (cmoInfoA.number !== cmoInfoB.number) {
            return cmoInfoA.number - cmoInfoB.number;
        }
        
        // If both year and number are the same, sort by program name alphabetically
        return a.program_name.localeCompare(b.program_name);
    });

    // Pagination calculations
    const totalItems = filteredGroupedData.flatMap(c => (c.semesters || [])).length;
    const effectivePageSize = pageSize === 'all' ? totalItems || 1 : pageSize;
    const totalPages = Math.max(1, Math.ceil(totalItems / (effectivePageSize || 1)));
    const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * effectivePageSize;
    const endIndex = pageSize === 'all' ? totalItems : startIndex + effectivePageSize;
    
    // Get paginated data - sort semesters within each curriculum first
    const paginatedData = filteredGroupedData.flatMap(c => 
        (c.semesters || []).sort((a, b) => {
            // Sort semesters by year level first, then by semester
            const yearA = parseInt(a.year_level) || 0;
            const yearB = parseInt(b.year_level) || 0;
            if (yearA !== yearB) return yearA - yearB;
            
            // If same year level, sort by semester
            const semesterOrder = { '1st': 1, '2nd': 2, 'Summer': 3 };
            const semesterA = semesterOrder[a.semester] || 999;
            const semesterB = semesterOrder[b.semester] || 999;
            return semesterA - semesterB;
        })
    ).slice(startIndex, endIndex);
    
    // Reset to first page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilter, pageSize]);

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Handle curriculum editing - opens edit modal with current data
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
                category: course.category || '',
                title: course.title,
                totalUnits: course.total_units,
                lecUnits: course.lec_units,
                labUnits: course.lab_units,
                prereq: course.prereq || ''
            })) : []
        });
        setIsEditModalOpen(true);
    };



    // Handle form input changes for curriculum name and program name
    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle course field changes in the edit form
    const handleCourseChange = (index, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            courses: prev.courses.map((course, i) => 
                i === index ? { ...course, [field]: value } : course
            )
        }));
    };

    // Add a new course to the edit form
    const addCourse = () => {
        setEditFormData(prev => ({
            ...prev,
            courses: [...prev.courses, {
                code: '',
                title: '',
                totalUnits: '',
                lecUnits: '',
                labUnits: '',
                prereq: ''
            }]
        }));
    };

    // Remove a course from the edit form - shows confirmation modal
    const removeCourse = (index) => {
        // Get the course to be deleted
        const courseToDelete = editFormData.courses[index];
        
        // Set the course to delete and show modal
        setCourseToDelete({ ...courseToDelete, index });
        setShowDeleteCourseModal(true);
    };

    // Confirm course deletion - handles both database and local state
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
                    alert('Failed to delete course. Please try again.');
                    setIsDeletingCourse(false);
                }
            })
            .catch(error => {
                console.error('Failed to delete course:', error);
                alert('Failed to delete course. Please try again.');
                setIsDeletingCourse(false);
            });
        } else {
            // If it's a new course (no ID), just remove from local state
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

    // Cancel course deletion - closes modal and resets state
    const cancelDeleteCourse = () => {
        setShowDeleteCourseModal(false);
        setCourseToDelete(null);
        setIsDeletingCourse(false);
    };

    // Handle curriculum deletion - shows confirmation modal
    const handleDeleteCurriculum = (curriculumData) => {
        setCurriculumToDelete(curriculumData);
        setShowDeleteCurriculumModal(true);
    };

    // Confirm curriculum deletion - handles database deletion
    const confirmDeleteCurriculum = () => {
        if (!curriculumToDelete) return;
        
        setIsDeletingCurriculum(true);
        
        // Use fetch to delete the curriculum
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
            } else {
                alert('Failed to delete curriculum. Please try again.');
                setIsDeletingCurriculum(false);
            }
        })
        .catch(error => {
            console.error('Failed to delete curriculum:', error);
            alert('Failed to delete curriculum. Please try again.');
            setIsDeletingCurriculum(false);
        });
    };

    // Cancel curriculum deletion - closes modal and resets state
    const cancelDeleteCurriculum = () => {
        setShowDeleteCurriculumModal(false);
        setCurriculumToDelete(null);
        setIsDeletingCurriculum(false);
    };


    // Open the courses modal for a specific semester
    const openSemesterCoursesModal = (program, semester) => {
        setModalProgram(program);
        setModalSemester(semester);
        setActiveViewSemesterId(semester?.id ?? null);
        setShowCoursesModal(true);
    };

    // Handle curriculum update - validates and submits the form
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

        // Send the update request to the server
        router.put(`/admin/curriculum/${selectedCurriculum.id}`, editFormData, {
            onSuccess: () => {
                // Update the local state to reflect the changes and maintain sorting
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
                                            courses: editFormData.courses.map(course => ({
                                                code: course.code,
                                                title: course.title,
                                                total_units: parseFloat(course.totalUnits),
                                                lec_units: parseFloat(course.lecUnits),
                                                lab_units: parseFloat(course.labUnits),
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
                    
                    // Sort the updated curricula by CMO number
                    return updated.sort((a, b) => {
                        const extractCMONumber = (curriculumName) => {
                            const match = curriculumName.match(/CMO\s*No\.?\s*(\d+)/i);
                            return match ? parseInt(match[1]) : 9999;
                        };
                        
                        const cmoNumberA = extractCMONumber(a.curriculum_name);
                        const cmoNumberB = extractCMONumber(b.curriculum_name);
                        
                        return cmoNumberA - cmoNumberB;
                    });
                });

                // Close the modal and reset the form
                setIsUpdating(false);
                setIsEditModalOpen(false);
                setSelectedCurriculum(null);
                setEditFormData({
                    curriculumName: '',
                    programName: '',
                    courses: []
                });

                // Show success modal
                setShowEditSuccessModal(true);
            },
            onError: (errors) => {
                setIsUpdating(false);
                console.error('Update failed:', errors);
                alert('Failed to update curriculum. Please check your input and try again.');
            }
        });

        // Close the confirmation modal
        setShowEditConfirmModal(false);
    };

    const cancelEditUpdate = () => {
        setShowEditConfirmModal(false);
    };

    // ============================================================================
    // MODAL HANDLERS
    // ============================================================================
    
    // Close edit success modal
    const closeEditSuccessModal = () => {
        setShowEditSuccessModal(false);
    };

    
    // ============================================================================
    // RENDER COMPONENT
    // ============================================================================
    
    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <AdminLayout activeTab="curriculum-list" admin={admin}>
                <div className="p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                    <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <Layers className="h-7 w-7 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                        List CHED Memorandum Order / Policies, Standards and Guidelines
                        </h2>
                    </div>
                    <p className="text-gray-600 text-sm indent-12">
                        View and manage all CMO/PSG entries in the system.
                    </p>
                    </div>
                        {/* Search and Filter Section */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search curriculum..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                {/* Filter Dropdown */}
                                            <div className="sm:w-48">
                                                <div className="relative">
                                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <select
                                                        value={selectedFilter}
                                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                                    >
                                                        <option value="all">All Status</option>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>

                                {/* Show Entries Dropdown */}
                                            <div className="sm:w-48">
                                                <div className="relative">
                                                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <select
                                                        value={pageSize}
                                                        onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                                        title="Show entries"
                                                    >
                                                        <option value="5">Show 5 entries</option>
                                                        <option value="10">Show 10 entries</option>
                                                        <option value="25">Show 25 entries</option>
                                                        <option value="50">Show 50 entries</option>
                                                        <option value="all">Show all entries</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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

                                    {/* Inactive Programs */}
                                    {(() => {
                                        const inactive = localGroupedCurricula.filter(c => getCurriculumStatus(c) === 'Inactive');
                                        if (inactive.length === 0) return null;
                                        return null;
                                    })()}

                                    {/* Flat Curricula List */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((semester) => {
                                                // Find the parent curriculum for this semester
                                                const curriculum = filteredGroupedData.find(c => 
                                                    c.semesters.some(s => s.id === semester.id)
                                                );
                                                return (
                                                    <div key={semester.id} className="border-b border-gray-200 last:border-b-0">
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
                                                                          <span className="inline-flex px-3 py-1 text-sm font-medium  text-red-800 rounded-full">
                                                                             {semester.semester}
                                                                               </span>
                                                                                  </div>
                                                                                  </>
                                                                          )}
                                                                     <button 
                                                                onClick={() => {
                                                                    if (activeViewSemesterId === semester.id) {
                                                                        setShowCoursesModal(false);
                                                                        setActiveViewSemesterId(null);
                                                                        setModalProgram(null);
                                                                        setModalSemester(null);
                                                                    } else {
                                                                        openSemesterCoursesModal(curriculum, semester);
                                                                    }
                                                                }}
                                                           className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${activeViewSemesterId === semester.id ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                                                                    >
                                                          {activeViewSemesterId === semester.id ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                                               {activeViewSemesterId === semester.id ? 'Hide' : 'View'}
                                                                    </button>
                                                                <div>
                                                                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                                            getCurriculumStatus(curriculum) === 'Active' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                   : 'bg-red-100 text-red-800'
                                             }`}>
                                                      {getCurriculumStatus(curriculum)}
                                                           </span>
                                                               </div>
                                                                   </div>
                                                                    <div className="flex items-center space-x-2 ml-4">
                                                                    {getCurriculumStatus(curriculum) === 'Active' && (
                                                                    <button 
                                                                        onClick={() => handleEdit({ ...curriculum, ...semester })}
                                                                        className="inline-flex items-center justify-center p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200"
                                                                        title="Edit Curriculum"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    )}
                                                                    {/* Delete - For Super Admin and Admin */}
                                                                    {(admin?.type === 'super_admin' || admin?.type === 'admin') && (
                                                                        <button 
                                                                            onClick={() => handleDeleteCurriculum({ ...curriculum, ...semester })}
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
                                </AdminLayout>



            {/* Edit Curriculum Modal */}
            {isEditModalOpen && selectedCurriculum && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">CMO/PSG details</h3>
                                <p className="text-gray-600 mt-1">{selectedCurriculum.curriculum_name}</p>
                                {/* Curriculum Status Indicator */}
                                {selectedCurriculum && (() => {
                                    // Find the original curriculum from localGroupedCurricula to get correct status
                                    const originalCurriculum = localGroupedCurricula.find(c => 
                                        c.curriculum_name === selectedCurriculum.curriculum_name && 
                                        c.program_name === selectedCurriculum.program_name
                                    );
                                    return originalCurriculum && getCurriculumStatus(originalCurriculum) === 'Inactive';
                                })() && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">!</span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-red-800">
                                                    This curriculum is <strong>Inactive</strong> and no longer in use.
                                                </p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    Consider using the latest version of this CMO/PSG instead.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Active status info removed as requested */}
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedCurriculum(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CMO/PSG Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.curriculumName}
                                        onChange={(e) => handleInputChange('curriculumName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.programName}
                                        onChange={(e) => handleInputChange('programName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                            </div>

                            {/* Courses Section */}
                            <div className="mb-8">
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 text-lg mb-3">Courses</h4>
                                </div>
                                {editFormData.courses && editFormData.courses.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Course Code
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Category
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Course Title
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Total Units
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Lec Units
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Lab Units
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider border-r border-gray-200">
                                                        Prerequisite
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {editFormData.courses.map((course, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.code}
                                                                onChange={(e) => handleCourseChange(index, 'code', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Course Code"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <select
                                                                value={course.category || ''}
                                                                onChange={(e) => handleCourseChange(index, 'category', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                            >
                                                                <option value="">Select Category</option>
                                                                <option value="General Education">General Education</option>
                                                                <option value="General Education Core Courses">General Education Core Courses</option>
                                                                <option value="General Education Elective Courses">General Education Elective Courses</option>
                                                                <option value="General Education Mandated Course">General Education Mandated Course</option>
                                                                <option value="Core Courses">Core Courses</option>
                                                                <option value="Research Courses">Research Courses</option>
                                                                <option value="Internship Courses">Internship Courses</option>
                                                                <option value="Professional Domain Course">Professional Domain Course</option>
                                                                <option value="Common Course">Common Course</option>
                                                                <option value="Professional Course">Professional Course</option>
                                                                <option value="Professional Electives">Professional Electives</option>
                                                                <option value="PE">PE</option>
                                                                <option value="Physical Education Courses">Physical Education Courses</option>
                                                                <option value="NSTP">NSTP</option>
                                                                <option value="Professional Course Electives (Business Analytics)">Professional Course Electives (Business Analytics)</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.title}
                                                                onChange={(e) => handleCourseChange(index, 'title', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Course Title"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.totalUnits}
                                                                onChange={(e) => handleCourseChange(index, 'totalUnits', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="3"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.lecUnits}
                                                                onChange={(e) => handleCourseChange(index, 'lecUnits', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="3"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.labUnits}
                                                                onChange={(e) => handleCourseChange(index, 'labUnits', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={course.prereq}
                                                                onChange={(e) => handleCourseChange(index, 'prereq', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Prerequisite"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => removeCourse(index)}
                                                                className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
                                                                title="Remove Course"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200" colSpan={3}>
                                                        Total Courses: {editFormData.courses.length}
                                                    </td>
                                                    <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                        {(() => {
                                                            const total = editFormData.courses.reduce((sum, course) => 
                                                                sum + parseFloat(course.totalUnits || 0), 0);
                                                            return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                        {(() => {
                                                            const total = editFormData.courses.reduce((sum, course) => 
                                                                sum + parseFloat(course.lecUnits || 0), 0);
                                                            return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-3 text-left text-xs font-semibold text-gray-700 border-t border-gray-200">
                                                        {(() => {
                                                            const total = editFormData.courses.reduce((sum, course) => 
                                                                sum + parseFloat(course.labUnits || 0), 0);
                                                            return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString();
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-3 text-left text-xs text-gray-500 border-t border-gray-200" colSpan={2}></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                        
                                        {/* Actions under the table */}
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button
                                                onClick={addCourse}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 text-sm flex items-center"
                                                title="Add Course"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Course
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={isUpdating}
                                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm flex items-center ${
                                                    isUpdating 
                                                        ? 'bg-blue-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                                title="Update Curriculum"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Update
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">No courses added yet.</p>
                                        <p className="text-sm text-gray-400">Click "Add Course" to get started.</p>
                                      
                                    </div>
                                )}
                            </div>
                            {/* Default actions when there are no courses */}
                            {(!editFormData.courses || editFormData.courses.length === 0) && (
                                <div className="mt-6 flex justify-center sm:justify-end sm:pr-2 gap-3">
                                    <button
                                        onClick={addCourse}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 text-sm flex items-center"
                                        title="Add Course"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Course
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isUpdating}
                                        className={`px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm flex items-center ${
                                            isUpdating 
                                                ? 'bg-blue-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                        title="Update Curriculum"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                          </div>
                        

                        {/* Modal Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedCurriculum(null);
                                    setEditFormData({
                                        curriculumName: '',
                                        programName: '',
                                        courses: []
                                    });
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
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
                            <p className="text-sm text-gray-600">
                                Are you sure you want to update this curriculum?
                            </p>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                            <button
                                onClick={cancelEditUpdate}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEditUpdate}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                            >
                                Update
                            </button>
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

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end p-4 border-t border-gray-200">
                            <button
                                onClick={closeEditSuccessModal}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Course Confirmation Modal */}
            {showDeleteCourseModal && courseToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-medium">"{courseToDelete.title || courseToDelete.code || 'this course'}"</span>? This action cannot be undone.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelDeleteCourse}
                                    disabled={isDeletingCourse}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCourse}
                                    disabled={isDeletingCourse}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isDeletingCourse ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Curriculum Confirmation Modal */}
            {showDeleteCurriculumModal && curriculumToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Curriculum</h3>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-medium">"{curriculumToDelete.curriculum_name}"</span>? This action cannot be undone.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelDeleteCurriculum}
                                    disabled={isDeletingCurriculum}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCurriculum}
                                    disabled={isDeletingCurriculum}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isDeletingCurriculum ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses Modal */}
            {showCoursesModal && modalSemester && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => { setShowCoursesModal(false); setActiveViewSemesterId(null); setModalProgram(null); setModalSemester(null); }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{modalProgram?.curriculum_name}</h3>
                                <p className="text-sm text-gray-600">{modalProgram?.program_name}</p>
                                {(modalSemester.year_level !== 'N/A' || modalSemester.semester !== 'N/A') && (
                                    <p className="text-sm text-gray-500">{modalSemester.year_level}{modalSemester.year_level !== 'N/A' && modalSemester.semester !== 'N/A' ? ' - ' : ''}{modalSemester.semester}</p>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowCoursesModal(false); setActiveViewSemesterId(null); setModalProgram(null); setModalSemester(null); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 text-center">
                                    PROGRAM CURRICULUM - {modalProgram?.program_name}
                                </h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                    <thead className="bg-[#1e3c73]">
                                        <tr>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Course Code</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Category</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Course Title</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Total Units</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Lec Units</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Lab Units</th>
                                            <th className="px-2 py-1 text-center text-xs font-medium text-white">Prerequisite</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(modalSemester.courses || []).map((course, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">{course.code}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">{course.category || '—'}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200">{course.title}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">{parseFloat(course.total_units) % 1 === 0 ? parseInt(course.total_units) : course.total_units}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">{parseFloat(course.lec_units) % 1 === 0 ? parseInt(course.lec_units) : course.lec_units}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">{parseFloat(course.lab_units) % 1 === 0 ? parseInt(course.lab_units) : course.lab_units}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900">{course.prereq || 'None'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Semester Totals */}
                            <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between text-xs">
                                    <h6 className="font-semibold text-gray-700">Maximum Total Units:</h6>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="font-semibold text-gray-900">{(() => { const total = (modalSemester.courses||[]).reduce((sum, c) => sum + parseFloat(c.total_units || 0), 0); return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString(); })()}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-gray-600">Lec:</span>
                                            <span className="font-semibold text-gray-900">{(() => { const total = (modalSemester.courses||[]).reduce((sum, c) => sum + parseFloat(c.lec_units || 0), 0); return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString(); })()}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-gray-600">Lab:</span>
                                            <span className="font-semibold text-gray-900">{(() => { const total = (modalSemester.courses||[]).reduce((sum, c) => sum + parseFloat(c.lab_units || 0), 0); return total % 1 === 0 ? total.toString() : Number(total.toFixed(1)).toString(); })()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Breakdown (category summary) */}
                            {(() => {
                                const categoryTotals = {};
                                (modalSemester.courses || []).forEach((course) => {
                                    const key = course.category && course.category.trim() !== '' ? course.category : 'Uncategorized';
                                    const units = parseFloat(course.total_units || 0);
                                    categoryTotals[key] = (categoryTotals[key] || 0) + units;
                                });
                                const rows = Object.entries(categoryTotals);
                                const grandTotal = rows.reduce((sum, [, units]) => sum + units, 0);
                                return rows.length > 0 ? (
                                    <div className="mt-4">
                                        <h6 className="font-semibold text-gray-700 mb-2 text-xs">Curriculum Breakdown</h6>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                                <thead className="bg-[#1e3c73]">
                                                    <tr>
                                                        <th className="px-2 py-1 text-center text-xs font-medium text-white border-r border-gray-200">Description</th>
                                                        <th className="px-2 py-1 text-center text-xs font-medium text-white">Total Units</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {rows.map(([category, units]) => (
                                                        <tr key={category} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border-r border-gray-200">{category}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                                                <span className="text-xs font-semibold text-black">{units % 1 === 0 ? units.toString() : Number(units.toFixed(1)).toString()}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50">
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900 border-r border-gray-200">Total</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                                            <span className="text-xs font-semibold text-black">{grandTotal % 1 === 0 ? grandTotal.toString() : Number(grandTotal.toFixed(1)).toString()}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
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
        </>
    );
}
