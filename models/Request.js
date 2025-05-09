const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  path: { type: String, required: true },
  method: {
    type: String,
    required: true,
    enum: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']
  },
  details: mongoose.Schema.Types.Mixed,
  apiInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiInfo',
    required: true
  }
}, { timestamps: true });

// Compound index for unique paths per API
requestSchema.index({ path: 1, method: 1, apiInfo: 1 }, { unique: true });

module.exports = mongoose.model('Request', requestSchema);
