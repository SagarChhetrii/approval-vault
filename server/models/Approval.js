const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  versionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Version', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp:  { type: Date, default: Date.now },
  fileHash:   { type: String, required: true },
  ipAddress:  { type: String },
});

module.exports = mongoose.model('Approval', approvalSchema);
