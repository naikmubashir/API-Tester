const express= require('express');
const router = express.Router();
const requestController= require('../controllers/request.controller')
const Request= require('../models/Request');

router.get('/', requestController.getAllRequests);
router.get('/by-apiinfo/:apiInfoId', requestController.getRequestsByApiInfo);

router.delete('/delete/all', requestController.deleteAllRequests);
router.delete('/delete/:id', requestController.deleteRequest);

module.exports=router