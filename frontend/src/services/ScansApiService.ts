import ApiService from './ApiService'

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

interface Violation {
    rule: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
}

interface EndpointResult {
    endpoint: string
    method: string
    processedRequest: ProcessedRequest
    passed: boolean
    violations: Violation[]
}

interface ScanSummary {
    totalEndpoints: number
    passedEndpoints: number
    failedEndpoints: number
    criticalViolations: number
    highViolations: number
    mediumViolations: number
    lowViolations: number
}

export interface Scan {
    _id: string
    name: string
    yamlRule: string
    originalRequest: string
    status: 'in_progress' | 'completed' | 'failed'
    results: EndpointResult[]
    summary: ScanSummary
    startedAt: string
    completedAt?: string
    createdAt: string
    updatedAt: string
}

interface CreateScanPayload {
    name: string
    ruleId: string
    requestId: string
}

interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

export async function apiCreateScan(payload: CreateScanPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse<Scan>>({
        url: '/scans',
        method: 'post',
        data: payload,
    })
}

export async function apiGetAllScans() {
    return ApiService.fetchDataWithAxios<ApiResponse<Scan[]>>({
        url: '/scans',
        method: 'get',
    })
}

export async function apiGetScanById(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<Scan>>({
        url: `/scans/${id}`,
        method: 'get',
    })
}

export async function apiDeleteScan(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<void>>({
        url: `/scans/${id}`,
        method: 'delete',
    })
}
