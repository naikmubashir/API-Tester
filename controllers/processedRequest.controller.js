const ProcessedRequest = require('../models/ProcessedRequest');

// Create a new processed request
exports.createProcessedRequest = async (req, res) => {
    try {
        const processedRequest = new ProcessedRequest(req.body);
        const savedRequest = await processedRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Retrieve all processed requests
exports.getAllProcessedRequests = async (req, res) => {
    try {
        const processedRequests = await ProcessedRequest.find();
        res.status(200).json({
            message:'Processed Requests retrieved successfully',
            data:processedRequests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Find a single processed request by id
exports.getProcessedRequestById = async (req, res) => {
    try {
        const processedRequest = await ProcessedRequest.findById(req.params.id);
        if (!processedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(processedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a processed request
exports.updateProcessedRequest = async (req, res) => {
    try {
        const updatedRequest = await ProcessedRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a processed request
exports.deleteProcessedRequest = async (req, res) => {
    try {
        const deletedRequest = await ProcessedRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};