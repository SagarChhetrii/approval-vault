const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Project = require('../models/Project');
const { Version, Comment } = require('../models/Version');
const AuditLog = require('../models/AuditLog');
const { hashFile } = require('../utils/hashFile');
const { UPLOAD_DIR } = require('../config');

// ─── Ensure upload directory exists ───────────────────────────────────────────
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
}).single('file');

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function log(projectId, action, userId, meta = {}) {
  await AuditLog.create({ projectId, action, userId, meta });
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/** POST /api/projects  (admin only) */
async function createProject(req, res) {
  try {
    const { title, clientId } = req.body;
    if (!title || !clientId) return res.status(400).json({ message: 'title and clientId required' });
    const project = await Project.create({ title, clientId });
    await log(project._id, 'PROJECT_CREATED', req.user.userId, { title });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** GET /api/projects */
async function getProjects(req, res) {
  try {
    const filter = req.user.role === 'client' ? { clientId: req.user.userId } : {};
    const projects = await Project.find(filter).populate('clientId', 'name email').sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** GET /api/projects/:id */
async function getProject(req, res) {
  try {
    const project = await Project.findById(req.params.id).populate('clientId', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** POST /api/projects/:id/upload  (admin only) */
async function uploadFile(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
      const projectId = req.params.id;
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      // Check if latest version is locked (approved)
      const latest = await Version.findOne({ projectId }).sort('-versionNumber');
      if (latest && latest.locked) {
        // Reset project status — re-approval required
        project.status = 'Pending';
        await project.save();
      }

      const versionNumber = latest ? latest.versionNumber + 1 : 1;
      const filePath = path.join(UPLOAD_DIR, req.file.filename);
      const hash = await hashFile(filePath);

      const version = await Version.create({
        projectId,
        filename: req.file.originalname,
        storagePath: req.file.filename,
        uploadedBy: req.user.userId,
        versionNumber,
        hash,
        locked: false,
      });

      await log(projectId, 'UPLOAD', req.user.userId, { versionId: version._id, versionNumber, hash });
      res.status(201).json(version);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
}

/** GET /api/projects/:id/versions */
async function getVersions(req, res) {
  try {
    const versions = await Version.find({ projectId: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort('-versionNumber');
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** POST /api/versions/:id/comment */
async function addComment(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text required' });
    const version = await Version.findById(req.params.id);
    if (!version) return res.status(404).json({ message: 'Version not found' });

    const comment = await Comment.create({ versionId: version._id, userId: req.user.userId, text });
    await log(version.projectId, 'COMMENT', req.user.userId, { versionId: version._id, text });
    const populated = await comment.populate('userId', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** GET /api/versions/:id/comments */
async function getComments(req, res) {
  try {
    const comments = await Comment.find({ versionId: req.params.id })
      .populate('userId', 'name email')
      .sort('createdAt');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** POST /api/projects/:id/request-changes  (client only) */
async function requestChanges(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.status = 'Changes Requested';
    await project.save();
    await log(project._id, 'CHANGES_REQUESTED', req.user.userId);
    res.json({ message: 'Changes requested', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** GET /api/projects/:id/audit */
async function getAuditLog(req, res) {
  try {
    const logs = await AuditLog.find({ projectId: req.params.id })
      .populate('userId', 'name email')
      .sort('timestamp');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  uploadFile,
  getVersions,
  addComment,
  getComments,
  requestChanges,
  getAuditLog,
};