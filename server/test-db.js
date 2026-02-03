const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdfmasterpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});