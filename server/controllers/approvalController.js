const Approval = require('../models/Approval');
const { Version } = require('../models/Version');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

async function log(projectId, action, userId, meta = {}) {
  await AuditLog.create({ projectId, action, userId, meta });
}

/**
 * POST /api/versions/:id/approve
 * Client approves a specific file version.
 */
async function approveVersion(req, res) {
  try {
    const version = await Version.findById(req.params.id);
    if (!version) return res.status(404).json({ message: 'Version not found' });
    if (version.locked) return res.status(400).json({ message: 'Already approved and locked' });

    const project = await Project.findById(version.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only the assigned client can approve
    if (req.user.role === 'client' && project.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not your project' });
    }

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress;

    // Lock the version
    version.locked = true;
    await version.save();

    // Create approval record
    const approval = await Approval.create({
      versionId: version._id,
      approvedBy: req.user.userId,
      fileHash: version.hash,
      ipAddress,
    });

    // Update project status
    project.status = 'Approved';
    await project.save();

    // Audit
    await log(project._id, 'APPROVE', req.user.userId, {
      versionId: version._id,
      fileHash: version.hash,
      ipAddress,
    });

    // Build approval certificate
    const approver = await User.findById(req.user.userId).select('name email');
    const certificate = {
      projectName: project.title,
      projectId: project._id,
      versionNumber: version.versionNumber,
      filename: version.filename,
      fileHash: version.hash,
      shortHash: `${version.hash.slice(0, 6)}...${version.hash.slice(-6)}`,
      approvedBy: { name: approver.name, email: approver.email },
      approvedAt: approval.timestamp,
      ipAddress,
      approvalId: approval._id,
    };

    res.json({ message: 'Approved successfully', certificate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/versions/:id/approval
 * Fetch approval certificate for a version.
 */
async function getApproval(req, res) {
  try {
    const approval = await Approval.findOne({ versionId: req.params.id })
      .populate('approvedBy', 'name email')
      .populate('versionId');

    if (!approval) return res.status(404).json({ message: 'No approval found for this version' });

    const version = approval.versionId;
    const project = await Project.findById(version.projectId);

    const certificate = {
      approvalId: approval._id,
      projectName: project?.title,
      projectId: project?._id,
      versionNumber: version.versionNumber,
      filename: version.filename,
      fileHash: approval.fileHash,
      shortHash: `${approval.fileHash.slice(0, 6)}...${approval.fileHash.slice(-6)}`,
      approvedBy: { name: approval.approvedBy.name, email: approval.approvedBy.email },
      approvedAt: approval.timestamp,
      ipAddress: approval.ipAddress,
    };

    res.json(certificate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { approveVersion, getApproval };
