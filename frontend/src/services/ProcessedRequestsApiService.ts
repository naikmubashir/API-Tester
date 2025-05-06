import ApiService from './ApiService'

// GET all requests
export async function apiGetAllProcessedRequests() {
    return ApiService.fetchDataWithAxios({
        url: '/processed-requests',
        method: 'get',
    })
}