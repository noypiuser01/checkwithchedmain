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
                className="px-3 py-1.5 text-white rounded-md text-sm transition-colors duration-200"
                style={{ backgroundColor: '#1e3c73' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1a3466'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1e3c73'}
            >
                Verify
            </button>
        </div>
    );
}
