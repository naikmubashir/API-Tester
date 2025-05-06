const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scan.controller');

router.post('/', scanController.createScan);
router.get('/', scanController.getAllScans);
router.get('/:id', scanController.getScanById);
router.delete('/:id', scanController.deleteScan);

module.exports = router;