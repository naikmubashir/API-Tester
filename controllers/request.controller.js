const Request= require('../models/Request')
exports.getAllRequests= async(req, res)=>{
    try {
        const requests = await Request.find({});
        console.log('Successfully retrieved all requests');
        return res.status(200).json({
            message: 'Requests retrieved successfully',
            data: requests
        });
    } catch (error) {
        console.error('Error retrieving requests:', error);
        return res.status(500).json({
            message: 'Failed to retrieve requests',
            error: error.message
        });
    }
}