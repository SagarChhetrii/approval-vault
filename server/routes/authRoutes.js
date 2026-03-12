const router = require('express').Router();
const { register, login, getUsers } = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticate, requireRole('admin'), getUsers);

module.exports = router;
//curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Sagar","email":"smgsagar087@gmail.com","password":"Sagar246800","role":"admin"}'//
