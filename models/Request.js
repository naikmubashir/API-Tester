const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  path: { type: String, required: true },
  method: {
    type: String,
    required: true,
    enum: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']
  },
  details: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
