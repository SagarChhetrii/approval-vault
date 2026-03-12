const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  action:    { type: String, required: true }, // 'UPLOAD' | 'COMMENT' | 'APPROVE' | 'CHANGES_REQUESTED' | 'LOGIN'
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta:      { type: Object }, // any extra data (versionId, comment text, etc.)
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
