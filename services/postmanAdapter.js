const axios = require('axios');

// Constants
const NETWORK_ERRORS = [
    'EAI_AGAIN',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EHOSTUNREACH',
    'EPIPE'
];

const BASE_CONFIG = {
    timeout: 30000,
    validateStatus: status => status < 500
};

// Utility Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function makeRateLimitedRequest(requestFn, maxRetries = 3) {
    let attempt = 0;
    const baseDelay = 1000;
    let lastError = null;

    while (attempt < maxRetries) {
        try {
            const response = await requestFn();
            // Add response validation
            if (!response || !response.data) {
                throw new Error('Invalid response received');
            }
            return response;
        } catch (error) {
            attempt++;
            lastError = error;
            let retryAfter;

            if (error.response?.status === 429) {
                try {
                    const match = error.response.data.message.match(/retry after (\d+)/);
                    retryAfter = match ? parseInt(match[1]) - Date.now() : baseDelay * Math.pow(2, attempt);
                    if (retryAfter < 0) retryAfter = baseDelay * Math.pow(2, attempt);
                } catch (e) {
                    retryAfter = baseDelay * Math.pow(2, attempt);
                }
            } else if (NETWORK_ERRORS.includes(error.code)) {
                console.warn(`Network error (${error.code}) on attempt ${attempt}/${maxRetries}. Retrying...`);
                retryAfter = baseDelay * Math.pow(2, attempt);
            } else {
                throw error;
            }

            retryAfter = Math.min(retryAfter || baseDelay * Math.pow(2, attempt), 60000);
            console.log(`Request failed. Retrying after ${retryAfter}ms (Attempt ${attempt}/${maxRetries})`);
            await sleep(retryAfter);
            continue;
        }
    }

    if (NETWORK_ERRORS.includes(lastError.code)) {
        throw new Error(`Network error (${lastError.code}) after ${maxRetries} attempts. Please check your network connection.`);
    } else if (lastError.response?.status === 429) {
        throw new Error(`Rate limit exceeded after ${maxRetries} attempts. Please try again later.`);
    }

    throw new Error(`Request failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// Variable Resolution Functions
function findVariableValue(variables, name) {
    if (!Array.isArray(variables)) return null;
    const variable = variables.find(v => v.key === name);
    return variable?.value || null;
}

function resolveVariables(value, variables, environmentVariables = {}, depth = 0) {
    if (depth > 10) return value;
    if (!value || typeof value !== 'string') return value;

    return value.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        const varName = variable.trim();
        const resolved = environmentVariables[varName] || findVariableValue(variables, varName) || match;
        if (resolved !== match &&  typeof resolved==='string'&& resolved.includes('{{')) {
            console.log('NOTTTTT',resolved)
            return resolveVariables(resolved, variables, environmentVariables, depth + 1);
        }
        return resolved;
    });
}

// URL Processing Functions
function resolveUrl(url, variables, environmentVariables = {}) {
    if (!url) return null;

    if (typeof url === 'string') {
        return resolveVariables(url, variables, environmentVariables);
    }

    if (url.raw) {
        return resolveVariables(url.raw, variables, environmentVariables);
    }

    if (Array.isArray(url.host) && Array.isArray(url.path)) {
        const resolvedHost = resolveVariables(url.host.join('.'), variables, environmentVariables);
        const resolvedPath = resolveVariables(url.path.join('/'), variables, environmentVariables);
        return `${url.protocol || 'https'}://${resolvedHost}/${resolvedPath}`;
    }

    return null;
}


function getUrlFromRequest(request, variables, environmentVariables) {
    if (!request?.url) return { url: null, originalUrl: null };

    try {
    const originalUrl = typeof request.url === 'string' ? request.url :
        request.url.raw ? request.url.raw :
            Array.isArray(request.url.host) && Array.isArray(request.url.path) ?
                `${request.url.protocol || 'https'}://${request.url.host.join('.')}/${request.url.path.join('/')}` :
                null;

    let resolvedUrl = resolveUrl(request.url, variables, environmentVariables);
    // Try to construct a valid URL
        // try {
        //     new URL(resolvedUrl);
        // } catch (e) {
        //     // If URL is invalid, try to fix it
        //     if (!resolvedUrl.startsWith('http')) {
        //         resolvedUrl = `https://${resolvedUrl}`;
        //     }
        // }
    return { url: resolvedUrl, originalUrl };
    } catch (error) {
        console.warn('Error processing URL:', error);
        return { url: null, originalUrl: null };
    }
}

function normalizeEndpointPath(path) {
    if (!path) return '/';
    
    // Remove query parameters
    path = path.split('?')[0];
    
    // Remove trailing and leading slashes, then add leading slash
    path = '/' + path.replace(/^\/+|\/+$/g, '');
    
    // Replace version numbers
    path = path.replace(/\/v\d+\//, '/v{version}/');
    
    // Replace path parameters
    path = path.replace(/:[^\/]+/g, '{param}')
            .replace(/\{\{[^}]+\}\}/g, '{param}')
            .replace(/\{[^}]+\}/g, '{param}');
    
    // Clean up double slashes
    path = path.replace(/\/+/g, '/');
    
    return path || '/';
}

function groupEndpointsByApi(items, context, parentFolder = '') {
    const endpoints = new Map();
    const apiName = context.collectionName;

    function processItem(item, currentPath) {
        if (!item) return;

        if (item.request) {
            const { url, originalUrl } = getUrlFromRequest(
                item.request,
                context.variables,
                context.environmentVariables
            );
            
            if (!url) return;

            let endpointPath;
            try {
                const urlObj = new URL(url);
                endpointPath = urlObj.pathname;
            } catch (e) {
                // If URL parsing fails, use the normalized currentPath
                endpointPath = normalizeEndpointPath(currentPath);
            }

            const endpoint = {
                name: item.name || "API Endpoint",
                method: item.request.method || 'GET',
                url: url,
                originalUrl: originalUrl,
                path: endpointPath,
                description: item.request.description || '',
                headers: item.request.header || [],
                body: item.request.body || null,
                responses: Array.isArray(item.response) ? item.response.map(resp => ({
                    code: resp.code || resp.status || 200,
                    body: resp.body || null,
                    headers: resp.header || []
                })) : [],
                collectionInfo: {
                    name: context.collectionName,
                    id: context.collectionId
                },
                workspaceInfo: {
                    name: context.workspaceName,
                    id: context.workspaceId
                }
            };

            if (!endpoints.has(apiName)) {
                endpoints.set(apiName, []);
            }
            endpoints.get(apiName).push(endpoint);
        }

        if (Array.isArray(item.item)) {
            item.item.forEach(subItem => {
                const newPath = currentPath ?
                    `${currentPath}/${subItem.name || 'unnamed'}` :
                    (subItem.name || 'unnamed');
                processItem(subItem, newPath);
            });
        }
    }

    if (Array.isArray(items)) {
        items.forEach(item => processItem(item, ''));
    }

    return endpoints;
}

function formatApiAsset(apiName, endpoints) {
    if (!endpoints?.length) return null;

    const workspaces = new Set(endpoints.map(e => e.workspaceInfo.name));
    const collections = new Set(endpoints.map(e => e.collectionInfo.name));

    const versionPattern = /\/v(\d+)\//;
    const endpointsByVersion = new Map();
    const authTypes = new Set();

    endpoints.forEach(endpoint => {
        const versionMatch = endpoint.url.match(versionPattern);
        const version = versionMatch ? `v${versionMatch[1]}` : 'default';
        if (!endpointsByVersion.has(version)) {
            endpointsByVersion.set(version, []);
        }
        endpointsByVersion.get(version).push(endpoint);

        if (endpoint.auth) {
            authTypes.add(endpoint.auth.type || 'unknown');
        }
    });
  //  console.log("EZZdSS",endpoints)
    return {
        type: 'api',
        name: apiName,
        value: apiName,
        tags: [
            "Postman",
            //"API",
            // ...Array.from(workspaces).map(w => `Workspace:${w}`),
            // ...Array.from(collections).map(c => `Collection:${c}`)
        ],
        assetDescription: `API with ${endpoints.length} endpoints across ${endpointsByVersion.size} versions`,
        properties: {
            totalEndpoints: endpoints.length,
            versions: Array.from(endpointsByVersion.keys()),
            workspaces: Array.from(workspaces),
            collections: Array.from(collections),
            authType: Array.from(authTypes),
            endpoints: Array.from(endpointsByVersion.entries()).map(([version, versionEndpoints]) => ({
                version,
                endpoints: versionEndpoints.map(endpoint => {
  //                  console.log('ENDPpp',endpoint?.path)
                    return({
                    name: endpoint.name,
                    method: endpoint.method,
                    path: endpoint.path,
                    url: endpoint.url,
                    originalUrl: endpoint.originalUrl,
                    description: endpoint.description,
                    collection: endpoint.collectionInfo.name,
                    workspace: endpoint.workspaceInfo.name,
                    request: {
                        headers: endpoint.headers,
                        body: endpoint.body,
                        auth: endpoint.auth || null
                    },
                    responses: endpoint.responses
                })})
            }))
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

// Environment Variables Function
async function getEnvironmentVariables(apiKey, workspaceId) {
    const config = {
        ...BASE_CONFIG,
        headers: { 'X-Api-Key': apiKey }
    };

    try {
        const response = await makeRateLimitedRequest(() =>
            axios.get(`https://api.getpostman.com/environments?workspace=${workspaceId}`, config)
        );

        if (!response.data?.environments) return {};

        const envVars = {};
        for (const env of response.data.environments) {
            const envDetail = await makeRateLimitedRequest(() =>
                axios.get(`https://api.getpostman.com/environments/${env.uid}`, config)
            );

            if (envDetail.data?.environment?.values) {
                for (const v of envDetail.data.environment.values) {
                    if (v.enabled !== false && v.key && v.value) {
                        envVars[v.key] = v.value;
                    }
                }
            }
        }
        return envVars;
    } catch (error) {
        console.warn('Error fetching environment variables:', error.message);
        return {};
    }
}

// Main Integration Function
const integratePostman = async (apiKey, adapterName) => {
    const config = {
        ...BASE_CONFIG,
        headers: { 'X-Api-Key': apiKey }
    };

    try {
        const apiEndpoints = new Map();
        const workspacesResponse = await makeRateLimitedRequest(() =>
            axios.get('https://api.getpostman.com/workspaces', config)
        );

        const workspaces = workspacesResponse.data.workspaces;
       // console.log('WORKSPACES',workspaces)

        for (const workspace of workspaces) {
            const environmentVariables = await getEnvironmentVariables(apiKey, workspace.id);

            const collectionsResponse = await makeRateLimitedRequest(() =>
                axios.get(`https://api.getpostman.com/collections?workspace=${workspace.id}`, config)
            );

            await sleep(100);

            for (const collection of collectionsResponse.data.collections) {
                const detailResponse = await makeRateLimitedRequest(() =>
                    axios.get(`https://api.getpostman.com/collections/${collection.uid}`, config)
                );

                const collectionDetail = detailResponse.data.collection;
                const collectionVariables = collectionDetail?.variable || [];

                if (collectionDetail?.item) {
                    const groupedEndpoints = groupEndpointsByApi(
                        collectionDetail.item,
                        {
                            workspaceName: workspace.name || 'Unknown Workspace',
                            workspaceId: workspace.id,
                            collectionName: collection.name || 'Unknown Collection',
                            collectionId: collection.uid,
                            variables: collectionVariables,
                            environmentVariables
                        }
                    );

                    //console.log("GROUPED ENDPOINTS",groupedEndpoints)
                    // Only add endpoints if there are any in this collection
                    groupedEndpoints.forEach((endpoints, apiName) => {
                        if (endpoints.length > 0) {
                            if (!apiEndpoints.has(apiName)) {
                                apiEndpoints.set(apiName, []);
                            }
                            apiEndpoints.get(apiName).push(...endpoints);
                        }
                    });
                }

                await sleep(100);
            }
        }

        const assets = Array.from(apiEndpoints.entries())
            .map(([apiName, endpoints]) => {
                // Double-check that the endpoints array has items
                if (endpoints && endpoints.length > 0) {
                 //   console.log("ENDPOINTSSS",endpoints)
                    return formatApiAsset(apiName, endpoints);
                }
                return null;
            })
            .filter(Boolean); // Remove any null entries
           // console.log('ASSS',assets)
        return { assets };
    } catch (error) {
        console.error('Error fetching Postman endpoints:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status code:', error.response.status);
            throw new Error(`Postman API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
        }
        throw error;
    }
};

module.exports = { integratePostman , normalizeEndpointPath};