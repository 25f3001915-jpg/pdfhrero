const Workflow = require('../models/Workflow');
const User = require('../models/User');
const PDFService = require('../services/pdfService');
const logger = require('../utils/logger');

// @desc    Create a new workflow
// @route   POST /api/workflow
// @access  Private
exports.createWorkflow = async (req, res, next) => {
  try {
    const { name, description, steps, category, tags, isPublic } = req.body;
    
    // Validate steps
    if (!steps || steps.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Workflow must have at least one step'
      });
    }

    // Check if user has workflow feature access
    if (!req.user.hasFeatureAccess('customWorkflows')) {
      return res.status(403).json({
        status: 'error',
        message: 'Custom workflows not available in your subscription tier'
      });
    }

    const workflow = await Workflow.create({
      name,
      description,
      userId: req.user.id,
      steps,
      category,
      tags,
      isPublic: isPublic || false
    });

    res.status(201).json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
          category: workflow.category,
          tags: workflow.tags,
          isPublic: workflow.isPublic,
          createdAt: workflow.createdAt
        }
      }
    });
  } catch (err) {
    logger.error('Create workflow error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get all workflows for user
// @route   GET /api/workflow
// @access  Private
exports.getWorkflows = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

    let query = { userId: req.user.id };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const workflows = await Workflow.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Workflow.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        workflows: workflows.map(wf => ({
          id: wf._id,
          name: wf.name,
          description: wf.description,
          steps: wf.steps,
          category: wf.category,
          tags: wf.tags,
          isPublic: wf.isPublic,
          usageCount: wf.usageCount,
          stepCount: wf.stepCount,
          estimatedTime: wf.estimatedTime,
          createdAt: wf.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    logger.error('Get workflows error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get public workflows
// @route   GET /api/workflow/public
// @access  Public
exports.getPublicWorkflows = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;

    let query = { isPublic: true };
    if (category) {
      query.category = category;
    }

    const workflows = await Workflow.find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name avatar');

    const total = await Workflow.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        workflows: workflows.map(wf => ({
          id: wf._id,
          name: wf.name,
          description: wf.description,
          category: wf.category,
          tags: wf.tags,
          usageCount: wf.usageCount,
          stepCount: wf.stepCount,
          estimatedTime: wf.estimatedTime,
          createdBy: wf.userId ? {
            name: wf.userId.name,
            avatar: wf.userId.avatar
          } : null,
          createdAt: wf.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    logger.error('Get public workflows error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get single workflow
// @route   GET /api/workflow/:id
// @access  Private (owner) or Public (if public)
exports.getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    // Check access
    if (!workflow.isPublic && workflow.userId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this workflow'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
          category: workflow.category,
          tags: workflow.tags,
          isPublic: workflow.isPublic,
          usageCount: workflow.usageCount,
          stepCount: workflow.stepCount,
          estimatedTime: workflow.estimatedTime,
          createdBy: workflow.userId ? {
            name: workflow.userId.name,
            avatar: workflow.userId.avatar
          } : null,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt
        }
      }
    });
  } catch (err) {
    logger.error('Get workflow error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update workflow
// @route   PUT /api/workflow/:id
// @access  Private
exports.updateWorkflow = async (req, res, next) => {
  try {
    let workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.userId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this workflow'
      });
    }

    const { name, description, steps, category, tags, isPublic } = req.body;

    // Validate steps if provided
    if (steps) {
      if (steps.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Workflow must have at least one step'
        });
      }
    }

    workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      {
        name: name || workflow.name,
        description: description || workflow.description,
        steps: steps || workflow.steps,
        category: category || workflow.category,
        tags: tags || workflow.tags,
        isPublic: isPublic !== undefined ? isPublic : workflow.isPublic
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        workflow: {
          id: workflow._id,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
          category: workflow.category,
          tags: workflow.tags,
          isPublic: workflow.isPublic,
          usageCount: workflow.usageCount,
          stepCount: workflow.stepCount,
          estimatedTime: workflow.estimatedTime,
          updatedAt: workflow.updatedAt
        }
      }
    });
  } catch (err) {
    logger.error('Update workflow error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Delete workflow
// @route   DELETE /api/workflow/:id
// @access  Private
exports.deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    // Check ownership
    if (workflow.userId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this workflow'
      });
    }

    await workflow.remove();

    res.status(200).json({
      status: 'success',
      message: 'Workflow deleted successfully'
    });
  } catch (err) {
    logger.error('Delete workflow error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Execute workflow
// @route   POST /api/workflow/:id/execute
// @access  Private
exports.executeWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found'
      });
    }

    // Check access
    if (!workflow.isPublic && workflow.userId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to execute this workflow'
      });
    }

    // Check if user has quota
    if (!req.user.hasQuotaAvailable()) {
      return res.status(429).json({
        status: 'error',
        message: 'Monthly processing quota exceeded'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload files to process'
      });
    }

    const startTime = Date.now();
    
    // Validate workflow steps
    try {
      workflow.validateSteps();
    } catch (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError.message
      });
    }

    // Execute workflow steps
    let currentFiles = req.files;
    let processingResults = [];
    
    for (const step of workflow.steps) {
      try {
        let result;
        
        switch (step.operation) {
          case 'merge':
            result = await PDFService.mergePDFs(currentFiles, step.parameters);
            currentFiles = [{ path: result.path, size: result.size }];
            break;
            
          case 'split':
            result = await PDFService.splitPDF(currentFiles[0], step.parameters);
            if (result.files) {
              currentFiles = result.files.map(f => ({ path: f.path, size: f.size }));
            }
            break;
            
          case 'compress':
            result = await PDFService.compressPDF(currentFiles[0], step.parameters);
            currentFiles = [{ path: result.path, size: result.size }];
            break;
            
          case 'watermark':
            result = await PDFService.addWatermark(currentFiles[0], step.parameters);
            currentFiles = [{ path: result.path, size: result.size }];
            break;
            
          case 'ocr':
            result = await PDFService.performOCR(currentFiles[0], step.parameters);
            if (result.path) {
              currentFiles = [{ path: result.path, size: result.size }];
            }
            break;
            
          default:
            throw new Error(`Unsupported operation: ${step.operation}`);
        }
        
        processingResults.push({
          step: step.operation,
          result: result,
          processingTime: result.processingTime
        });
        
      } catch (stepError) {
        logger.error(`Workflow step error (${step.operation}):`, stepError);
        
        // Handle step failure based on workflow configuration
        if (workflow.onError === 'stop') {
          throw new Error(`Workflow failed at step ${step.operation}: ${stepError.message}`);
        } else if (workflow.onError === 'retry') {
          // Retry logic would go here
          throw new Error(`Workflow failed at step ${step.operation}: ${stepError.message}`);
        }
        // If 'continue', we skip this step and continue with next
      }
    }

    const totalTime = Date.now() - startTime;
    
    // Update workflow usage statistics
    workflow.incrementUsage(totalTime, true);
    await workflow.save();

    // Update user usage
    let totalFileSize = 0;
    for (const file of currentFiles) {
      totalFileSize += file.size || 0;
    }
    req.user.incrementUsage(totalFileSize);
    req.user.addProcessingHistory('workflow-execute', workflow.name, totalFileSize, totalTime);
    await req.user.save();

    // Create processing history
    await ProcessingHistory.create({
      userId: req.user.id,
      workflowId: workflow._id,
      operation: 'workflow-execute',
      originalFiles: req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype
      })),
      resultFile: currentFiles.length === 1 ? {
        name: `workflow_result_${Date.now()}.pdf`,
        size: currentFiles[0].size,
        path: currentFiles[0].path
      } : null,
      processingTime: totalTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      status: 'completed',
      featuresUsed: workflow.steps.map(step => ({
        name: step.operation,
        value: step.parameters
      }))
    });

    // Send result
    if (currentFiles.length === 1) {
      const resultFile = currentFiles[0];
      res.setHeader('Content-Disposition', `attachment; filename="workflow_result_${Date.now()}.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.sendFile(resultFile.path, async (err) => {
        if (err) {
          logger.error('Error sending file:', err);
        }
        try {
          await fs.unlink(resultFile.path);
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp file:', cleanupErr);
        }
      });
    } else {
      // Multiple files - create ZIP
      const zipResult = await PDFService.createZip(
        currentFiles.map((f, i) => ({ 
          path: f.path, 
          name: `result_${i + 1}.pdf` 
        })), 
        `workflow_result_${Date.now()}.zip`
      );
      
      res.setHeader('Content-Disposition', `attachment; filename="workflow_result_${Date.now()}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      res.sendFile(zipResult.path, async (err) => {
        if (err) {
          logger.error('Error sending ZIP file:', err);
        }
        try {
          await fs.unlink(zipResult.path);
          for (const file of currentFiles) {
            await fs.unlink(file.path);
          }
        } catch (cleanupErr) {
          logger.debug('Failed to cleanup temp files:', cleanupErr);
        }
      });
    }

  } catch (err) {
    logger.error('Execute workflow error:', err);
    
    // Update workflow with failure
    const workflow = await Workflow.findById(req.params.id);
    if (workflow) {
      workflow.incrementUsage(0, false); // Failed execution
      await workflow.save();
    }
    
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get workflow categories
// @route   GET /api/workflow/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Workflow.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count
        }))
      }
    });
  } catch (err) {
    logger.error('Get categories error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};