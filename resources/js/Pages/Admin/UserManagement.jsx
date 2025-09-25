import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Users, Search, Edit, Filter, Plus, Mail, Phone, Shield, X, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/Components/Admin/AdminLayout';

export default function UserManagement({ users = [], admin }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [localUsers, setLocalUsers] = useState(users);
    const [lastUpdatedUser, setLastUpdatedUser] = useState(null);
    const [updatingUsers, setUpdatingUsers] = useState(new Set());
    
    // Status change confirmation modal state
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [statusChangeData, setStatusChangeData] = useState({ userId: null, newStatus: '', userName: '' });
    
    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Initialize local users when props change
    useEffect(() => {
        setLocalUsers(users);
    }, [users]);

    // Auto-hide success message after 5 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000); // Changed from 5000 to 3000 for faster feedback
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const filteredData = localUsers.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || item.status.toLowerCase() === selectedFilter;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Sort by status: Active users first, Inactive users last
        if (a.status === 'Active' && b.status === 'Inactive') return -1;
        if (a.status === 'Inactive' && b.status === 'Active') return 1;
        // If same status, sort by name alphabetically
        return a.name.localeCompare(b.name);
    });

    const handleDelete = (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/admin/user/${userId}`);
        }
    };

    const handleEdit = (userId) => {
        const userToEdit = localUsers.find(user => user.id === userId);
        console.log('Editing user:', userToEdit);
        setEditingUser({ ...userToEdit });
        setShowEditUserModal(true);
    };

    const handleView = (userId) => {
        router.get(`/admin/user/${userId}`);
    };

    const handleAddUser = () => {
        setShowAddUserModal(true);
    };

    const handleCloseModal = () => {
        setShowAddUserModal(false);
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: '',
            department: '',
            status: 'Active',
            phone: ''
        });
        setShowPassword(false);
    };

    const handleCloseEditModal = () => {
        setShowEditUserModal(false);
        setEditingUser(null);
        setShowEditPassword(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Editing field:', name, 'Value:', value);
        setEditingUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitEditUser = (e) => {
        e.preventDefault();
        setIsUpdating(true);

        // Prepare the data for update (exclude password if empty)
        const updateData = { ...editingUser };
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        console.log('Sending update request:', updateData);

        router.put(`/admin/user/${editingUser.id}`, updateData, {
            onSuccess: () => {
                setIsUpdating(false);
                console.log('User updated successfully');
                // Update local state
                setLocalUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === editingUser.id ? editingUser : user
                    )
                );
                setLastUpdatedUser(editingUser);
                setShowSuccessModal(true);
                handleCloseEditModal();
            },
            onError: (errors) => {
                setIsUpdating(false);
                console.error('Validation errors:', errors);
                // Show error message to user
                if (errors && Object.keys(errors).length > 0) {
                    const errorMessages = Object.values(errors).flat().join('\n');
                    alert(`Validation errors:\n${errorMessages}`);
                } else {
                    alert('Failed to update user. Please check the form and try again.');
                }
            },
            onFinish: () => {
                setIsUpdating(false);
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitNewUser = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/user', newUser, {
            onSuccess: () => {
                setIsSubmitting(false);
                handleCloseModal();
                // Form will be redirected to user management on success
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Validation errors:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleStatusChange = (userId, newStatus) => {
        // Find the user being updated
        const userToUpdate = localUsers.find(user => user.id === userId);
        
        // Show confirmation modal
        setStatusChangeData({
            userId: userId,
            newStatus: newStatus,
            userName: userToUpdate.name
        });
        setShowStatusConfirmModal(true);
    };

    const confirmStatusChange = () => {
        const { userId, newStatus } = statusChangeData;
        
        // Find the user being updated for the success message
        const userToUpdate = localUsers.find(user => user.id === userId);
        
        // Add user to updating set for loading state
        setUpdatingUsers(prev => new Set(prev).add(userId));
        
        // Optimistically update the UI first for real-time feel
        setLocalUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId ? { ...user, status: newStatus } : user
            )
        );

        // Show success message immediately with user details
        setLastUpdatedUser(userToUpdate);
        setShowSuccessModal(true);

        // Get CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!csrfToken) {
            console.error('CSRF token not found');
            alert('Security token missing. Please refresh the page and try again.');
            // Revert the optimistic update
            setLocalUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user
                )
            );
            setUpdatingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            return;
        }

        console.log('Attempting to update user status:', { userId, newStatus, csrfToken });

        // Send the update request to the backend
        fetch(`/admin/user/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            console.log('Response URL:', response.url);
            
            if (response.ok) {
                console.log(`User ${userId} status updated to ${newStatus}`);
                // Success - local state already updated
                return response.json();
            } else {
                // Log the response for debugging
                return response.text().then(text => {
                    console.error('Response text:', text);
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }
        })
        .then(data => {
            if (data && data.success) {
                console.log('Success response:', data);
            }
        })
        .catch(error => {
            console.error('Status update failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                userId,
                newStatus
            });
            
            // Try fallback method using Inertia router
            console.log('Trying fallback method with Inertia router...');
            
            // Revert the optimistic update first
            setLocalUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user
                )
            );
            
            // Use Inertia router as fallback
            router.put(`/admin/user/${userId}/status`, { status: newStatus }, {
                onSuccess: () => {
                    console.log('Fallback method succeeded');
                    // Re-apply the optimistic update
                    setLocalUsers(prevUsers => 
                        prevUsers.map(user => 
                            user.id === userId ? { ...user, status: newStatus } : user
                        )
                    );
                    // Show success modal
                    setLastUpdatedUser(userToUpdate);
                    setShowSuccessModal(true);
                },
                onError: (errors) => {
                    console.error('Fallback method also failed:', errors);
                    alert(`Failed to update user status. Please try refreshing the page. Error: ${error.message}`);
                },
                onFinish: () => {
                    // Remove user from updating set
                    setUpdatingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(userId);
                        return newSet;
                    });
                }
            });
        })
        .finally(() => {
            // Remove user from updating set only if not using fallback
            if (!updatingUsers.has(userId)) {
                setUpdatingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            }
        });

        // Close the confirmation modal
        setShowStatusConfirmModal(false);
        setStatusChangeData({ userId: null, newStatus: '', userName: '' });
    };

    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setStatusChangeData({ userId: null, newStatus: '', userName: '' });
    };

    // Form state for adding new user
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        department: '',
        status: 'Active',
        phone: ''
    });

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <AdminLayout activeTab="user-management" admin={admin}>
                            {/* Topbar */}
                            <div className="flex items-center justify-between h-16 bg-white shadow px-4">
                                <div className="flex items-center space-x-4 ml-4 sm:ml-24">
                                <Users className="h-6 w-6 text-blue-600" />
                                    <h1 className="text-lg font-bold text-gray-900">Admin List</h1>
                                </div>
                                {/* Add Admin button - Only for Super Admin */}
                                {admin?.type === 'super_admin' && (
                                    <button 
                                        onClick={handleAddUser}
                                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Admin
                                    </button>
                                )}
                            </div>

                            {/* Page content */}
                            <div className="p-4 sm:p-6">
                                <div className="max-w-7xl mx-auto">
                                    {/* Header */}
                                    <div className="mb-6">
                                        {/* <div className="flex items-center space-x-3 mb-2">
                                            <Users className="h-6 w-6 text-blue-600" />
                                            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                                        </div> */}
                                        {/* <p className="text-gray-600">Manage system users and their permissions.</p> */}
                                    </div>



                                    {/* Search and Filter */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Search */}
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search users..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Filter */}
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
                                        </div>
                                    </div>

                                    {/* User Table */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            User
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Contact
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Department
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        
                                                        {/* Show Actions column only for Super Admin */}
                                                        {admin?.type === 'super_admin' && (
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredData.length > 0 ? (
                                                        filteredData.map((user) => (
                                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                                {/* User Info */}
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                            <Users className="h-5 w-5 text-blue-600" />
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                            <div className="text-sm text-gray-500">{user.role}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                {/* Contact Info */}
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                                    <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                                                                </td>

                                                                {/* Department */}
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">{user.department}</div>
                                                                </td>

                                                                {/* Status */}
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        user.status === 'Active' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {user.status}
                                                                    </span>
                                                                </td>

                                                                

                                                                {/* Show Actions column only for Super Admin */}
                                                                {admin?.type === 'super_admin' && (
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                        <div className="flex items-center space-x-2">
                                                                            {/* Edit */}
                                                                            <button 
                                                                                onClick={() => handleEdit(user.id)}
                                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
                                                                                title="Edit Admin"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </button>

                                                                            {/* Status Change */}
                                                                            <select
                                                                                value={user.status}
                                                                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                                                                disabled={updatingUsers.has(user.id)}
                                                                                className={`p-1.5 border rounded text-xs focus:outline-none focus:ring focus:ring-blue-200 transition-all duration-200 appearance-none ${
                                                                                    user.status === 'Active' 
                                                                                        ? 'border-green-300 bg-green-50 text-green-700' 
                                                                                        : 'border-blue-300 bg-blue-50 text-blue-700'
                                                                                } ${updatingUsers.has(user.id) ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
                                                                                style={{ backgroundImage: 'none' }}
                                                                                title="Change Status"
                                                                            >
                                                                                <option value="Active">Active</option>
                                                                                <option value="Inactive">Inactive</option>
                                                                            </select>
                                                                            {updatingUsers.has(user.id) && (
                                                                                <div className="ml-1">
                                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={admin?.type === 'super_admin' ? "5" : "4"} className="px-6 py-12 text-center">
                                                                <div className="text-center">
                                                                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                                                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    {filteredData.length > 0 && (
                                        <div className="mt-8 bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg">
                                            <div className="flex-1 flex justify-between sm:hidden">
                                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    Previous
                                                </button>
                                                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of{' '}
                                                        <span className="font-medium">{users.length}</span> results
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                            Previous
                                                        </button>
                                                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                            1
                                                        </button>
                                                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                            Next
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                {/* Add Admin Modal */}
                {showAddUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmitNewUser} className="p-6 space-y-6">
                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={newUser.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={newUser.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="user@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Password and Role */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={newUser.password}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Minimum 6 characters"
                                                minLength="6"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role *
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={newUser.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Super Admin">Super Admin</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Department and Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                            Department *
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={newUser.department}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Administrator">Administrator</option>
                                            <option value="Technical">Technical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={newUser.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 4: Phone (full width) */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={newUser.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+63 912 345 6789"
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        {isSubmitting ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Admin Modal */}
                {showEditUserModal && editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Admin</h3>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmitEditUser} className="p-6 space-y-6">
                                {/* Row 1: Name and Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-name"
                                            name="name"
                                            value={editingUser.name}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="edit-email"
                                            name="email"
                                            value={editingUser.email}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="user@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Password and Role */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showEditPassword ? "text" : "password"}
                                                id="edit-password"
                                                name="password"
                                                value={editingUser.password || ''}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Leave blank to keep current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showEditPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password</p>
                                    </div>
                                    <div>
                                        <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role *
                                        </label>
                                        <select
                                            id="edit-role"
                                            name="role"
                                            value={editingUser.role}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Super Admin">Super Admin</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Department and Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-1">
                                            Department *
                                        </label>
                                        <select
                                            id="edit-department"
                                            name="department"
                                            value={editingUser.department}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Administrator">Administrator</option>
                                            <option value="Technical">Technical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <select
                                            id="edit-status"
                                            name="status"
                                            value={editingUser.status}
                                            onChange={handleEditInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 4: Phone (full width) */}
                                <div>
                                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="edit-phone"
                                        name="phone"
                                        value={editingUser.phone || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+63 912 345 6789"
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? (
                                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <Edit className="h-4 w-4 mr-2" />
                                        )}
                                        {isUpdating ? 'Updating...' : 'Update Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && lastUpdatedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Update Successful</h3>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4">
                                <p className="text-sm text-gray-600">
                                    Admin has been updated successfully.
                                </p>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end p-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Change Confirmation Modal */}
                {showStatusConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
                                <button
                                    onClick={cancelStatusChange}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4">
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to change <span className="font-semibold">{statusChangeData.userName}</span>'s status to{' '}
                                    <span className={`font-semibold ${
                                        statusChangeData.newStatus === 'Active' 
                                            ? 'text-green-600' 
                                            : 'text-blue-600'
                                    }`}>
                                        {statusChangeData.newStatus}
                                    </span>?
                                </p>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                                <button
                                    onClick={cancelStatusChange}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                                        statusChangeData.newStatus === 'Active' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </AdminLayout>
        </>
    );
}
