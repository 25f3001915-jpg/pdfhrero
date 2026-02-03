const express = require('express');
const {
  createWorkflow,
  getWorkflows,
  getPublicWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getCategories
} = require('../controllers/workflowController');
const { auth, requireFeature } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/public', getPublicWorkflows);
router.get('/categories', getCategories);

// Apply authentication middleware to all other routes
router.use(auth);

// Workflow CRUD operations
router.post('/', requireFeature('customWorkflows'), createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

// Execute workflow
router.post('/:id/execute', checkQuota(), executeWorkflow);

module.exports = router;