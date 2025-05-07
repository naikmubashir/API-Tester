import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Notification, toast } from '@/components/ui'
import type { Scan } from '@/services/ScansApiService'
import { apiGetScanById, apiDeleteScan } from '@/services/ScansApiService'

interface ProcessedRequest {
    _id: string
    path: string
    method: string
    response?: {
        status: number
        headers: Record<string, string>
        body: any
    }
    request?: {
        headers: Record<string, string>
        body: any
        query: Record<string, string>
    }
    scan?: string
    createdAt: string
    updatedAt: string
    isSuccessful: boolean
}

interface EndpointResult {
    endpoint: string
    method: string
    processedRequest: ProcessedRequest
    passed: boolean
    violations: Array<{
        rule: string
        description: string
        severity: 'low' | 'medium' | 'high' | 'critical'
    }>
}

interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

const statusColors = {
    completed: 'bg-blue-50 text-blue-600',
    in_progress: 'bg-yellow-50 text-yellow-600',
    failed: 'bg-red-50 text-red-600',
} as const

const severityColors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600',
} as const

const ScanDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [scan, setScan] = useState<Scan | null>(null)
    const [loading, setLoading] = useState(true)
    const [pollingInterval, setPollingInterval] = useState<number | null>(null)

    const fetchScanDetails = async () => {
        if (!id) return

        try {
            const { data: apiResponse } = await apiGetScanById(id)
            setScan(apiResponse)

            // If scan is still in progress, continue polling
            if (apiResponse.status === 'in_progress') {
                return true
            } else {
                return false
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    {error instanceof Error
                        ? error.message
                        : 'Failed to fetch scan details'}
                </Notification>,
            )
            navigate('/scans')
            return false
        }
    }

    useEffect(() => {
        const poll = async () => {
            const shouldContinuePolling = await fetchScanDetails()
            if (!shouldContinuePolling) {
                setLoading(false)
                if (pollingInterval) {
                    clearInterval(pollingInterval)
                    setPollingInterval(null)
                }
            }
        }

        // Initial fetch
        poll()

        // Set up polling if not already polling
        if (!pollingInterval) {
            const interval = window.setInterval(poll, 2000) // Poll every 2 seconds
            setPollingInterval(interval)
        }

        // Cleanup
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [id])

    const handleDelete = async () => {
        if (!scan) return

        try {
            await apiDeleteScan(scan._id)
            toast.push(
                <Notification type="success" title="Success">
                    Scan deleted successfully
                </Notification>,
            )
            navigate('/scans')
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to delete scan
                </Notification>,
            )
        }
    }

    if (loading && !scan) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!scan) {
        return (
            <div className="p-6">
                <Card className="text-center p-6">
                    <h2 className="text-xl font-semibold text-gray-600">
                        Scan not found
                    </h2>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{scan.name}</h1>
                    <p className="text-gray-500">
                        Created on{' '}
                        {new Date(scan.createdAt).toLocaleDateString()} at{' '}
                        {new Date(scan.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="plain" onClick={() => navigate('/scans')}>
                        Back to Scans
                    </Button>
                    <Button
                        variant="plain"
                        onClick={handleDelete}
                        className="text-red-600"
                    >
                        Delete Scan
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold">Scan Summary</h2>
                    <div
                        className={`px-3 py-1 rounded-full ${statusColors[scan.status]}`}
                    >
                        <span className="font-medium capitalize">
                            {scan.status}
                        </span>
                    </div>
                </div>

                {scan.status === 'in_progress' ? (
                    <div className="text-center py-8">
                        <div className="animate-pulse">
                            <div className="text-lg text-gray-600 mb-2">
                                Processing scan...
                            </div>
                            <div className="text-sm text-gray-500">
                                This may take a few moments
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">
                                    Total Endpoints
                                </div>
                                <div className="text-2xl font-bold">
                                    {scan.summary?.totalEndpoints || 0}
                                </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-sm text-green-600 mb-1">
                                    Passed
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {scan.summary?.passedEndpoints || 0}
                                </div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-sm text-red-600 mb-1">
                                    Failed
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                    {scan.summary?.failedEndpoints || 0}
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="text-sm text-orange-600 mb-1">
                                    Critical Violations
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {scan.summary?.criticalViolations || 0}
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <Card className="p-6 mt-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Endpoint Results
                            </h2>
                            <div className="space-y-4">
                                {scan.results?.map((result, index) => (
                                    <Card
                                        key={`${result.endpoint}-${index}`}
                                        bordered={true}
                                        className="p-4"
                                    >
                                        <div className="space-y-4">
                                            {/* Header with status and endpoint */}
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-sm ${
                                                        result.passed
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {result.passed
                                                        ? 'PASSED'
                                                        : 'FAILED'}
                                                </span>
                                                <span className="font-mono">
                                                    {result.method}{' '}
                                                    {result.endpoint}
                                                </span>
                                            </div>

                                            {/* Violations section */}
                                            {result.violations?.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="text-sm font-semibold mb-2">
                                                        Violations:
                                                    </h4>
                                                    <div className="pl-4 space-y-2">
                                                        {result.violations.map(
                                                            (
                                                                violation,
                                                                vIndex,
                                                            ) => (
                                                                <div
                                                                    key={vIndex}
                                                                    className="p-2 rounded bg-gray-50"
                                                                >
                                                                    <div
                                                                        className={`text-sm ${severityColors[violation.severity]} font-semibold`}
                                                                    >
                                                                        {
                                                                            violation.rule
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mt-1">
                                                                        {
                                                                            violation.description
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        Severity:{' '}
                                                                        {
                                                                            violation.severity
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Request Details */}
                                            {result.processedRequest && (
                                                <div className="mt-2">
                                                    <h4 className="text-sm font-semibold mb-2">
                                                        Response Details:
                                                    </h4>
                                                    <div className="pl-4 space-y-2">
                                                        <div className="text-sm text-gray-600">
                                                            Status:{' '}
                                                            {result
                                                                .processedRequest
                                                                .response
                                                                ?.status ||
                                                                'N/A'}
                                                        </div>
                                                        {result.processedRequest
                                                            .response && (
                                                            <div className="text-sm">
                                                                <div className="font-semibold text-gray-600 mb-1">
                                                                    Response:
                                                                </div>
                                                                <pre className="bg-gray-50 p-2 rounded overflow-auto text-sm">
                                                                    {JSON.stringify(
                                                                        result
                                                                            .processedRequest
                                                                            .response,
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    </>
                )}
            </Card>
        </div>
    )
}

export default ScanDetails
