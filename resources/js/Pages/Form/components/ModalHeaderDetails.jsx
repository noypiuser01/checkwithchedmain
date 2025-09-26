export default function ModalHeaderDetails({ facultyName, position, selectedInstitution, programName, referenceNo }) {
	return (
		<div className="text-center no-print-title">
			<div className="text-xs text-gray-700 space-y-1">
				<div className="text-lg font-bold text-gray-900 mb-8">Curriculum Verification Report</div>
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


