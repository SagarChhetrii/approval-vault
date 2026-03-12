const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  projectId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  filename:      { type: String, required: true },
  storagePath:   { type: String, required: true },
  uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  versionNumber: { type: Number, required: true },
  hash:          { type: String, required: true },
  locked:        { type: Boolean, default: false },
  createdAt:     { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  versionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Version', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Version: mongoose.model('Version', versionSchema),
  Comment: mongoose.model('Comment', commentSchema),
};
