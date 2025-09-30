import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, Save, Plus, X, Trash2 } from 'lucide-react';
import AdminLayout from '@/Components/Admin/AdminLayout';

export default function AddCurriculum({ existingCurricula = [], admin }) {
    const [formData, setFormData] = useState({
        curriculumName: '',
        programName: '',
        courses: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        if (!formData.curriculumName.trim() || !formData.programName.trim()) {
            setErrors({
                curriculumName: !formData.curriculumName.trim() ? 'CMO/PSG name is required' : '',
                programName: !formData.programName.trim() ? 'Program name is required' : ''
            });
            setIsSubmitting(false);
            return;
        }
        const processedFormData = {
            ...formData,
            courses: formData.courses.map(course => ({
                ...course,
                totalUnits: course.totalUnits ? parseFloat(course.totalUnits) || 0 : '',
                lecUnits: course.lecUnits ? parseFloat(course.lecUnits) || 0 : '',
                labUnits: course.labUnits ? parseFloat(course.labUnits) || 0 : ''
            }))
        };

        router.post('/admin/curriculum', processedFormData, {
            onSuccess: () => {
                setIsSubmitting(false);
                window.location.href = '/admin/CurriculumList';
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            }
        });
    };

    const addCourse = () => {
        setFormData(prev => ({
            ...prev,
            courses: [...prev.courses, { 
                code: "", 
                category: "", 
                title: "", 
                totalUnits: "", 
                lecUnits: "", 
                labUnits: "", 
                prereq: "" 
            }]
        }));
    };

    const removeCourse = (index) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.filter((_, i) => i !== index)
        }));
    };

    const updateCourse = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.map((course, i) => 
                i === index ? { ...course, [field]: value } : course
            )
        }));
    };

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo1.png" />
            </Head>
            <AdminLayout activeTab="add-curriculum" admin={admin}>
                <div className="min-h-screen bg-gray-50 py-6">
                    <div className="max-w-7xl mx-auto px-4">
                     {/* Header */}
                        <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">
                             Add CHED Memorandum Order (CMO) / Policies, Standards and Guidelines
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Create and manage CMO/PSG details with program and course information.
                        </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-lg shadow border">
                            <form onSubmit={handleSubmit}>
                                {/* Basic Information */}
                         <div className="p-6 border-b">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CMO/PSG Name *
                                    </label>
                                        <input
                                        type="text"
                                                name="curriculumName"
                                                value={formData.curriculumName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors.curriculumName 
                                                        ? 'border-red-300' 
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="Enter CMO/PSG name"
                                            />
                                            {errors.curriculumName && (
                                                <p className="text-red-600 text-sm mt-1">{errors.curriculumName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Program Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="programName"
                                                value={formData.programName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors.programName 
                                                        ? 'border-red-300' 
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="Enter program name"
                                            />
                                            {errors.programName && (
                                                <p className="text-red-600 text-sm mt-1">{errors.programName}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Courses Section */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-medium text-gray-900">Courses</h2>
                                        <button
                                            type="button"
                                            onClick={addCourse}
                                            className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md flex items-center space-x-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Courses</span>
                                        </button>
                                    </div>

                                    {formData.courses.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 mb-4">No CMO/PSG added yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200 rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Course Code</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Category</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Course Title</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Total Units</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Lec Units</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Lab Units</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Prerequisites</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {formData.courses.map((course, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4F py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.code}
                                                                    onChange={(e) => updateCourse(idx, 'code', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="e.g., CS101"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <select
                                                                    value={course.category}
                                                                    onChange={(e) => updateCourse(idx, 'category', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                >
                                                                    <option value="">Select Category</option>
                                                                    <option value="General Education">General Education</option>
                                                                    <option value="General Education Core Courses">General Education Core Courses</option>
                                                                    <option value="General Education Elective Courses">General Education Elective Courses</option>
                                                                    <option value="General Education Mandated Course">General Education Mandated Course</option>
                                                                    <option value="Core Courses">Core Courses</option>
                                                                    <option value="Research Courses">Research Courses</option>
                                                                    <option value="Internship Courses">Internship Courses</option>
                                                                    <option value="Professional Domain Course">Professional Domain</option>
                                                                    <option value="Common Course">Common Course</option>
                                                                    <option value="Professional Course">Professional Course</option>
                                                                    <option value="Professional Electives">Professional Electives</option>
                                                                    <option value="PE">PE</option>
                                                                    <option value="Physical Education Courses">Physical Education Courses</option>
                                                                    <option value="NSTP">NSTP</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.title}
                                                                    onChange={(e) => updateCourse(idx, 'title', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="Enter course title"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.totalUnits}
                                                                    onChange={(e) => updateCourse(idx, 'totalUnits', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="3"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.lecUnits}
                                                                    onChange={(e) => updateCourse(idx, 'lecUnits', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="3"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.labUnits}
                                                                    onChange={(e) => updateCourse(idx, 'labUnits', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <input
                                                                    type="text"
                                                                    value={course.prereq || ''}
                                                                    onChange={(e) => updateCourse(idx, 'prereq', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="e.g., CS100, MATH101"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCourse(idx)}
                                                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                                    title="Remove course"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => window.location.href = '/admin/dashboard'}
                                        className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-6 py-2 rounded-md"
                                    >
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}