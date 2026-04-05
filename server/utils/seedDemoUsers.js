const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function upsertDemoUser({ name, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      role,
      password_hash,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedDemoUsers() {
  await upsertDemoUser({
    name: 'Demo Admin',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  });

  await upsertDemoUser({
    name: 'Demo Client',
    email: 'client@test.com',
    password: 'client123',
    role: 'client',
  });

  console.log('Demo users are ready: admin@test.com, client@test.com');
}

module.exports = { seedDemoUsers };
