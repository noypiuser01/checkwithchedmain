import { Head } from "@inertiajs/react";
import {
    BookOpen,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
} from "lucide-react";
import AdminLayout from "@/Components/Admin/AdminLayout";
import StatCard from "./components/StatCard";
import DonutChart from "./components/DonutChart";
import AreaChart from "./components/AreaChart";
import { useDashboardData } from "./hooks/useDashboardData";
import { normalizeMonthlySeries, calculatePercentageChange } from "./utils/dashboardUtils";

export default function AdminDashboard({ admin, dashboardData = {} }) {
    const { data, formattedTotalUnits } = useDashboardData(dashboardData);

    // Process monthly data for chart
    const processedMonthlyData = normalizeMonthlySeries(data.monthlyCurricula.slice(-6), false);
    const totalReviews = processedMonthlyData.reduce((sum, item) => sum + (item.count || 0), 0);
    
    const lastMonthCount = processedMonthlyData[processedMonthlyData.length - 1]?.count || 0;
    const prevMonthCount = processedMonthlyData[processedMonthlyData.length - 2]?.count || 0;
    const percentageChange = calculatePercentageChange(lastMonthCount, prevMonthCount);
    const isUp = percentageChange >= 0;

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <AdminLayout activeTab="dashboard" admin={admin}>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto py-8 px-4">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Curricula"
                                value={data.totalCurricula}
                                icon={BookOpen}
                                iconBgColor="bg-blue-50"
                                iconColor="text-blue-600"
                                additionalInfo={
                                    <>
                                            <span className="text-green-600">
                                                Active: {data.activeCurricula}
                                            </span>
                                            <span className="text-red-600">
                                            Inactive: {data.inactiveCurricula}
                                            </span>
                                    </>
                                }
                            />

                            <StatCard
                                title="Active CMO/PSG"
                                value={data.activeCurricula}
                                subtitle="Currently in use"
                                icon={TrendingUp}
                                iconBgColor="bg-green-50"
                                iconColor="text-green-600"
                            />

                            <StatCard
                                title="Inactive CMO/PSG"
                                value={data.inactiveCurricula}
                                subtitle="No longer in use"
                                icon={BarChart3}
                                iconBgColor="bg-red-50"
                                iconColor="text-red-600"
                            />

                            <StatCard
                                title="Total Units"
                                value={formattedTotalUnits}
                                subtitle="Across all curricula"
                                icon={Activity}
                                iconBgColor="bg-purple-50"
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Program Distribution - Donut Chart */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Active CMO/PSG by Program
                                    </h3>
                                    <PieChart className="h-5 w-5 text-gray-400" />
                                </div>
                                {data.curriculaByProgram.length > 0 ? (
                                    <DonutChart data={data.curriculaByProgram} />
                                ) : (
                                    <div className="text-sm text-gray-400 text-center py-8">
                                        No data available
                                    </div>
                                )}
                            </div>

                            {/* Monthly Trends Section */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Monthly Reviews
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-500">
                                            Interactive
                                        </span>
                                    </div>
                                </div>
                                
                                {totalReviews === 0 ? (
                                            <div className="text-sm text-gray-400 text-center py-8">
                                                No data available
                                            </div>
                                ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <p className="text-3xl font-light text-gray-900">
                                                    {totalReviews}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Total this period
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                        isUp
                                                            ? "bg-green-50 text-green-700 border border-green-200"
                                                            : "bg-red-50 text-red-700 border border-red-200"
                                                    }`}
                                                >
                                                    <TrendingUp
                                                        className={`h-3 w-3 ${
                                                        !isUp && "rotate-180"
                                                        }`}
                                                    />
                                                    <span>
                                                    {Math.abs(percentageChange).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        <AreaChart data={processedMonthlyData} />
                                            <div className="text-xs text-gray-400 text-center mt-4">
                                            Hover over the chart to see detailed values
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
