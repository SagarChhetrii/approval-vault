const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProject,
  uploadFile,
  getVersions,
  addComment,
  getComments,
  requestChanges,
  getAuditLog,
} = require('../controllers/projectController');
const { approveVersion, getApproval } = require('../controllers/approvalController');

// Projects
router.post('/projects', authenticate, requireRole('admin'), createProject);
router.get('/projects', authenticate, getProjects);
router.get('/projects/:id', authenticate, getProject);
router.post('/projects/:id/upload', authenticate, requireRole('admin'), uploadFile);
router.get('/projects/:id/versions', authenticate, getVersions);
router.post('/projects/:id/request-changes', authenticate, requireRole('client'), requestChanges);
router.get('/projects/:id/audit', authenticate, getAuditLog);

// Versions
router.post('/versions/:id/comment', authenticate, addComment);
router.get('/versions/:id/comments', authenticate, getComments);
router.post('/versions/:id/approve', authenticate, requireRole('client'), approveVersion);
router.get('/versions/:id/approval', authenticate, getApproval);

module.exports = router;
