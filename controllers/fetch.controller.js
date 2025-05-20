const axios = require('axios');
const ApiInfo = require('../models/ApiInfo');
const Request = require('../models/Request');
const { integratePostman } = require('../services/postmanAdapter');

// exports.fetchAndStoreSwagger = async (req, res) => {
//     try {
//         const { swaggerapi } = req.body;

//         if (!swaggerapi) {
//             return res.status(400).json({ error: 'swaggerapi URL is required' });
//         }

//         const response = await axios.get(swaggerapi);
//         const swaggerData = response.data;

//         if (!swaggerData.paths || typeof swaggerData.paths !== 'object') {
//             return res.status(400).json({ error: 'Invalid Swagger data format' });
//         }

//         // Process and store Request documents
//         const requestDocs = await Promise.all(
//             Object.entries(swaggerData.paths).flatMap(([path, methods]) =>
//                 Object.entries(methods).map(async ([method,details])=>{
//                     console.log("MMM",method)
//                     console.log("MMMPPPP",path)
//                     const request = new Request({ path, method: method.toLowerCase(), details});
//                     await request.save();
//                     return request._id;
//                     })
//                 )
//         );

//         // Store ApiInfo document
//         const apiInfo = new ApiInfo({
//             ...swaggerData,
//             paths: requestDocs,
//         });

//         await apiInfo.save();
//         console.log('Swagger data stored successfully');
//         return res.status(201).json({ 
//             message: 'Swagger data stored successfully',
//             success: true,
//             data: apiInfo,
//         });
//     } catch (error) {
//         if (error.response) {
//             // Error from the Swagger API
//             console.error('Error fetching Swagger API:', error.response.data);
//             return res.status(error.response.status).json({
//                 error: 'Error fetching Swagger API',
//                 details: error.response.data,
//             });
//         } else if (error.request) {
//             // No response received from the Swagger API
//             console.error('No response from Swagger API:', error.request);
//             return res.status(502).json({ error: 'No response from Swagger API' });
//         } else {
//             // Other errors (e.g., database errors)
//             console.error('Error fetching or storing Swagger data:', error.message);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// };


exports.fetchAndStoreSwagger = async (req, res) => {
    try {
        const { swaggerapi } = req.body;

        if (!swaggerapi) {
            return res.status(400).json({ error: 'swaggerapi URL is required' });
        }

        const response = await axios.get(swaggerapi);
        const swaggerData = response.data;

        if (!swaggerData.paths || typeof swaggerData.paths !== 'object') {
            return res.status(400).json({ error: 'Invalid Swagger data format' });
        }

        // First, create or update the ApiInfo document
        const { paths, ...apiInfoData } = swaggerData;
        const apiInfo = await ApiInfo.findOneAndUpdate(
            {
                'info.title': swaggerData.info?.title,
                'info.version': swaggerData.info?.version
            },
            apiInfoData,
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        // Then process and store Request documents with reference to apiInfo
        const requestPromises = Object.entries(paths).flatMap(([path, methods]) =>
            Object.entries(methods).map(async ([method, details]) => {
                try {
                    const request = await Request.findOneAndUpdate(
                        { 
                            path, 
                            method: method.toLowerCase(),
                            apiInfo: apiInfo._id 
                        },
                        { 
                            path, 
                            method: method.toLowerCase(), 
                            details,
                            apiInfo: apiInfo._id
                        },
                        {
                            upsert: true,
                            new: true,
                            runValidators: true
                        }
                    );
                    return request._id;
                } catch (err) {
                    console.warn(`Skipping duplicate endpoint: ${method} ${path}`);
                    return null;
                }
            })
        );

        const requestDocs = await Promise.all(requestPromises);
        const validRequestDocs = requestDocs.filter(Boolean);

        console.log('vdDDD',validRequestDocs)
        // Update ApiInfo with the request references
        apiInfo.paths = validRequestDocs;
        await apiInfo.save();
console.log('aPIIII',apiInfo)
        return res.status(201).json({
            success: true,
            message: 'Swagger data stored successfully',
            data: apiInfo
        });

    } catch (error) {
        console.error('Error in fetchAndStoreSwagger:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'API version already exists'
            });
        }

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Error fetching Swagger API',
                error: error.response.data
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};




exports.getAllSwaggers = async (req, res) => {
    try {
        const apis = await ApiInfo.find()
            .select('-__v')
            .sort({ createdAt: -1 })
            .populate({
                path: 'paths',
                select: '-__v -apiInfo'
            });

        return res.status(200).json({
            success: true,
            message: apis.length ? 'APIs retrieved successfully' : 'No APIs found',
            data: apis
        });
    } catch (error) {
        console.error('Error retrieving APIs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve APIs',
            error: error.message
        });
    }
};


exports.deleteSwagger = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the API to ensure it exists
        const apiInfo = await ApiInfo.findById(id);
        if (!apiInfo) {
            return res.status(404).json({
                success: false,
                message: 'API not found'
            });
        }

        // Delete all associated requests first
        await Request.deleteMany({ apiInfo: id });

        // Then delete the API info
        await ApiInfo.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'API and associated requests deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting API and requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete API and requests',
            error: error.message
        });
    }
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
};


// Add new function to fetch from Postman
exports.fetchFromPostman = async (req, res) => {
    try {
        const apiKey = req.headers['x-postman-api-key'] || process.env.SNAPSEC_API_KEY;
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'Postman API key is required'
            });
        }

        const result = await integratePostman(apiKey);
        // Store each API from Postman as an ApiInfo document
        const savedApis = await Promise.all(result.assets.map(async (api) => {
            try {

                 // Create or update ApiInfo
                const apiInfo = await ApiInfo.findOneAndUpdate(
                    {
                        'info.title': api.name,
                        source: 'postman'
                    },
                    {
                        info: {
                            title: api.name,
                            description: api.assetDescription,
                            version: api.properties.versions[0]
                        },
                        source: 'postman',
                        tags:  api?.tags?.map(tag => ({
                            name: tag,
                            description: '' // Add empty description since it's required by schema
                        })) || [],
                        properties: api.properties
                    },
                    { upsert: true, new: true }
                );


                // Create requests for each endpoint
                const requestPromises = api.properties.endpoints.flatMap(
                    versionEndpoints => versionEndpoints.endpoints.map(async endpoint => {
                        try{

                        let path;
                        if (isValidUrl(endpoint.originalUrl)) {
                            const url = new URL(endpoint.originalUrl);
                            path = url.pathname;
                        } else {
                            path = endpoint.path || '/';
                        }
                        console.log("enDDD",path)
                        const request = await Request.findOneAndUpdate(
                            {
                                path,
                                // pathName: endpoint.path,
                                method: endpoint.method.toLowerCase(),
                                source: 'postman',
                                apiInfo: apiInfo._id
                            },
                            {
                                path:`${path}`,
                                method: endpoint.method.toLowerCase(),
                                details: {
                                    description: endpoint.description,
                                    parameters: endpoint.request.body,
                                    responses: endpoint.responses
                                },
                                source: 'postman',
                                apiInfo: apiInfo._id
                            },
                            { upsert: true, new: true, runValidators:true }
                        );
                        return request._id;
                        }catch(error){
                             console.warn(`Skipping duplicate endpoint: ${endpoint.method} ${endpoint.originalUrl?.pathname}`, error);
                             // Instead of returning null, find the existing request
                    const existingRequest = await Request.findOne({
                        path: normalizeEndpointPath(endpoint.originalUrl?.pathname),
                        method: endpoint.method.toLowerCase(),
                        apiInfo: apiInfo._id
                    });
                    return existingRequest?._id;
                        }
                    })
                );

                const requestIds = await Promise.all(requestPromises);
                // Update apiInfo with request IDs
                apiInfo.paths = requestIds;
                await apiInfo.save();
               
                return apiInfo;
            } catch (error) {
                console.error(`Error saving API ${api.name}:`, error);
                return null;
            }
        }));

        const validApis = savedApis.filter(Boolean);

        return res.status(200).json({
            success: true,
            message: `Successfully imported ${validApis.length} APIs from Postman`,
            data: validApis
        });

    } catch (error) {
        console.error('Error fetching from Postman:', error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'API version already exists'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch from Postman',
            error: error.message
        });
    }
};