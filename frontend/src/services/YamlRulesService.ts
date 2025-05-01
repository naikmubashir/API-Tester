import ApiService from './ApiService'

export interface YamlRule {
    _id: string
    name: string
    content: string
    description?: string
}

interface YamlRuleRequest extends Record<string, unknown> {
    name: string
    content: string
    description?: string
}

interface YamlRuleResponse {
    message: string
    data: YamlRule | YamlRule[]
}

// GET all rules
export async function apiGetAllYamlRules() {
    return ApiService.fetchDataWithAxios<YamlRuleResponse>({
        url: '/yaml-rules',
        method: 'get',
    })
}

// POST new rule
export async function apiCreateNewYamlRule(data: YamlRuleRequest) {
    return ApiService.fetchDataWithAxios<YamlRuleResponse>({
        url: '/yaml-rules',
        method: 'post',
        data,
    })
}

// PUT update rule
export async function apiUpdateYamlRule(id: string, data: YamlRuleRequest) {
    return ApiService.fetchDataWithAxios<YamlRuleResponse>({
        url: `/yaml-rules/${id}`,
        method: 'put',
        data,
    })
}

// DELETE rule
export async function apiDeleteYamlRule(id: string) {
    return ApiService.fetchDataWithAxios<YamlRuleResponse>({
        url: `/yaml-rules/${id}`,
        method: 'delete',
    })
}
