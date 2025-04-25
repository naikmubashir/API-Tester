const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  path: { type: String, required: true },
  methods: {
    get: mongoose.Schema.Types.Mixed,
    post: mongoose.Schema.Types.Mixed,
    put: mongoose.Schema.Types.Mixed,
    delete: mongoose.Schema.Types.Mixed,
    patch: mongoose.Schema.Types.Mixed,
    options: mongoose.Schema.Types.Mixed,
    head: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
