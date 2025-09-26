import { computeTotals, formatUnitsDisplay } from '../utils/helpers';

export default function CurriculumBreakdown({ collectDisplayedCourses }) {
	return (
		<div>
			<h3 className="text-sm font-semibold text-gray-700 mb-2">Curriculum Breakdown</h3>
			<table className="w-full text-xs border">
				<thead>
					<tr className="border-b bg-gray-50">
						<th className="text-left p-2">Description</th>
						<th className="text-right p-2">Total Units</th>
					</tr>
				</thead>
				<tbody>
					{(() => {
						const list = collectDisplayedCourses();
						const { byCategory, totalUnits } = computeTotals(list);
						const entries = Object.entries(byCategory);
						if (entries.length === 0) {
							return (
								<tr>
									<td className="p-3 text-center text-gray-400" colSpan={2}>No data</td>
								</tr>
							);
						}
						return (
							<>
								{entries.map(([desc, units]) => (
									<tr key={desc} className="border-b">
										<td className="p-2">{desc}</td>
										<td className="p-2 text-right">{formatUnitsDisplay(units)}</td>
									</tr>
								))}
								<tr className="bg-gray-50">
									<td className="p-2 font-medium">Total</td>
									<td className="p-2 text-right font-semibold">{formatUnitsDisplay(totalUnits)}</td>
								</tr>
							</>
						);
					})()}
				</tbody>
			</table>
		</div>
	);
}


