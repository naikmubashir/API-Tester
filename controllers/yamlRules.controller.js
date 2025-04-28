const YamlRule= require('../models/YamlRule')

exports.getAllYamlRules = async (req, res) => {
    try {
        console.log("REEEQQQ",req?.method)
        const rules = await YamlRule.find();
        if (rules.length === 0) {
            return res.status(404).json({ message: "No YAML rules found." });
        }
        res.status(200).json({ message: "YAML rules retrieved successfully.", data: rules });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving YAML rules.", error: error.message });
    }
};
exports.createNewYamlRule = async (req, res) => {
    try {
        const { name, content, description } = req.body;

        // Validate required fields
        if (!name || !content) {
            return res.status(400).json({ message: "Name and content are required fields." });
        }

        const newRule = new YamlRule({ name, content, description });
        const savedRule = await newRule.save();

        res.status(201).json({ message: "YAML rule created successfully.", data: savedRule });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ message: "A YAML rule with this name already exists." });
        }
        res.status(500).json({ message: "An error occurred while creating the YAML rule.", error: error.message });
    }
};

exports.updateYamlRule = async (req, res)=>{
    try {
        const { name, content, description } = req.body;

        // Validate required fields
        if (!name || !content) {
            return res.status(400).json({ message: "Name and content are required fields." });
        }

        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }

        const updatedRule = await YamlRule.findByIdAndUpdate(
            req.params.id,
            { name, content, description },
            { new: true, runValidators: true }
        );

        if (!updatedRule) {
            return res.status(404).json({ message: "YAML rule not found." });
        }

        res.status(200).json({ message: "YAML rule updated successfully.", data: updatedRule });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the YAML rule.", error: error.message });
    }
}


exports.deleteYamlRule= async (req, res)=>{
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        const deletedRule = await YamlRule.findByIdAndDelete(req.params.id);

        if (!deletedRule) {
            return res.status(404).json({ message: "YAML rule not found." });
        }

        res.status(200).json({ message: "YAML rule deleted successfully.", data: deletedRule });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the YAML rule.", error: error.message });
    }
}