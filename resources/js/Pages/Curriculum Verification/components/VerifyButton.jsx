export default function VerifyButton({
    validateRequiredFields,
    generateReferenceNo,
    setReferenceNo,
    setShowVerifyModal
}) {
    return (
        <div className="mt-6 flex justify-end">
            <button
                type="button"
                onClick={() => {
                    if (validateRequiredFields()) {
                        const ref = generateReferenceNo();
                        setReferenceNo(ref);
                        setShowVerifyModal(true);
                    }
                }}
                className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md"
            >
                Verify
            </button>
        </div>
    );
}
