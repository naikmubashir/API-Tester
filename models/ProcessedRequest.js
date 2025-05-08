const mongoose = require('mongoose');

const processedRequestSchema = new mongoose.Schema({
  path: { type: String, required: true },
  method: {
    type: String,
    required: true,
    enum: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']
  },
  response: {
    status: { type: Number },
    headers: { type: Map, of: String },
    body: mongoose.Schema.Types.Mixed,
    error: String
  },
  request: {
    headers: { type: Map, of: String },
    body: mongoose.Schema.Types.Mixed,
    query: { type: Map, of: String }
  },
  scan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    //required:true,
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Virtual to check if the request was successful
processedRequestSchema.virtual('isSuccessful').get(function() {
  if (this.response?.error) return false;
  return this.response?.status >= 200 && this.response?.status < 300;
});

// Index for faster lookups
processedRequestSchema.index({ path: 1, 'response.status': 1 });
processedRequestSchema.index({ createdAt: -1 });
processedRequestSchema.index({ scan: 1 });

module.exports = mongoose.model('ProcessedRequest', processedRequestSchema);