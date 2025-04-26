const axios = require('axios');
const ApiInfo = require('../models/ApiInfo');
const Request = require('../models/Request');

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

        // Process and store Request documents
        const requestDocs = await Promise.all(
            Object.entries(swaggerData.paths).map(async ([path, methods]) => {
                const request = new Request({ path, methods });
                await request.save();
                return request._id;
            })
        );

        // Store ApiInfo document
        const apiInfo = new ApiInfo({
            ...swaggerData,
            paths: requestDocs,
        });

        await apiInfo.save();
        console.log('Swagger data stored successfully');
        return res.status(201).json({ message: 'Swagger data stored successfully' });
    } catch (error) {
        if (error.response) {
            // Error from the Swagger API
            console.error('Error fetching Swagger API:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Error fetching Swagger API',
                details: error.response.data,
            });
        } else if (error.request) {
            // No response received from the Swagger API
            console.error('No response from Swagger API:', error.request);
            return res.status(502).json({ error: 'No response from Swagger API' });
        } else {
            // Other errors (e.g., database errors)
            console.error('Error fetching or storing Swagger data:', error.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
