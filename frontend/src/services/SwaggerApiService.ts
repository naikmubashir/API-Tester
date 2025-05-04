import ApiService from './ApiService'

// Define your types
interface SwaggerResponse {
    message: string
}

interface SwaggerRequest extends Record<string, unknown> {
    swaggerapi: string
}


// POST swagger API
export async function apiFetchAndStoreSwagger(data: SwaggerRequest) {
    return ApiService.fetchDataWithAxios<SwaggerResponse>({
        url: '/fetch',
        method: 'post',
        data,
    })
}
export async function apiGetAllSwaggers() {
    return ApiService.fetchDataWithAxios<any>({
        url: '/fetch/swaggers',
        method: 'get',
    })
}

// GET all requests
export async function apiGetAllRequests() {
    return ApiService.fetchDataWithAxios({
        url: '/requests',
        method: 'get',
    })
}

// Define interface for delete response
interface DeleteResponse {
    success: boolean
    message: string
    data?: any
}

// DELETE all requests
export async function apiDeleteAllRequests() {
    return ApiService.fetchDataWithAxios<DeleteResponse>({
        url: '/requests/delete/all',
        method: 'delete',
    })
}

// DELETE specific request by ID
export async function apiDeleteRequest(requestId: string) {
    return ApiService.fetchDataWithAxios<DeleteResponse>({
        url: `/requests/delete`,
        method: 'delete',
        data: {
            id: requestId
        }
    })
}