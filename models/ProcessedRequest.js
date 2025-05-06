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
  response: {
    status: { type: Number },
    headers: { type: Map, of: String },
    body: mongoose.Schema.Types.Mixed
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
  return this.response.status >= 200 && this.response.status < 300;
});

// Index for faster lookups
processedRequestSchema.index({ path: 1, 'response.status': 1 });
processedRequestSchema.index({ createdAt: -1 });
processedRequestSchema.index({ scan: 1 });


module.exports = mongoose.model('ProcessedRequest', processedRequestSchema);
// const ruleResultSchema = new mongoose.Schema({
//   request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
//   rule:    { type: mongoose.Schema.Types.ObjectId, ref: 'YamlRule', required: true },
//   passed:  { type: Boolean, required: true },
//   details: { type: mongoose.Schema.Types.Mixed },     // any extra info,... eg which fields failed
// }, { timestamps: true });

// module.exports = mongoose.model('RuleResult', ruleResultSchema);




//host, path