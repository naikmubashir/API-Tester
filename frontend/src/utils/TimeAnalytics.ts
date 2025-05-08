import dayjs from 'dayjs'
import { Scan } from '@/services/ScansApiService'

export interface TimeStats {
    avgDuration: number
    avgResponseTime: number
    dailyScans: Record<string, number>
    weeklyScans: Record<string, number>
    monthlyScans: Record<string, number>
    responseTimeByMethod: Record<string, number>
}

export const calculateTimeStats = (scans: Scan[]): TimeStats => {
    const stats: TimeStats = {
        avgDuration: 0,
        avgResponseTime: 0,
        dailyScans: {},
        weeklyScans: {},
        monthlyScans: {},
        responseTimeByMethod: {},
    }

    // Initialize counters
    let totalDuration = 0
    let totalResponseTime = 0
    let responseCount = 0

    scans.forEach((scan) => {
        // Calculate scan duration
        if (scan.startedAt && scan.completedAt) {
            const duration = dayjs(scan.completedAt).diff(
                dayjs(scan.startedAt),
                'seconds',
            )
            totalDuration += duration
        }

        // Group by time periods
        const scanDate = dayjs(scan.startedAt)
        const dayKey = scanDate.format('YYYY-MM-DD')
        const weekKey = scanDate.format('YYYY-[W]WW')
        const monthKey = scanDate.format('YYYY-MM')

        stats.dailyScans[dayKey] = (stats.dailyScans[dayKey] || 0) + 1
        stats.weeklyScans[weekKey] = (stats.weeklyScans[weekKey] || 0) + 1
        stats.monthlyScans[monthKey] = (stats.monthlyScans[monthKey] || 0) + 1

        // Calculate response times by method
        scan.results?.forEach((result) => {
            if (result.processedRequest?.response?.status) {
                const method = result.method
                if (!stats.responseTimeByMethod[method]) {
                    stats.responseTimeByMethod[method] = 0
                }
                // Simulated response time based on available data
                // In a real app, this would come from actual response time metrics
                const responseTime = Math.random() * 1000 // Example placeholder
                stats.responseTimeByMethod[method] += responseTime
                totalResponseTime += responseTime
                responseCount++
            }
        })
    })

    // Calculate averages
    stats.avgDuration = totalDuration / (scans.length || 1)
    stats.avgResponseTime = totalResponseTime / (responseCount || 1)

    return stats
}

export const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600)
        return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
}
