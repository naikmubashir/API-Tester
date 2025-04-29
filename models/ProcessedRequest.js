const mongoose = require('mongoose');

const processedRequestSchema = new mongoose.Schema({
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

module.exports = mongoose.model('ProcessedRequest', processedRequestSchema);


// const ruleResultSchema = new mongoose.Schema({
//   request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
//   rule:    { type: mongoose.Schema.Types.ObjectId, ref: 'YamlRule', required: true },
//   passed:  { type: Boolean, required: true },
//   details: { type: mongoose.Schema.Types.Mixed },     // any extra info,... eg which fields failed
// }, { timestamps: true });

// module.exports = mongoose.model('RuleResult', ruleResultSchema);
