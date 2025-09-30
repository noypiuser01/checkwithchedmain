export default function Modal({ title, isOpen, onClose, children, contentRef }) {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40"></div>
			<div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-lg">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<h2 className="text-lg font-semibold">{title}</h2>
					<button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
				</div>
				<div ref={contentRef} className="px-2 py-4 space-y-6 max-h-[80vh] overflow-y-auto" style={{fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', fontSize: '12px', lineHeight: '1.4'}}>
					{children}
				</div>
			</div>
		</div>
	);
}


