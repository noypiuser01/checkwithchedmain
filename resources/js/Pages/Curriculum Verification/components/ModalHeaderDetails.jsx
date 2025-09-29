export default function ModalHeaderDetails({ facultyName, position, selectedInstitution, programName, referenceNo }) {
	return (
		<div className="text-center no-print-title">
			{/* CHED Header Section */}
			<div className="mb-6">
				<div className="flex items-center justify-center mb-4">
					<img 
						src="/images/logo.png" 
						alt="CHED Logo" 
						className="h-16 w-16 mr-4"
					/>
					<div className="text-center">
						<h1 className="text-base font-normal text-gray-900 uppercase tracking-wide" style={{fontFamily: 'Times New Roman, serif'}}>
							Commission on Higher Education
						</h1>
						<div className="w-full h-px bg-gray-900 my-1"></div>
						<h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{fontFamily: 'Times New Roman, serif'}}>
							Regional Office XII
						</h2>
					</div>
				</div>
			</div>

			<div className="text-xs text-gray-700 space-y-1">
				<div className="text-sm font-bold text-gray-900 mb-8">CURRICULUM VERIFICATION REPORT</div>
				<div className="flex justify-between max-w-5xl mx-auto">
					<div className="text-left">
						<div className="flex"><span className="font-medium text-gray-800 text-xs">FACULTY NAME</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{facultyName || 'Not specified'}</span></div>
						<div className="flex"><span className="font-medium text-gray-800 text-xs">POSITION</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{position || 'Not specified'}</span></div>
						<div className="flex"><span className="font-medium text-gray-800 text-xs">INSTITUTE</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{selectedInstitution || 'Not specified'}</span></div>
					</div>
					<div className="text-left">
						<div className="flex"><span className="font-medium text-gray-800 text-xs">PROGRAM NAME</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{programName || 'Not specified'}</span></div>
						<div className="flex"><span className="font-medium text-gray-800 text-xs">REFERENCES NO.</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{referenceNo}</span></div>
						<div className="flex"><span className="font-medium text-gray-800 text-xs">DATE GENERATED</span><span className="text-gray-800 text-xs w-2 text-center">:</span><span className="text-gray-700 text-xs ml-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
					</div>
				</div>
			</div>
		</div>
	);
}