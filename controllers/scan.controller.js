const Scan = require('../models/Scan');
const YamlRule = require('../models/YamlRule');
const Request = require('../models/Request');
const ProcessedRequest = require('../models/ProcessedRequest');
const { applyRuleToRequest } = require('../services/rule.service');

// Create a new scan
exports.createScan = async (req, res) => {
    try {
        const { name, ruleId, requestId } = req.body;

        // Validate inputs
        if (!name || !ruleId || !requestId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Verify referenced documents exist
        const [rule, request] = await Promise.all([
            YamlRule.findById(ruleId),
            Request.findById(requestId)
        ]);

        if (!rule || !request) {
            return res.status(404).json({
                success: false,
                message: !rule ? 'Rule not found' : 'Request not found'
            });
        }

        // Create new scan
        const scan = new Scan({
            name,
            yamlRule: ruleId,
            originalRequest: requestId,
            status: 'in_progress',
            startedAt: new Date()
        });

        await scan.save();

        // Start processing in background
        processScan(scan._id).catch(err => {

            console.error('Error processing scan:', err)
            // implement a notification system here
        });

        return res.status(201).json({
            success: true,
            message: 'Scan created successfully',
            data: scan
        });

    } catch (error) {
        console.error('Error creating scan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create scan',
            error: error.message
        });
    }
};

// Get all scans
exports.getAllScans = async (req, res) => {
    try {
        const scans = await Scan.find()
            .populate('yamlRule', 'name')
            .populate('originalRequest', 'path')
            .sort('-createdAt');

        return res.status(200).json({
            success: true,
            data: scans
        });

    } catch (error) {
        console.error('Error fetching scans:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch scans',
            error: error.message
        });
    }
};

// Get scan by ID
exports.getScanById = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id)
            .populate('yamlRule')
            .populate('originalRequest')
            .populate('results.processedRequest');

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: scan
        });

    } catch (error) {
        console.error('Error fetching scan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch scan',
            error: error.message
        });
    }
};

// Helper function to process scan
async function processScan(scanId) {
    try {
        const scan = await Scan.findById(scanId)
            .populate('yamlRule')
            .populate('originalRequest');

        if (!scan) throw new Error('Scan not found');

        // Process the request with the rule
        const processedRequest = await applyRuleToRequest(
            scan.originalRequest._id,
            scan.yamlRule._id
        );

        // Update scan with results
        scan.results.push({
            endpoint: processedRequest.path,
            method: Object.keys(processedRequest.methods)[0]?.toUpperCase() || 'GET',
            processedRequest: processedRequest._id,
            passed: processedRequest.isSuccessful,
            violations: [] // Add logic to determine violations
        });

        // Calculate and update summary
        const total = scan.results.length;
        const passed = scan.results.filter(r => r.passed).length;
        
        scan.summary = {
            totalEndpoints: total,
            passedEndpoints: passed,
            failedEndpoints: total - passed,
            criticalViolations: 0,
            highViolations: 0,
            mediumViolations: 0,
            lowViolations: 0
        };

        scan.status = 'completed';
        scan.completedAt = new Date();
        await scan.save();

    } catch (error) {
        console.error('Error processing scan:', error);
        await Scan.findByIdAndUpdate(scanId, {
            status: 'failed',
            completedAt: new Date()
        });
        throw error; // Re-throw to be caught by the caller
    }
}

// Delete scan
exports.deleteScan = async (req, res) => {
    try {
        const scan = await Scan.findById(req.params.id);
        
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        // Delete associated processed requests
        await ProcessedRequest.deleteMany({ scan: scan._id });
        
        // Delete the scan
        await Scan.deleteOne({ _id: scan._id });

        return res.status(200).json({
            success: true,
            message: 'Scan deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting scan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete scan',
            error: error.message
        });
    }
};