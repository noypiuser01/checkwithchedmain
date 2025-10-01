import { computeTotals, formatUnitsDisplay, toWordYear } from '../utils/helpers';

export default function SemesterPrintTable({ year, sem, rows, validateUnitsPerSemester, getYearSemesters }) {
	const { totalUnits } = computeTotals(rows);
	const validation = validateUnitsPerSemester(rows);
	return (
		<div className="overflow-x-auto print-semester" style={{margin: '0 8px 16px'}}>
			<table className="w-full text-xs border" style={{width: '100%', borderCollapse: 'collapse', color: '#000'}}>
				<thead>
					<tr className="text-gray-900" style={{background: '#fff', color: '#000'}}>
						<th className="p-0.5 text-center text-xs font-bold" colSpan={8} style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{toWordYear(year)} - {sem}</th>
					</tr>
					<tr className="border-b bg-gray-50 font-semibold text-gray-900" style={{background: '#f3f4f6', color: '#000'}}>
						<th className="text-left p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Code</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Category</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Title</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Req Units</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Total Units</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Lec Units </th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Lab Units</th>
						<th className="text-center p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000', background: '#fff'}}>Prerequisite/s</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(item => {
						const computedUnits = item.totalUnits !== '' ? item.totalUnits : ((parseFloat(item.lecUnits) || 0) + (parseFloat(item.labUnits) || 0));
						const showUnits = (item.totalUnits === '' && item.lecUnits === '' && item.labUnits === '') ? '' : computedUnits;
						return (
							<tr key={`${item.year}-${item.semester}-${item.id}`} className="border-b" style={{borderBottom: '1px solid #111'}}>
								<td className="p-2" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.courseCode || ''}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.category || ''}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.courseTitle || ''}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.reqUnits)}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(showUnits)}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.lecUnits)}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(item.labUnits)}</td>
								<td className="p-2 text-center" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{item.prerequisites || ''}</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					{(() => {
						const { totalUnits, totalLecUnits, totalLabUnits } = computeTotals(rows);
						return (
							<tr className="bg-gray-50" style={{background: '#f3f4f6', color: '#000'}}>
								<td className="p-2 font-medium" colSpan={4} style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>Total</td>
								<td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalUnits)}</td>
								<td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalLecUnits)}</td>
								<td className="p-2 text-center font-semibold" style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}>{formatUnitsDisplay(totalLabUnits)}</td>
								<td style={{padding: '6px', border: '1px solid #111', verticalAlign: 'top', color: '#000'}}></td>
							</tr>
						);
					})()}
				</tfoot>
			</table>
		</div>
	);
}


