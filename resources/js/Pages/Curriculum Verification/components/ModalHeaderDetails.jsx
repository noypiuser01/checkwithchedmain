export default function ModalHeaderDetails({ facultyName, position, selectedInstitution, programName, referenceNo }) {
	return (
		<div className="text-center no-print-title">
			{/* CHED Header Section */}
			<div className="mb-6">
				<div className="flex items-center justify-center gap-[800px] mb-4">
					<img src="/images/1.png" alt="CHED Logo Left" className="h-12 w-auto" />
					<img src="/images/2.png" alt="CHED Logo Right" className="h-12 w-auto" />
				</div>
			</div>

			<div className="text-xs text-gray-700 space-y-1">
				<div className="text-sm font-bold text-gray-900 mb-8 px-2">CURRICULUM VERIFICATION REPORT</div>
				<div className="flex justify-between max-w-5xl mx-auto px-2">
					<div className="text-left">
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-16 inline-block">NAME</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{facultyName || 'Not specified'}</span>
						</div>
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-16 inline-block">POSITION</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{position || 'Not specified'}</span>
						</div>
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-16 inline-block">INSTITUTE</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{selectedInstitution || 'Not specified'}</span>
						</div>
					</div>
					<div className="text-left">
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-24 inline-block">PROGRAM NAME</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{programName || 'Not specified'}</span>
						</div>
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-24 inline-block">REFERENCES NO.</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{referenceNo}</span>
						</div>
						<div className="flex text-xs leading-tight mb-0.5">
							<span className="font-semibold text-gray-800 w-24 inline-block">DATE GENERATED</span>
							<span className="text-gray-800 w-2 text-center">:</span>
							<span className="text-gray-700 ml-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}