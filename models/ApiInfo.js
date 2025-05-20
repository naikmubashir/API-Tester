const mongoose = require('mongoose');

const apiInfoSchema = new mongoose.Schema({
  swagger: String,
  info: {
    description: String,
    version: String,
    title: String,
    termsOfService: String,
    contact: {
      email: String,
    },
    license: {
      name: String,
      url: String,
    },
  },
  host: String,
  basePath: String,
  tags: [
    {
      name: String,
      description: String,
      externalDocs: {
        description: String,
        url: String,
      },
    }
  ],
  schemes: [String],
  securityDefinitions: mongoose.Schema.Types.Mixed,
  definitions: mongoose.Schema.Types.Mixed,
  externalDocs: {
    description: String,
    url: String,
  },
  paths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request', required:true,}],
  source: {
        type: String,
        enum: ['swagger', 'postman'],
        required: true,
        default: 'swagger'
    }
}, { timestamps: true });

// Indexes for better query performance
apiInfoSchema.index({ 'info.title': 1, 'info.version': 1 }, { unique: true });
apiInfoSchema.index({ createdAt: -1 });
apiInfoSchema.index({ 'info.title': 'text' }); // Enable text search on title

// Virtual for API full name
apiInfoSchema.virtual('fullName').get(function() {
  return `${this.info.title} ${this.info.version}`;
});

module.exports = mongoose.model('ApiInfo', apiInfoSchema);
