module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://<user>:<pass>@cluster.mongodb.net/approvalportal',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret_change_in_production',
  PORT: process.env.PORT || 5000,
  UPLOAD_DIR: './uploads',
};
