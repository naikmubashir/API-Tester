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