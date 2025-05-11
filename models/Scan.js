const mongoose = require('mongoose');

const endpointResultSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        required: true
    },
    processedRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcessedRequest',
        required:true,
    },
    passed: {
        type: Boolean,
        required: true
    },
    violations: [{
        rule: String,
        description: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        }
    }]
});

const scanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    yamlRule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YamlRule',
        required: true
    },
    originalRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    }],
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'failed'],
        default: 'in_progress'
    },
    results: [endpointResultSchema],
    summary: {
        totalEndpoints: Number,
        passedEndpoints: Number,
        failedEndpoints: Number,
        criticalViolations: Number,
        highViolations: Number,
        mediumViolations: Number,
        lowViolations: Number
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate summary before saving
scanSchema.pre('save', function(next) {
    // Initialize violations count
    const violations = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    if (this.results && this.results.length > 0) {
        const total = this.results.length;
        const passed = this.results.filter(r => r.passed).length;
        
        // Count violations by severity with proper case handling
        this.results.forEach(result => {
            if (Array.isArray(result.violations)) {
                result.violations.forEach(violation => {
                    if (violation.severity) {
                        const normalizedSeverity = violation.severity.toLowerCase();
                        if (violations.hasOwnProperty(normalizedSeverity)) {
                            violations[normalizedSeverity]++;
                        }
                    }
                });
            }
        });

        // Compare results count with original requests count to determine completion
        const isComplete = this.results.length === this.originalRequest.length;

        this.summary = {
            totalEndpoints: total,
            passedEndpoints: passed,
            failedEndpoints: total - passed,
            criticalViolations: violations.critical,
            highViolations: violations.high,
            mediumViolations: violations.medium,
            lowViolations: violations.low
        };

        // Update status and completedAt
        if (this.status === 'in_progress' && isComplete) {
            this.status = 'completed';
            this.completedAt = new Date();
        }
    } else if (this.status === 'failed') {
        // For failed scans, keep track of the attempt
        this.summary = {
            totalEndpoints: this.results?.length || 0,
            passedEndpoints: 0,
            failedEndpoints: this.results?.length || 1, // At least 1 failure
            criticalViolations: violations.critical + 1, // Count the failure itself
            highViolations: violations.high,
            mediumViolations: violations.medium,
            lowViolations: violations.low
        };
        
        if (!this.completedAt) {
            this.completedAt = new Date();
        }
    } else if (!this.summary) {
        // Initialize summary for new scans
        this.summary = {
            totalEndpoints: 0,
            passedEndpoints: 0,
            failedEndpoints: 0,
            criticalViolations: 0,
            highViolations: 0,
            mediumViolations: 0,
            lowViolations: 0
        };
    }

    next();
});

// Virtual for pass percentage
scanSchema.virtual('passPercentage').get(function() {
    return this.summary?.totalEndpoints 
        ? (this.summary.passedEndpoints / this.summary.totalEndpoints) * 100 
        : 0;
});

// Add indexes
scanSchema.index({ status: 1, createdAt: -1 });
scanSchema.index({ yamlRule: 1 });
scanSchema.index({ originalRequest: 1 });

module.exports = mongoose.model('Scan', scanSchema);