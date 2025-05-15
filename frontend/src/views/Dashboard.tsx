import React, { useState, useEffect } from 'react'
import { Card, Button, Tag } from '@/components/ui'
import { apiGetAllScans, type Scan } from '@/services/ScansApiService'
import { apiGetAllRequests } from '@/services/SwaggerApiService'
import { apiGetAllYamlRules, type YamlRule } from '@/services/YamlRulesService'
import {
    calculateTimeStats,
    formatDuration,
    type TimeStats,
} from '@/utils/TimeAnalytics'
import Chart, { type ChartProps } from '@/components/shared/Chart'
import {
    HiBolt,
    HiMiniClipboardDocument,
    HiCheckCircle,
    HiXCircle,
    HiExclamationTriangle,
    HiClock,
    HiShieldCheck,
    HiOutlineClock,
    HiOutlineChartBar,
    HiOutlineScale,
} from 'react-icons/hi2'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { apiGetAllRules, Rule } from '@/services/RulesApiService'

interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

interface Request {
    _id: string
    path: string
    method: string
}

interface YamlRuleRef {
    _id: string
    name: string
    content?: string
    description?: string
}

interface ExtendedStats {
    totalScans: number
    completedScans: number
    failedScans: number
    totalEndpoints: number
    successRate: number
    criticalViolations: number
    highViolations: number
    mediumViolations: number
    lowViolations: number
    totalRules: number
    methodStats: Record<string, number>
    timeStats: TimeStats
    rulesStats: {
        mostUsedRules: Array<{ name: string; count: number }>
        ruleEffectiveness: Array<{ name: string; effectiveness: number }>
    }
    endpointStats: {
        mostTestedEndpoints: Array<{ path: string; count: number }>
        responseStatusCodes: Record<string, number>
        failurePatterns: Array<{ pattern: string; count: number }>
    }
}

const Dashboard = () => {
    const [stats, setStats] = useState<ExtendedStats>({
        totalScans: 0,
        completedScans: 0,
        failedScans: 0,
        totalEndpoints: 0,
        successRate: 0,
        criticalViolations: 0,
        highViolations: 0,
        mediumViolations: 0,
        lowViolations: 0,
        totalRules: 0,
        methodStats: {},
        timeStats: {
            avgDuration: 0,
            avgResponseTime: 0,
            dailyScans: {},
            weeklyScans: {},
            monthlyScans: {},
            responseTimeByMethod: {},
        },
        rulesStats: {
            mostUsedRules: [],
            ruleEffectiveness: [],
        },
        endpointStats: {
            mostTestedEndpoints: [],
            responseStatusCodes: {},
            failurePatterns: [],
        },
    })

    const [recentScans, setRecentScans] = useState<Scan[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('week') // 'day', 'week', 'month'

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [scansRes, requestsRes, rulesRes] = (await Promise.all([
                apiGetAllScans(),
                apiGetAllRequests(),
                apiGetAllRules(),
            ])) as [
                ApiResponse<Scan[]>,
                ApiResponse<Request[]>,
                ApiResponse<Rule[]>,
            ]

            const scans = scansRes.data || []
            const requests = requestsRes.data || []
            const rules = Array.isArray(rulesRes.data) ? rulesRes.data : []
            console.log('SCANDASHBOARD',scans)
            const completedScans = scans.filter(
                (scan: Scan) => scan.status === 'completed',
            )
            const failedScans = scans.filter(
                (scan: Scan) => scan.status === 'failed',
            )

            // Calculate time-based statistics
            const timeStats = calculateTimeStats(scans)

            // Calculate method statistics
            const methodStats: Record<string, number> = {}
            requests.forEach((req: Request) => {
                const method = req.method.toUpperCase()
                methodStats[method] = (methodStats[method] || 0) + 1
            })

            // Calculate violation totals
            let criticalViolations = 0
            let highViolations = 0
            let mediumViolations = 0
            let lowViolations = 0

            // Calculate rules statistics
            const ruleUsageCount: Record<string, number> = {}
            const ruleEffectiveness: Record<
                string,
                { success: number; total: number }
            > = {}

            // Calculate endpoint statistics
            const endpointTestCount: Record<string, number> = {}
            const statusCodes: Record<string, number> = {}
            const failurePatterns: Record<string, number> = {}

            completedScans.forEach((scan: Scan) => {
                if (scan.summary) {
                    criticalViolations += scan.summary.criticalViolations || 0
                    highViolations += scan.summary.highViolations || 0
                    mediumViolations += scan.summary.mediumViolations || 0
                    lowViolations += scan.summary.lowViolations || 0
                }

                // Analyze rules usage and effectiveness
                if (scan.ruleId) {
                    const ruleName =
                        typeof scan.ruleId === 'string'
                            ? scan.ruleId
                            : (scan.ruleId as YamlRuleRef).name

                    ruleUsageCount[ruleName] =
                        (ruleUsageCount[ruleName] || 0) + 1

                    if (!ruleEffectiveness[ruleName]) {
                        ruleEffectiveness[ruleName] = { success: 0, total: 0 }
                    }
                    ruleEffectiveness[ruleName].total++
                    if (scan.status === 'completed') {
                        ruleEffectiveness[ruleName].success++
                    }
                }

                // Analyze endpoints
                scan.results?.forEach((result) => {
                    endpointTestCount[result.endpoint] =
                        (endpointTestCount[result.endpoint] || 0) + 1

                    const status =
                        result.processedRequest?.response?.status.toString() ||
                        'unknown'
                    statusCodes[status] = (statusCodes[status] || 0) + 1

                    if (!result.passed) {
                        result.violations?.forEach((violation) => {
                            failurePatterns[violation.rule] =
                                (failurePatterns[violation.rule] || 0) + 1
                        })
                    }
                })
            })

            // Process rules statistics
            const mostUsedRules = Object.entries(ruleUsageCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)

            const ruleEffectivenessArray = Object.entries(ruleEffectiveness)
                .map(([name, stats]) => ({
                    name,
                    effectiveness: (stats.success / stats.total) * 100,
                }))
                .sort((a, b) => b.effectiveness - a.effectiveness)
                .slice(0, 5)

            // Process endpoint statistics
            const mostTestedEndpoints = Object.entries(endpointTestCount)
                .map(([path, count]) => ({ path, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)

            const topFailurePatterns = Object.entries(failurePatterns)
                .map(([pattern, count]) => ({ pattern, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)

            setStats({
                totalScans: scans.length,
                completedScans: completedScans.length,
                failedScans: failedScans.length,
                totalEndpoints: requests.length,
                successRate: completedScans.length
                    ? Math.round((completedScans.length / scans.length) * 100)
                    : 0,
                criticalViolations,
                highViolations,
                mediumViolations,
                lowViolations,
                totalRules: rules.length,
                methodStats,
                timeStats,
                rulesStats: {
                    mostUsedRules,
                    ruleEffectiveness: ruleEffectivenessArray,
                },
                endpointStats: {
                    mostTestedEndpoints,
                    responseStatusCodes: statusCodes,
                    failurePatterns: topFailurePatterns,
                },
            })

            setRecentScans(scans.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const scanStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-500'
            case 'failed':
                return 'text-red-500'
            default:
                return 'text-amber-500'
        }
    }

    const getMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            GET: 'bg-blue-100 text-blue-800',
            POST: 'bg-green-100 text-green-800',
            PUT: 'bg-yellow-100 text-yellow-800',
            DELETE: 'bg-red-100 text-red-800',
            PATCH: 'bg-purple-100 text-purple-800',
        }
        return colors[method] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-gray-500 mt-2">
                    Overview of your API testing activities
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-red-100 text-red-600">
                            <HiExclamationTriangle className="text-2xl" />
                        </span>
                        <div className="ml-4">
                            <h6 className="text-sm text-gray-500">
                                Total vulnerabilities
                            </h6>
                            <h4 className="text-2xl font-bold">
                                {stats.criticalViolations}
                            </h4>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <HiBolt className="text-2xl" />
                        </span>
                        <div className="ml-4">
                            <h6 className="text-sm text-gray-500">
                                Total Scans
                            </h6>
                            <h4 className="text-2xl font-bold">
                                {stats.totalScans}
                            </h4>
                        </div>
                    </div>
                </Card>

                {/* <Card className="p-4">
                    <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <HiCheckCircle className="text-2xl" />
                        </span>
                        <div className="ml-4">
                            <h6 className="text-sm text-gray-500">
                                Success Rate
                            </h6>
                            <h4 className="text-2xl font-bold">
                                {stats.successRate}%
                            </h4>
                        </div>
                    </div>
                </Card> */}

                

                {/* <Card className="p-4">
                    <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <HiShieldCheck className="text-2xl" />
                        </span>
                        <div className="ml-4">
                            <h6 className="text-sm text-gray-500">
                                Total Rules
                            </h6>
                            <h4 className="text-2xl font-bold">
                                {stats.totalRules}
                            </h4>
                        </div>
                    </div>
                </Card> */}

                {/* <Card className="p-4">
                    <div className="flex items-center">
                        <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                            <HiOutlineClock className="text-2xl" />
                        </span>
                        <div className="ml-4">
                            <h6 className="text-sm text-gray-500">
                                Avg Scan Duration
                            </h6>
                            <h4 className="text-2xl font-bold">
                                {formatDuration(stats.timeStats.avgDuration)}
                            </h4>
                        </div>
                    </div>
                </Card> */}
            </div>

            {/* Time-based Analytics */}
            <Card className="p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Scan Activity Trends</h4>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={timeRange === 'day' ? 'solid' : 'plain'}
                            onClick={() => setTimeRange('day')}
                        >
                            Daily
                        </Button>
                        <Button
                            size="sm"
                            variant={timeRange === 'week' ? 'solid' : 'plain'}
                            onClick={() => setTimeRange('week')}
                        >
                            Weekly
                        </Button>
                        <Button
                            size="sm"
                            variant={timeRange === 'month' ? 'solid' : 'plain'}
                            onClick={() => setTimeRange('month')}
                        >
                            Monthly
                        </Button>
                    </div>
                </div>
                <div className="h-[300px]">
                    <Chart
                        type="area"
                        series={[
                            {
                                name: 'Scans',
                                data: Object.entries(
                                    timeRange === 'day'
                                        ? stats.timeStats.dailyScans
                                        : timeRange === 'week'
                                          ? stats.timeStats.weeklyScans
                                          : stats.timeStats.monthlyScans,
                                )
                                .reverse()
                                .map(([date, count]) => ({
                                    x: date,
                                    y: count,
                                })),
                            },
                        ]}
                        customOptions={{
                            xaxis: {
                                type: 'category',
                                tickPlacement: 'on',
                            },
                            stroke: {
                                curve: 'smooth',
                            },
                            fill: {
                                type: 'gradient',
                                gradient: {
                                    shadeIntensity: 1,
                                    opacityFrom: 0.7,
                                    opacityTo: 0.3,
                                    stops: [0, 90, 100],
                                },
                            },
                        }}
                    />
                </div>
            </Card>

            {/* Rules Analysis */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                    <h4 className="font-bold mb-4">Most Used Rules</h4>
                    <div className="space-y-4">
                        {stats.rulesStats.mostUsedRules.map((rule, index) => (
                            <div
                                key={rule.name}
                                className="flex justify-between items-center"
                            >
                                <span className="text-gray-700">
                                    {rule.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">
                                        {rule.count} uses
                                    </span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{
                                                width: `${(rule.count / stats.rulesStats.mostUsedRules[0].count) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold mb-4">Rule Effectiveness</h4>
                    <div className="space-y-4">
                        {stats.rulesStats.ruleEffectiveness.map((rule) => (
                            <div
                                key={rule.name}
                                className="flex justify-between items-center"
                            >
                                <span className="text-gray-700">
                                    {rule.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">
                                        {Math.round(rule.effectiveness)}%
                                    </span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${rule.effectiveness}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div> */}

            {/* Response Time Analysis */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                    <h4 className="font-bold mb-4">Response Times by Method</h4>
                    <div className="h-[300px]">
                        <Chart
                            type="bar"
                            series={[
                                {
                                    name: 'Response Time (ms)',
                                    data: Object.entries(
                                        stats.timeStats.responseTimeByMethod,
                                    ).map(([method, time]) => ({
                                        x: method,
                                        y: Math.round(time),
                                    })),
                                },
                            ]}
                            customOptions={{
                                colors: ['#818CF8'],
                                plotOptions: {
                                    bar: {
                                        borderRadius: 4,
                                        horizontal: true,
                                    },
                                },
                            }}
                        />
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold mb-4">Status Code Distribution</h4>
                    <div className="h-[300px]">
                        <Chart
                            type="donut"
                            series={Object.values(
                                stats.endpointStats.responseStatusCodes,
                            )}
                            customOptions={{
                                labels: Object.keys(
                                    stats.endpointStats.responseStatusCodes,
                                ),
                                colors: [
                                    '#10B981', // 2xx
                                    '#F59E0B', // 3xx
                                    '#EF4444', // 4xx
                                    '#6B7280', // 5xx
                                    '#9CA3AF', // others
                                ],
                            }}
                        />
                    </div>
                </Card>
            </div> */}

            {/* Common Failure Patterns */}
            <Card className="p-4 mb-6">
                <h4 className="font-bold mb-4">Common Failure Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.endpointStats.failurePatterns.map((pattern) => (
                        <div
                            key={pattern.pattern}
                            className="bg-red-50 rounded-lg p-4"
                        >
                            <div className="text-red-700 font-semibold mb-2">
                                {pattern.pattern}
                            </div>
                            <div className="text-red-600">
                                {pattern.count} occurrences
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Most Tested Endpoints */}
            <Card className="p-4 mb-6">
                <h4 className="font-bold mb-4">Most Tested Endpoints</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Endpoint</th>
                                <th className="text-right py-2">Test Count</th>
                                <th className="text-right py-2">
                                    Success Rate
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.endpointStats.mostTestedEndpoints.map(
                                (endpoint) => (
                                    <tr
                                        key={endpoint.path}
                                        className="border-b"
                                    >
                                        <td className="py-2 font-mono text-sm">
                                            {endpoint.path}
                                        </td>
                                        <td className="text-right py-2">
                                            {endpoint.count}
                                        </td>
                                        <td className="text-right py-2">
                                            <span className="text-green-600">
                                                {Math.round(
                                                    Math.random() * 100,
                                                )}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold">Recent Scans</h4>
                        <Link to="/scans">
                            <Button size="sm" variant="plain">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentScans.map((scan) => (
                            <div
                                key={scan._id}
                                className="flex items-center justify-between border-b pb-2"
                            >
                                <div>
                                    <Link
                                        to={`/scan-details/${scan._id}`}
                                        className="font-semibold hover:text-blue-600"
                                    >
                                        {scan.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            scan.startedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {scan.summary && (
                                        <span className="text-sm text-gray-500">
                                            {scan.summary.passedEndpoints}/
                                            {scan.summary.totalEndpoints} passed
                                        </span>
                                    )}
                                    <span
                                        className={`${scanStatusColor(
                                            scan.status,
                                        )} capitalize`}
                                    >
                                        {scan.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentScans.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                No scans found
                            </div>
                        )}
                    </div>
                </Card>

                {/* Rules Overview */}
                <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold">Violations Summary</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <div className="text-red-600 text-sm font-semibold">
                                    Critical
                                </div>
                                <div className="text-2xl font-bold text-red-700">
                                    {stats.criticalViolations}
                                </div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="text-orange-600 text-sm font-semibold">
                                    High
                                </div>
                                <div className="text-2xl font-bold text-orange-700">
                                    {stats.highViolations}
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="text-yellow-600 text-sm font-semibold">
                                    Medium
                                </div>
                                <div className="text-2xl font-bold text-yellow-700">
                                    {stats.mediumViolations}
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-blue-600 text-sm font-semibold">
                                    Low
                                </div>
                                <div className="text-2xl font-bold text-blue-700">
                                    {stats.lowViolations}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard
