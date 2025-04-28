const express= require('express');
const router=express.Router();
const yamlRulesController= require('../controllers/yamlRules.controller')

router.get("/",yamlRulesController.getAllYamlRules);
router.post("/",yamlRulesController.createNewYamlRule);
router.put("/:id",yamlRulesController.updateYamlRule);
router.delete("/:id",yamlRulesController.deleteYamlRule);


module.exports=router;