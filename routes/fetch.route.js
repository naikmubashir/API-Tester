const express= require('express');
const router = express.Router();
const fetchController= require('../controllers/fetch.controller')
const Request= require('../models/Request');

router.post('/', fetchController.fetchAndStoreSwagger);


module.exports=router