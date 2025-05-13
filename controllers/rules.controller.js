const { RULES } = require('../services/rule.service');

exports.getAllRules = async (req, res) => {
    try {
        // Convert the RULES object into an array of rule objects
        const rules = Object.entries(RULES).map(([id, rule]) => ({
            _id: id,
            name: rule.name,
            description: rule.description
        }));

        if (rules.length === 0) {
            return res.status(404).json({ message: "No rules found." });
        }

        res.status(200).json({ 
            message: "Rules retrieved successfully.", 
            data: rules 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "An error occurred while retrieving rules.", 
            error: error.message 
        });
    }
};

exports.getRuleById = async (req, res) => {
    try {
        const ruleId = req.params.id;
        const rule = RULES[ruleId];

        if (!rule) {
            return res.status(404).json({ message: "Rule not found." });
        }

        res.status(200).json({ 
            message: "Rule retrieved successfully.", 
            data: {
                _id: ruleId,
                name: rule.name,
                description: rule.description
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "An error occurred while retrieving the rule.", 
            error: error.message 
        });
    }
};
