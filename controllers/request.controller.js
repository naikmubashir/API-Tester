const Request= require('../models/Request');
const { applyRuleToRequest, applyRuleToAllRequests } = require('../services/rule.service');
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


exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRequest = await Request.findByIdAndDelete(id);
        
        if (!deletedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: deletedRequest
        });
    } catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message
        });
    }
};

exports.deleteAllRequests = async (req, res) => {
    try {
        const result = await Request.deleteMany({});
        
        return res.status(200).json({
            success: true,
            message: 'All requests deleted successfully',
            count: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete all requests',
            error: error.message
        });
    }
};