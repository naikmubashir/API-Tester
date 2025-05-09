const axios = require('axios');
const ApiInfo = require('../models/ApiInfo');
const Request = require('../models/Request');

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