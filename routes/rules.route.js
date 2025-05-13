const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rules.controller');

router.get("/", rulesController.getAllRules);
router.get("/:id", rulesController.getRuleById);

module.exports = router;
