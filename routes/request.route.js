const express= require('express');
const router = express.Router();
const requestController= require('../controllers/request.controller')
const Request= require('../models/Request');

router.get('/', requestController.getAllRequests);
router.delete('/:id', requestController.deleteRequest);
router.delete('/', requestController.deleteAllRequests);

module.exports=router