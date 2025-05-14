import ApiService from './ApiService'

export interface Rule {
    _id: string
    name: string
    description?: string
}

interface RuleResponse {
    message: string
    data: Rule | Rule[]
}

// GET all rules
export async function apiGetAllRules() {
    return ApiService.fetchDataWithAxios<RuleResponse>({
        url: '/rules',
        method: 'get',
    })
}

// GET rule by ID
export async function apiGetRuleById(id: string) {
    return ApiService.fetchDataWithAxios<RuleResponse>({
        url: `/rules/${id}`,
        method: 'get',
    })
}
