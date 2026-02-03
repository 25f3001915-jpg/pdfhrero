// Test setup file
require('dotenv').config({ path: '.env.test' });

// Mock external services
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      create: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        latest_invoice: {
          payment_intent: {
            client_secret: 'pi_test_secret'
          }
        }
      }),
      update: jest.fn().mockResolvedValue({})
    },
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
      update: jest.fn().mockResolvedValue({})
    },
    paymentMethods: {
      attach: jest.fn().mockResolvedValue({})
    }
  }));
});

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn().mockResolvedValue({
    loadLanguage: jest.fn().mockResolvedValue(),
    initialize: jest.fn().mockResolvedValue(),
    recognize: jest.fn().mockResolvedValue({
      data: { text: 'Mock OCR text' }
    }),
    terminate: jest.fn().mockResolvedValue()
  })
}));

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(),
      evaluate: jest.fn().mockResolvedValue(1),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-image'))
    }),
    close: jest.fn().mockResolvedValue()
  })
}));

// Suppress console logs in tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}