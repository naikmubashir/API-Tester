const express= require('express');
const router = express.Router();
const requestController= require('../controllers/request.controller')
const Request= require('../models/Request');

router.get('/', requestController.getAllRequests);


module.exports=router