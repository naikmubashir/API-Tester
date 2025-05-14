const Scan = require('../models/Scan');
const Request = require('../models/Request');
const ProcessedRequest = require('../models/ProcessedRequest');
const { applyRuleToRequest } = require('../services/rule.service');
const { RULES } = require('../services/rule.service');
const mongoose = require('mongoose');

// Create a new scan
exports.createScan = async (req, res) => {
    try {
        const { name, ruleId, requestIds } = req.body;

        // Validate inputs
        if (!name || !ruleId || !requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields or invalid request IDs'
            });
        }
        // Verify that the rule exists and get requests
        const rule = RULES[ruleId];
        const requests = await Request.find({
            _id: { $in: requestIds }
        });

        if (!rule || (requests.length !== requestIds.length)) {
            return res.status(404).json({
                success: false,
                message: !rule ? 'Rule not found' : 'One or more requests not found'
            });
        }
        // Validate that all IDs are valid ObjectIDs
        const validIds = requestIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!validIds) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request ID format'
            });
        }
        console.log('[CHECK 1]')
        // Create new scan
        const scan = new Scan({
            name,
            ruleId, // Store rule ID directly since we're using JS rules
            originalRequest: requestIds,
            status: 'in_progress',
            startedAt: new Date()
        });
        console.log('[CHECK 2]')

        await scan.save();
        console.log('[CHECK 3]')

        // Start processing in background    
        processMultipleRequests(scan._id).catch(err=>{
            console.error('Error processing scan:', err)
            // implement a notification system here
        })
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

        // Determine violations based on response
        const violations = [];
        if (!processedRequest.isSuccessful) {
            // Add response status violation
            violations.push({
                rule: 'Response Status Check',
                description: `Unexpected response status: ${processedRequest.response?.status || 'No response'}`,
                severity: processedRequest.response?.status >= 500 ? 'critical' : 'high'
            });
        }

        // Check for timeout or network errors
        if (processedRequest.response?.error) {
            violations.push({
                rule: 'Network Error Check',
                description: processedRequest.response.error,
                severity: 'critical'
            });
        }

        // Update scan with results
        scan.results.push({
            endpoint: processedRequest.path,
            method: processedRequest.method?.toUpperCase() || 'GET',
            processedRequest: processedRequest._id,
            passed: processedRequest.isSuccessful,
            violations
        });

        // Save the scan - this will trigger the pre-save hook that calculates the summary
        await scan.save();

    } catch (error) {
        console.error('Error processing scan:', error);
        let errorMessage;
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors)
                .map(err => err.message)
                .join('. ');
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid ID format';
        } else {
            errorMessage = error.message || 'Unknown error occurred';
        }
        
        try {
            // Update scan with error state using findOne and save to ensure hooks run
            const failedScan = await Scan.findById(scanId);
            if (failedScan) {
                failedScan.status = 'failed';
                failedScan.completedAt = new Date();
                failedScan.results.push({
                    endpoint: 'N/A',
                    method: 'N/A',
                    passed: false,
                    violations: [{
                        rule: 'Scan Processing Error',
                        description: errorMessage,
                        severity: 'critical'
                    }]
                });
                
                await failedScan.save();
            }
        } catch (saveError) {
            console.error('Error saving failed scan status:', saveError);
        }
        
        throw error;
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



async function processMultipleRequests(scanId) {
    try {
        const scan = await Scan.findById(scanId)
            .populate('originalRequest');
        console.log('[CHECK 4]')

        if (!scan) throw new Error('Scan not found');

        // Process each request
        for (const request of scan.originalRequest) {
            try {
                        console.log('[CHECK 5]')

                const processedRequests = await applyRuleToRequest(
                    request._id,
                    scan.ruleId,
                    scanId
                );
        console.log('[CHECK 11]')

                // Handle each processed request (there might be multiple due to rule transformations)
                for (const processedRequest of processedRequests) {
                    const violations = [];

                    // Check for response issues
                    if (!processedRequest.isSuccessful) {
                        violations.push({
                            rule: 'Response Status Check',
                            description: `Unexpected response status: ${processedRequest.response?.status || 'No response'}`,
                            severity: processedRequest.response?.status >= 500 ? 'critical' : 'high'
                        });
                    }

                    // Add any vulnerabilities found by the rule
                    if (processedRequest.vulnerabilities?.hasError) {
                        violations.push(...processedRequest.vulnerabilities.details.map(detail => ({
                            rule: scan.ruleId,
                            description: detail,
                            severity: 'high'
                        })));
                    }

                    scan.results.push({
                        endpoint: processedRequest.path,
                        method: processedRequest.method?.toUpperCase() || 'GET',
                        processedRequest: processedRequest._id,
                    passed: processedRequest.isSuccessful,
                    violations
                });
            }
                await scan.save();
            } catch (error) {
                console.error(`Error processing request ${request._id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in processMultipleRequests:', error);
        throw error;
    }
}