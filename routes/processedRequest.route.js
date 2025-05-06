const express = require('express');
const processedRequestController = require('../controllers/processedRequest.controller');

const router = express.Router();

router.post('/', processedRequestController.createProcessedRequest);
router.get('/', processedRequestController.getAllProcessedRequests);
router.get('/:id', processedRequestController.getProcessedRequestById);
router.put('/:id', processedRequestController.updateProcessedRequest);
router.delete('/:id', processedRequestController.deleteProcessedRequest);

module.exports = router;