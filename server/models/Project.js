const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, enum: ['Pending', 'Changes Requested', 'Approved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
