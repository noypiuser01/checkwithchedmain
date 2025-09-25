export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-auto w-full">
            {/* Top part - mini header / call-to-action */}
            <div className="bg-blue-900 py-3 text-center">
                <h3 className="text-lg font-semibold">Check With CHED</h3>
                <p className="text-sm text-gray-300">Your trusted source for company verification</p>
            </div>

            {/* Bottom part - copyright */}
            <div className="py-4 text-center border-t border-gray-700">
                &copy; {new Date().getFullYear()} Check With CHED. All Rights Reserved.
            </div>
        </footer>
    );
}
