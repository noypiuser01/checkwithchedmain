import { postCurriculumReport } from '../services/api';
import { generateReferenceNo } from '../utils/helpers';

export async function exportCurriculumReport({
	htmlContent,
	facultyName,
	position,
	selectedInstitution,
	programName,
	referenceNo,
	cmoReferences,
}) {
	const headerInstitution = (selectedInstitution || '').trim() || 'ACLC COLLEGE OF MARBEL';
	const headerCmo = (Array.isArray(cmoReferences) && cmoReferences.length > 0) ? cmoReferences.join(', ') : '';
	const headerProgram = (programName || '').trim() || 'BSIT Bachelor Science Information Technology';

	const headerHTML = `
		<div class="print-header" style="margin-bottom:16px; text-align:center; color:#000;">
			<div style="font-size:18px;font-weight:700;color:#000;margin-bottom:32px;">Curriculum Verification Report</div>
			<div style="display:flex;justify-content:space-between;max-width:800px;margin:0 auto;">
				<div style="text-align:left;">
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">Faculty Name</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${facultyName || 'Not specified'}</span>
					</div>
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">Position</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${position || 'Not specified'}</span>
					</div>
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">Institute</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${selectedInstitution || 'Not specified'}</span>
					</div>
				</div>
				<div style="text-align:left;">
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">Program Name</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${programName || 'Not specified'}</span>
					</div>
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">References No.</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${referenceNo || ''}</span>
					</div>
					<div style="display:flex;font-size:12px;line-height:1;">
						<span style="font-weight:600;color:#000;">Date Generated</span>
						<span style="width:8px;text-align:center;">:</span>
						<span style="margin-left:4px;color:#000;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
					</div>
				</div>
			</div>
		</div>
	`;

	const footerHTML = `
		<div class="print-footer" style="margin-top:24px; text-align:center; color:#000; padding-top:12px; border-top:1px solid #000;">
			<div style="font-size:10px;color:#000;margin-bottom:4px;">
				CHED Regional Office XII, Regional Center, Brgy. Carpenter Hill, Koronadal City, South Cotabato, Philippines
			</div>
			<div style="font-size:9px;color:#000;">
				Tel. No.: (083) 228-1130 | Email: chedro12@ched.gov.ph / Website: ched.gov.ph
			</div>
		</div>
	`;

	try {
		await postCurriculumReport({
			reference_no: referenceNo || generateReferenceNo(),
			faculty_name: facultyName || null,
			position: position || null,
			institute: selectedInstitution || null,
			program_name: programName || null,
			cmo_references: cmoReferences,
			generated_at: new Date().toISOString(),
		});
	} catch (e) {
		console.error('Failed to store curriculum report', e);
	}

	const iframe = document.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.right = '0';
	iframe.style.bottom = '0';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.border = '0';
	document.body.appendChild(iframe);

	const doc = iframe.contentWindow || iframe.contentDocument;
	const printDoc = doc.document || doc;
	printDoc.open();
	printDoc.write(`<!doctype html><html><head><meta charset="utf-8"/><style>
		@page { margin: 24px; }
		body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#000;font-size:12px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
		h1,h2,h3{margin:0 0 8px;color:#000}
		table{width:100%;border-collapse:collapse;color:#000}
		table + table{margin-top:16px}
		th,td{border:1px solid #111;padding:6px;vertical-align:top;color:#000}
		thead tr{background:#fff !important;color:#000 !important}
		thead tr:first-child{background:#000 !important;color:#fff !important}
		thead tr:nth-child(2){background:#f3f4f6 !important;color:#000 !important}
		thead tr:nth-child(3){background:#f3f4f6 !important;color:#000 !important}
		th{background:#fff !important;color:#000 !important}
		tfoot tr{background:#f3f4f6;color:#000}
		.print-semester{margin-bottom:16px}
		p,li,div,span{color:#000}
		.text-right{text-align:right}
		.text-left{text-align:left}
		.text-center{text-align:center}
		.no-print-title{display:none}
		.no-print{display:none !important}
		ul{margin:0;padding-left:16px}
		.print-footer{page-break-inside:avoid;}
	</style></head><body>${headerHTML}${htmlContent}${footerHTML}</body></html>`);
	printDoc.close();

	const doPrint = () => {
		try {
			const d = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
			if (d) {
				const tables = d.querySelectorAll('table');
				tables.forEach(table => {
					const thead = table.querySelector('thead');
					if (!thead) return;
					const headerRows = thead.querySelectorAll('tr');
					if (headerRows.length >= 2) {
						const row1 = headerRows[0];
						const row2 = headerRows[1];
						const th1 = row1.querySelector('th');
						const th2 = row2.querySelector('th');
						if (th1 && th2 && th1.getAttribute('colspan') === th2.getAttribute('colspan')) {
							const text1 = (th1.textContent || '').trim();
							const text2 = (th2.textContent || '').trim();
							th1.textContent = text1 && text2 ? `${text1} - ${text2}` : (text1 || text2);
							row2.parentNode && row2.parentNode.removeChild(row2);
						}
					}
				});
			}
		} catch (e) {}

		try { iframe.contentWindow.focus(); } catch (e) {}
		iframe.contentWindow.print();
		setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 500);
	};

	if (iframe.contentWindow) {
		iframe.onload = doPrint;
		setTimeout(doPrint, 300);
	} else {
		setTimeout(doPrint, 300);
	}
}


