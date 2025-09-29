import { useState } from 'react';

export const useModals = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProgram(null);
        setIsModalOpen(false);
    };

    const openAdminModal = () => {
        setIsAdminModalOpen(true);
    };

    const closeAdminModal = () => {
        setIsAdminModalOpen(false);
    };

    return {
        isModalOpen,
        isAdminModalOpen,
        selectedProgram,
        loadingProgramDetails,
        setSelectedProgram,
        setLoadingProgramDetails,
        openModal,
        closeModal,
        openAdminModal,
        closeAdminModal
    };
};
