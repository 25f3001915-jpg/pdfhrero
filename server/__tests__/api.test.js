const request = require('supertest');
const { app } = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('API Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('PDFMasterPro API is running');
  });
});

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdfmasterpro_test');
  });

  afterAll(async () => {
    // Clean up and close database connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(201);
    
    expect(res.body.status).toBe('success');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe('Test User');
  });

  it('should login existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      .expect(401);
    
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Invalid credentials');
  });
});

describe('PDF Processing API', () => {
  let token;
  
  beforeAll(async () => {
    // Setup user and get token
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdfmasterpro_test');
    
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'pdfuser@example.com',
        password: 'password123'
      });
    
    token = res.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should require authentication for PDF operations', async () => {
    const res = await request(app)
      .post('/api/pdf/merge')
      .expect(401);
    
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Not authorized to access this route');
  });

  it('should validate file uploads', async () => {
    const res = await request(app)
      .post('/api/pdf/merge')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Please upload at least 2 PDF files');
  });
});