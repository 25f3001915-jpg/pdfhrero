#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PDFMasterPro Backend Setup Script');
console.log('=====================================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));

if (majorVersion < 20) {
  console.error('❌ Node.js 20 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
  } else {
    console.error('❌ .env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create necessary directories
const dirs = ['uploads', 'temp', 'logs'];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Generate JWT secret if not set
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('your_super_secret_jwt_key_here')) {
  console.log('\n🔐 Generating JWT secret...');
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');
  const updatedEnv = envContent.replace(
    'your_super_secret_jwt_key_here_change_this_in_production',
    jwtSecret
  );
  fs.writeFileSync(envPath, updatedEnv);
  console.log('✅ JWT secret generated and saved to .env');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Edit the .env file with your actual configuration');
console.log('2. Start MongoDB server');
console.log('3. Run: npm run dev');
console.log('4. The API will be available at http://localhost:5000');

console.log('\n📚 Documentation:');
console.log('- API Documentation: README.md');
console.log('- Environment variables: .env.example');