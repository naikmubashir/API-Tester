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
  paths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
}, { timestamps: true });

module.exports = mongoose.model('ApiInfo', apiInfoSchema);
